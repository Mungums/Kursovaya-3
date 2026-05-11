use crate::db::DbPool;
use serde::{Serialize, Deserialize};
use tauri::State;
use sqlx::{query, Row};
use chrono::{NaiveDate, NaiveDateTime};

// ---------- DTO ----------
#[derive(Debug, Serialize)]
pub struct Client {
    pub id: i32,
    pub user_id: i32,
    pub full_name: String,
    pub phone: String,
    pub email: Option<String>,
    pub birth_date: Option<NaiveDate>,
    pub medical_contraindications: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateClientInput {
    pub login: String,
    pub password: String,
    pub full_name: String,
    pub phone: String,
    pub email: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateAppointmentInput {
    pub client_user_id: i32,
    pub master_id: i32,
    pub service_id: i32,
    pub room_id: i32,
    pub start_time: NaiveDateTime,
    pub end_time: NaiveDateTime,
    pub comment: Option<String>,
    pub use_abonement: bool,
}

#[derive(Debug, Serialize)]
pub struct RevenueReport {
    pub total_revenue: f64,
    pub period_start: NaiveDate,
    pub period_end: NaiveDate,
}

#[derive(Debug, Serialize)]
pub struct Service {
    pub id: i32,
    pub name: String,
    pub duration_minutes: i32,
    pub price: f64,
}

// ---------- helper ----------
fn hash_password(pwd: &str) -> Result<String, String> {
    bcrypt::hash(pwd, bcrypt::DEFAULT_COST).map_err(|e| e.to_string())
}

// ---------- commands ----------
#[tauri::command]
pub async fn create_client(
    state: State<'_, DbPool>,
    input: CreateClientInput,
) -> Result<i32, String> {
    let mut tx = state.begin().await.map_err(|e| e.to_string())?;
    let password_hash = hash_password(&input.password)?;

    let row = query(
        "INSERT INTO users (login, password_hash, full_name, email, phone)
         VALUES ($1, $2, $3, $4, $5) RETURNING id"
    )
    .bind(&input.login)
    .bind(&password_hash)
    .bind(&input.full_name)
    .bind(&input.email)
    .bind(&input.phone)
    .fetch_one(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;
    let user_id: i32 = row.get(0);

    query(
        "INSERT INTO user_roles (user_id, role_id) VALUES ($1, (SELECT id FROM roles WHERE name = 'Клиент'))"
    )
    .bind(user_id)
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    query("INSERT INTO client_profiles (user_id) VALUES ($1)")
        .bind(user_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    tx.commit().await.map_err(|e| e.to_string())?;
    Ok(user_id)
}

#[tauri::command]
pub async fn get_clients(state: State<'_, DbPool>) -> Result<Vec<Client>, String> {
    let rows = query(
        "SELECT u.id, u.id, u.full_name, u.phone, u.email, cp.birth_date, cp.medical_contraindications
         FROM users u
         JOIN client_profiles cp ON u.id = cp.user_id"
    )
    .fetch_all(&*state)
    .await
    .map_err(|e| e.to_string())?;
    let mut clients = Vec::new();
    for row in rows {
        clients.push(Client {
            id: row.get(0),
            user_id: row.get(1),
            full_name: row.get(2),
            phone: row.get(3),
            email: row.get(4),
            birth_date: row.get(5),
            medical_contraindications: row.get(6),
        });
    }
    Ok(clients)
}

#[tauri::command]
pub async fn create_appointment(
    state: State<'_, DbPool>,
    input: CreateAppointmentInput,
) -> Result<i32, String> {
    let mut tx = state.begin().await.map_err(|e| e.to_string())?;

    // Проверка конфликта времени
    let conflict = query(
        "SELECT id FROM appointments WHERE master_id = $1 AND start_time < $2 AND end_time > $3"
    )
    .bind(input.master_id)
    .bind(input.end_time)
    .bind(input.start_time)
    .fetch_optional(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;
    if conflict.is_some() {
        return Err("Мастер уже занят в это время".into());
    }

    // Списание абонемента, если запрашивалось
    if input.use_abonement {
        let abon = query(
            "SELECT id, sessions_remaining FROM abonements
             WHERE client_user_id = $1 AND status = 'active' AND expiry_date >= CURRENT_DATE
             ORDER BY expiry_date LIMIT 1"
        )
        .bind(input.client_user_id)
        .fetch_optional(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;
        if let Some(row) = abon {
            let remaining: i32 = row.get(1);
            if remaining > 0 {
                query("UPDATE abonements SET sessions_remaining = sessions_remaining - 1 WHERE id = $1")
                    .bind(row.get::<i32, _>(0))
                    .execute(&mut *tx)
                    .await
                    .map_err(|e| e.to_string())?;
            } else {
                return Err("Недостаточно сеансов в абонементе".into());
            }
        } else {
            return Err("У клиента нет активного абонемента".into());
        }
    }

    // Создание записи
    let row = query(
        "INSERT INTO appointments (client_user_id, master_id, service_id, room_id, start_time, end_time, status, comment)
         VALUES ($1, $2, $3, $4, $5, $6, 'scheduled', $7) RETURNING id"
    )
    .bind(input.client_user_id)
    .bind(input.master_id)
    .bind(input.service_id)
    .bind(input.room_id)
    .bind(input.start_time)
    .bind(input.end_time)
    .bind(input.comment)
    .fetch_one(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;
    let appointment_id: i32 = row.get(0);

    tx.commit().await.map_err(|e| e.to_string())?;
    Ok(appointment_id)
}

#[tauri::command]
pub async fn get_revenue_report(
    state: State<'_, DbPool>,
    start_date: NaiveDate,
    end_date: NaiveDate,
) -> Result<RevenueReport, String> {
    let row = query(
        "SELECT COALESCE(SUM(amount), 0) FROM payments p
         JOIN appointments a ON p.appointment_id = a.id
         WHERE a.start_time::date BETWEEN $1 AND $2"
    )
    .bind(start_date)
    .bind(end_date)
    .fetch_one(&*state)
    .await
    .map_err(|e| e.to_string())?;
    let total: f64 = row.get(0);
    Ok(RevenueReport {
        total_revenue: total,
        period_start: start_date,
        period_end: end_date,
    })
}

#[tauri::command]
pub async fn get_services(state: State<'_, DbPool>) -> Result<Vec<Service>, String> {
    let rows = query("SELECT id, name, duration_minutes, price FROM services")
        .fetch_all(&*state)
        .await
        .map_err(|e| e.to_string())?;
    let mut services = Vec::new();
    for row in rows {
        services.push(Service {
            id: row.get(0),
            name: row.get(1),
            duration_minutes: row.get(2),
            price: row.get(3),
        });
    }
    Ok(services)
}

#[tauri::command]
pub async fn update_client_profile(
    state: State<'_, DbPool>,
    user_id: i32,
    medical_contraindications: Option<String>,
) -> Result<(), String> {
    query("UPDATE client_profiles SET medical_contraindications = $1 WHERE user_id = $2")
        .bind(medical_contraindications)
        .bind(user_id)
        .execute(&*state)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}