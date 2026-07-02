use serde::{Deserialize, Serialize};
use sqlx::{PgPool, Row};
use tauri::State;
use bcrypt::{hash, verify, DEFAULT_COST};
use printpdf::*;
use std::io::{Cursor, BufWriter};

// ---------- Регистрация ----------
#[derive(Debug, Deserialize)]
pub struct RegisterInput {
    pub login: String,
    pub password: String,
    pub full_name: String,
    pub phone: String,
    pub email: Option<String>,
    pub role: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct RegisterResponse {
    pub user_id: i32,
    pub message: String,
}

#[tauri::command]
pub async fn register_user(
    pool: State<'_, PgPool>,
    input: RegisterInput,
) -> Result<RegisterResponse, String> {
    // Проверка существования логина (без макроса)
    let exists: Option<i32> = sqlx::query(
        "SELECT id FROM users WHERE login = $1"
    )
    .bind(&input.login)
    .fetch_optional(&*pool)
    .await
    .map_err(|e| format!("Ошибка БД: {}", e))?
    .map(|row| row.get(0));

    if exists.is_some() {
        return Err("Логин уже занят".into());
    }

    let password_hash = hash(&input.password, DEFAULT_COST)
        .map_err(|e| format!("Ошибка хэширования пароля: {}", e))?;

    let mut tx = pool.begin()
        .await
        .map_err(|e| format!("Ошибка начала транзакции: {}", e))?;

    // Вставка пользователя (без макроса)
    let row = sqlx::query(
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
    .map_err(|e| format!("Ошибка вставки пользователя: {}", e))?;
    let user_id: i32 = row.get(0);

    let role_name = input.role.as_deref().unwrap_or("Клиент");

    // Получение ID роли (без макроса)
    let role_row = sqlx::query(
        "SELECT id FROM roles WHERE name = $1"
    )
    .bind(role_name)
    .fetch_one(&mut *tx)
    .await
    .map_err(|e| format!("Роль '{}' не найдена: {}", role_name, e))?;
    let role_id: i32 = role_row.get(0);

    // Назначение роли (без макроса)
    sqlx::query(
        "INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)"
    )
    .bind(user_id)
    .bind(role_id)
    .execute(&mut *tx)
    .await
    .map_err(|e| format!("Ошибка назначения роли: {}", e))?;

    // Создание профиля
    if role_name == "Клиент" {
        sqlx::query(
            "INSERT INTO client_profiles (user_id) VALUES ($1)"
        )
        .bind(user_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| format!("Ошибка создания клиентского профиля: {}", e))?;
    } else {
        sqlx::query(
            "INSERT INTO employee_profiles (user_id) VALUES ($1)"
        )
        .bind(user_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| format!("Ошибка создания профиля сотрудника: {}", e))?;

        if role_name == "Мастер" {
            sqlx::query(
                "INSERT INTO masters (employee_user_id, specialization) VALUES ($1, $2)"
            )
            .bind(user_id)
            .bind("Не указана")
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Ошибка создания записи мастера: {}", e))?;
        }
    }

    tx.commit()
        .await
        .map_err(|e| format!("Ошибка сохранения транзакции: {}", e))?;

    Ok(RegisterResponse {
        user_id,
        message: format!("Пользователь {} успешно зарегистрирован", input.login),
    })
}

// ---------- Вход ----------
#[derive(Debug, Deserialize)]
pub struct LoginInput {
    pub login: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct LoginResponse {
    pub user_id: i32,
    pub full_name: String,
    pub role: String,
}

#[tauri::command]
pub async fn login_user(
    pool: State<'_, PgPool>,
    input: LoginInput,
) -> Result<LoginResponse, String> {
    let user_row = sqlx::query(
        "SELECT id, password_hash, full_name FROM users WHERE login = $1"
    )
    .bind(&input.login)
    .fetch_optional(&*pool)
    .await
    .map_err(|e| format!("Ошибка БД: {}", e))?;

    let user = user_row.ok_or("Пользователь с таким логином не найден")?;

    let user_id: i32 = user.get(0);
    let password_hash: String = user.get(1);
    let full_name: String = user.get(2);

    let is_valid = verify(&input.password, &password_hash)
        .map_err(|e| format!("Ошибка проверки пароля: {}", e))?;

    if !is_valid {
        return Err("Неверный пароль".into());
    }

    let role_row = sqlx::query(
        "SELECT r.name FROM roles r
         JOIN user_roles ur ON r.id = ur.role_id
         WHERE ur.user_id = $1
         LIMIT 1"
    )
    .bind(user_id)
    .fetch_one(&*pool)
    .await
    .map_err(|e| format!("Ошибка получения роли: {}", e))?;

    let role: String = role_row.get(0);

    Ok(LoginResponse {
        user_id,
        full_name,
        role,
    })
}

// ---------- Профиль ----------
#[derive(Debug, Serialize)]
pub struct Profile {
    pub user_id: i32,
    pub login: String,
    pub full_name: String,
    pub email: Option<String>,
    pub phone: String,
    pub role: String,
    // Поля из client_profiles (для клиентов)
    pub birth_date: Option<chrono::NaiveDate>,
    pub medical_contraindications: Option<String>,
    pub discount_percent: Option<i32>,
    pub card_number: Option<String>,
    // Поля из employee_profiles (для сотрудников)
    pub position: Option<String>,
    pub hire_date: Option<chrono::NaiveDate>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProfileInput {
    pub full_name: Option<String>,
    pub phone: Option<String>,
    pub email: Option<String>,
    pub medical_contraindications: Option<String>,
    pub birth_date: Option<chrono::NaiveDate>,
}

#[tauri::command]
pub async fn get_profile(
    pool: State<'_, PgPool>,
    user_id: i32,
) -> Result<Profile, String> {
    // 1. Получаем пользователя, роль и профиль
    let row = sqlx::query(
        r#"
        SELECT 
            u.id, u.login, u.full_name, u.email, u.phone,
            r.name as role,
            cp.birth_date, cp.medical_contraindications, cp.discount_percent, cp.card_number,
            ep.position, ep.hire_date
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.id
        LEFT JOIN client_profiles cp ON u.id = cp.user_id
        LEFT JOIN employee_profiles ep ON u.id = ep.user_id
        WHERE u.id = $1
        LIMIT 1
        "#
    )
    .bind(user_id)
    .fetch_one(&*pool)
    .await
    .map_err(|e| format!("Ошибка получения профиля: {}", e))?;

    // 2. Извлекаем данные (используем .get с указанием типа)
    let profile = Profile {
        user_id: row.get(0),
        login: row.get(1),
        full_name: row.get(2),
        email: row.get(3),
        phone: row.get(4),
        role: row.get(5),
        birth_date: row.get(6),
        medical_contraindications: row.get(7),
        discount_percent: row.try_get::<i32, _>(8).ok(),
        card_number: row.get(9),
        position: row.get(10),
        hire_date: row.get(11),
    };

    Ok(profile)
}

#[tauri::command]
pub async fn update_profile(
    pool: State<'_, PgPool>,
    user_id: i32,
    input: UpdateProfileInput,
) -> Result<String, String> {
    // 1. Обновляем основную таблицу users
    // 1. Обновляем основную таблицу users
if let Some(full_name) = input.full_name {
    sqlx::query("UPDATE users SET full_name = $1 WHERE id = $2")
        .bind(full_name)
        .bind(user_id)
        .execute(&*pool)
        .await
        .map_err(|e| format!("Ошибка обновления ФИО: {}", e))?;
}

if let Some(phone) = input.phone {
    sqlx::query("UPDATE users SET phone = $1 WHERE id = $2")
        .bind(phone)
        .bind(user_id)
        .execute(&*pool)
        .await
        .map_err(|e| format!("Ошибка обновления телефона: {}", e))?;
}

if let Some(email) = input.email {
    sqlx::query("UPDATE users SET email = $1 WHERE id = $2")
        .bind(email)
        .bind(user_id)
        .execute(&*pool)
        .await
        .map_err(|e| format!("Ошибка обновления email: {}", e))?;
}

// 2. Обновляем дату рождения (если передана)
if let Some(birth_date) = input.birth_date {
    // Проверяем, есть ли запись в client_profiles
    let row = sqlx::query(
        "SELECT 1 FROM client_profiles WHERE user_id = $1"
    )
    .bind(user_id)
    .fetch_optional(&*pool)
    .await
    .map_err(|e| format!("Ошибка проверки профиля: {}", e))?;

    if row.is_some() {
        sqlx::query(
            "UPDATE client_profiles SET birth_date = $1 WHERE user_id = $2"
        )
        .bind(birth_date)
        .bind(user_id)
        .execute(&*pool)
        .await
        .map_err(|e| format!("Ошибка обновления даты рождения: {}", e))?;
    } else {
        // Если профиля нет (редкий случай), можно создать или вернуть ошибку
        return Err("Профиль клиента не найден".into());
    }
}

// ... далее обновление медицинских противопоказаний (остаётся как было)

    // 2. Обновляем медицинские противопоказания (если есть)
    if let Some(contraindications) = input.medical_contraindications {
        // Проверяем, есть ли запись в client_profiles
        let row = sqlx::query(
            "SELECT 1 FROM client_profiles WHERE user_id = $1"
        )
        .bind(user_id)
        .fetch_optional(&*pool)
        .await
        .map_err(|e| format!("Ошибка проверки профиля: {}", e))?;

        if row.is_some() {
            sqlx::query(
                "UPDATE client_profiles SET medical_contraindications = $1 WHERE user_id = $2"
            )
            .bind(contraindications)
            .bind(user_id)
            .execute(&*pool)
            .await
            .map_err(|e| format!("Ошибка обновления противопоказаний: {}", e))?;
        } else {
            return Err("Пользователь не является клиентом, нельзя обновить противопоказания".into());
        }
    }

    Ok("Профиль успешно обновлён".into())
}

// ---------- Услуги ----------
#[derive(Debug, Serialize)]
pub struct Service {
    pub id: i32,
    pub name: String,
    pub duration_minutes: i32,
    pub price: f64,
    pub description: Option<String>,
}

#[tauri::command]
pub async fn get_services(pool: State<'_, PgPool>) -> Result<Vec<Service>, String> {
    let rows = sqlx::query(
        "SELECT id, name, duration_minutes, price, description FROM services"
    )
    .fetch_all(&*pool)
    .await
    .map_err(|e| format!("Ошибка получения услуг: {}", e))?;

    let mut services = Vec::new();
    for row in rows {
        services.push(Service {
            id: row.get(0),
            name: row.get(1),
            duration_minutes: row.get(2),
            price: row.try_get::<f64, _>(3).unwrap_or(0.0),  // если NOT NULL, но на всякий случай,
            description: row.get(4),
        });
    }
    Ok(services)
}

// ---------- Мастера ----------
#[derive(Debug, Serialize)]
pub struct Master {
    pub id: i32,
    pub full_name: String,
    pub specialization: Option<String>,
    pub rating: Option<f64>,   // rating может быть NULL
}

#[tauri::command]
pub async fn get_masters(pool: State<'_, PgPool>) -> Result<Vec<Master>, String> {
    let rows = sqlx::query(
        "SELECT m.id, u.full_name, m.specialization, m.rating
         FROM masters m
         JOIN employee_profiles ep ON m.employee_user_id = ep.user_id
         JOIN users u ON ep.user_id = u.id"
    )
    .fetch_all(&*pool)
    .await
    .map_err(|e| format!("Ошибка получения мастеров: {}", e))?;

    let mut masters = Vec::new();
    for row in rows {
        masters.push(Master {
            id: row.get(0),
            full_name: row.get(1),
            specialization: row.get(2),
            rating: row.try_get::<f64, _>(3).ok(), // <-- исправлено
        });
    }
    Ok(masters)
}

#[derive(Debug, Serialize)]
pub struct MasterForService {
    pub id: i32,
    pub full_name: String,
    pub specialization: Option<String>,
    pub rating: Option<f64>,
}

#[tauri::command]
pub async fn get_masters_for_service(
    pool: State<'_, PgPool>,
    service_id: i32,
) -> Result<Vec<MasterForService>, String> {
    let rows = sqlx::query(
        r#"
        SELECT m.id, u.full_name, m.specialization, m.rating
        FROM masters m
        JOIN employee_profiles ep ON m.employee_user_id = ep.user_id
        JOIN users u ON ep.user_id = u.id
        JOIN master_services ms ON m.id = ms.master_id
        WHERE ms.service_id = $1
        "#
    )
    .bind(service_id)
    .fetch_all(&*pool)
    .await
    .map_err(|e| format!("Ошибка получения мастеров для услуги: {}", e))?;

    let mut masters = Vec::new();
    for row in rows {
        masters.push(MasterForService {
            id: row.get(0),
            full_name: row.get(1),
            specialization: row.get(2),
            rating: row.try_get::<f64, _>(3).ok(),
        });
    }
    Ok(masters)
}


// ---------- Create Appointment (транзакция) ----------
#[derive(Debug, Deserialize)]
pub struct CreateAppointmentInput {
    pub client_user_id: i32,
    pub master_id: i32,
    pub service_id: i32,
    pub room_id: i32,
    pub start_time: chrono::NaiveDateTime,
    pub end_time: chrono::NaiveDateTime,
    pub comment: Option<String>,
    pub use_abonement: bool,
}

#[tauri::command]
pub async fn create_appointment(
    pool: State<'_, PgPool>,
    input: CreateAppointmentInput,
) -> Result<i32, String> {
    let mut tx = pool.begin()
        .await
        .map_err(|e| format!("Ошибка начала транзакции: {}", e))?;

    // 1. Проверка конфликта времени
    let conflict = sqlx::query(
        "SELECT id FROM appointments WHERE master_id = $1 AND start_time < $2 AND end_time > $3"
    )
    .bind(input.master_id)
    .bind(input.end_time)
    .bind(input.start_time)
    .fetch_optional(&mut *tx)
    .await
    .map_err(|e| format!("Ошибка проверки конфликта: {}", e))?;

    if conflict.is_some() {
        return Err("Мастер уже занят в это время".into());
    }

    // 2. Если используется абонемент – списываем
    if input.use_abonement {
        let abon = sqlx::query(
            "SELECT id, sessions_remaining FROM abonements 
             WHERE client_user_id = $1 AND status = 'active' AND expiry_date >= CURRENT_DATE
             ORDER BY expiry_date LIMIT 1"
        )
        .bind(input.client_user_id)
        .fetch_optional(&mut *tx)
        .await
        .map_err(|e| format!("Ошибка поиска абонемента: {}", e))?;

        if let Some(row) = abon {
            let remaining: i32 = row.try_get(1).unwrap_or(0);
            if remaining > 0 {
                sqlx::query(
                    "UPDATE abonements SET sessions_remaining = sessions_remaining - 1 WHERE id = $1"
                )
                .bind(row.try_get::<i32, _>(0).unwrap_or(0))
                .execute(&mut *tx)
                .await
                .map_err(|e| format!("Ошибка списания абонемента: {}", e))?;
            } else {
                return Err("Недостаточно сеансов в абонементе".into());
            }
        } else {
            return Err("У клиента нет активного абонемента".into());
        }
    }

    // 3. Создание записи
    let row = sqlx::query(
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
    .map_err(|e| format!("Ошибка создания записи: {}", e))?;

    let appointment_id: i32 = row.try_get(0).unwrap_or(0);

    tx.commit()
        .await
        .map_err(|e| format!("Ошибка сохранения транзакции: {}", e))?;

    Ok(appointment_id)
}

// ---------- Мои записи ----------
#[derive(Debug, Serialize)]
pub struct AppointmentInfo {
    pub id: i32,
    pub service_name: String,
    pub master_name: String,
    pub start_time: chrono::NaiveDateTime,
    pub end_time: chrono::NaiveDateTime,
    pub status: String,
    pub price: f64,
}

#[tauri::command]
pub async fn get_client_appointments(
    pool: State<'_, PgPool>,
    client_user_id: i32,
) -> Result<Vec<AppointmentInfo>, String> {
    let rows = sqlx::query(
        r#"
        SELECT 
            a.id,
            s.name as service_name,
            u.full_name as master_name,
            a.start_time,
            a.end_time,
            a.status,
            s.price
        FROM appointments a
        JOIN services s ON a.service_id = s.id
        JOIN masters m ON a.master_id = m.id
        JOIN employee_profiles ep ON m.employee_user_id = ep.user_id
        JOIN users u ON ep.user_id = u.id
        WHERE a.client_user_id = $1
        ORDER BY a.start_time DESC
        "#
    )
    .bind(client_user_id)
    .fetch_all(&*pool)
    .await
    .map_err(|e| format!("Ошибка получения записей: {}", e))?;

    let mut appointments = Vec::new();
    for row in rows {
        appointments.push(AppointmentInfo {
            id: row.get(0),
            service_name: row.get(1),
            master_name: row.get(2),
            start_time: row.get(3),
            end_time: row.get(4),
            status: row.get(5),
            price: row.try_get(6).unwrap_or(0.0),
        });
    }
    Ok(appointments)
}

#[tauri::command]
pub async fn cancel_appointment(
    pool: State<'_, PgPool>,
    appointment_id: i32,
) -> Result<String, String> {
    sqlx::query("UPDATE appointments SET status = 'cancelled' WHERE id = $1")
        .bind(appointment_id)
        .execute(&*pool)
        .await
        .map_err(|e| format!("Ошибка отмены записи: {}", e))?;
    Ok("Запись отменена".into())
}

// ---------- Управление пользователями (админ) ----------
#[derive(Debug, Serialize)]
pub struct UserInfo {
    pub id: i32,
    pub login: String,
    pub full_name: String,
    pub email: Option<String>,
    pub phone: String,
    pub role: String,
}

#[tauri::command]
pub async fn get_users(pool: State<'_, PgPool>) -> Result<Vec<UserInfo>, String> {
    let rows = sqlx::query(
        r#"
        SELECT 
            u.id,
            u.login,
            u.full_name,
            u.email,
            u.phone,
            COALESCE(r.name, 'Клиент') as role
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.id
        ORDER BY u.id
        "#
    )
    .fetch_all(&*pool)
    .await
    .map_err(|e| format!("Ошибка получения пользователей: {}", e))?;

    let mut users = Vec::new();
    for row in rows {
        users.push(UserInfo {
            id: row.get(0),
            login: row.get(1),
            full_name: row.get(2),
            email: row.get(3),
            phone: row.get(4),
            role: row.get(5),
        });
    }
    Ok(users)
}

#[derive(Debug, Deserialize)]
pub struct UpdateUserRoleInput {
    pub user_id: i32,
    pub role_name: String,
}

#[tauri::command]
pub async fn update_user_role(
    pool: State<'_, PgPool>,
    input: UpdateUserRoleInput,
) -> Result<String, String> {
    // Проверяем, существует ли роль
    let role_id: i32 = sqlx::query_scalar(
        "SELECT id FROM roles WHERE name = $1"
    )
    .bind(&input.role_name)
    .fetch_one(&*pool)
    .await
    .map_err(|_| format!("Роль '{}' не найдена", input.role_name))?;

    // Начинаем транзакцию
    let mut tx = pool.begin()
        .await
        .map_err(|e| format!("Ошибка начала транзакции: {}", e))?;

    // Удаляем все текущие роли пользователя
    sqlx::query("DELETE FROM user_roles WHERE user_id = $1")
        .bind(input.user_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| format!("Ошибка удаления старых ролей: {}", e))?;

    // Добавляем новую роль
    sqlx::query(
        "INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)"
    )
    .bind(input.user_id)
    .bind(role_id)
    .execute(&mut *tx)
    .await
    .map_err(|e| format!("Ошибка назначения роли: {}", e))?;

    tx.commit()
        .await
        .map_err(|e| format!("Ошибка сохранения транзакции: {}", e))?;

    Ok(format!("Роль пользователя обновлена на '{}'", input.role_name))
}

const FONT_BYTES: &[u8] = include_bytes!("../assets/Times New Roman.ttf");

#[tauri::command]
pub async fn generate_receipt(
    pool: State<'_, PgPool>,
    appointment_id: i32,
) -> Result<Vec<u8>, String> {
    // Получаем данные о записи
    let row = sqlx::query!(
        r#"
        SELECT 
            a.id,
            u.full_name as client_name,
            s.name as service_name,
            s.price,
            a.start_time,
            u_master.full_name as master_name
        FROM appointments a
        JOIN users u ON a.client_user_id = u.id
        JOIN services s ON a.service_id = s.id
        JOIN masters m ON a.master_id = m.id
        JOIN employee_profiles ep ON m.employee_user_id = ep.user_id
        JOIN users u_master ON ep.user_id = u_master.id
        WHERE a.id = $1
        "#,
        appointment_id
    )
    .fetch_one(&*pool)
    .await
    .map_err(|e| format!("Ошибка получения данных записи: {}", e))?;

    // Создаём PDF документ (A4: 210 x 297 мм)
    let (doc, page, layer) = PdfDocument::new(
        "Чек",
        Mm(210.0), 
        Mm(297.0), 
        "Layer 1",
    );
    let layer = doc.get_page(page).get_layer(layer);

    // 2. Читаем зашитый шрифт прямо из оперативной памяти через Cursor
    let mut font_reader = Cursor::new(FONT_BYTES);
    let font = doc.add_external_font(&mut font_reader)
        .map_err(|e| format!("Ошибка загрузки встроенного шрифта в PDF: {}", e))?;

    // Задаем координаты в миллиметрах (Mm)
    let start_y = 270.0; 
    let x_pos = Mm(20.0); 

    // Отрисовка текста на русском языке
    layer.use_text("Массажный салон «СПАРк»", 24.0, x_pos, Mm(start_y), &font);
    
    layer.use_text(format!("Чек № {}", row.id), 16.0, x_pos, Mm(start_y - 15.0), &font);
    
    layer.use_text(format!("Клиент: {}", row.client_name), 14.0, x_pos, Mm(start_y - 30.0), &font);
    
    layer.use_text(format!("Услуга: {}", row.service_name), 14.0, x_pos, Mm(start_y - 42.0), &font);
    
    layer.use_text(format!("Мастер: {}", row.master_name), 14.0, x_pos, Mm(start_y - 54.0), &font);

    let date_str = row.start_time.format("%d.%m.%Y %H:%M").to_string();
    layer.use_text(format!("Дата и время: {}", date_str), 14.0, x_pos, Mm(start_y - 66.0), &font);
    
    layer.use_text(format!("Сумма: {:.2} ₽", row.price), 16.0, x_pos, Mm(start_y - 80.0), &font);

    // Сохраняем PDF в Vec<u8> через BufWriter и Cursor
    let mut inner_bytes = Vec::new();
    {
        let mut buf_writer = BufWriter::new(Cursor::new(&mut inner_bytes));
        doc.save(&mut buf_writer).map_err(|e| format!("Ошибка сохранения PDF: {}", e))?;
    }

    Ok(inner_bytes)
}

#[tauri::command]
pub async fn open_file(path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("cmd")
            .args(&["/c", "start", "", &path])
            .spawn()
            .map_err(|e| format!("Ошибка открытия файла: {}", e))?;
    }
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Ошибка открытия файла: {}", e))?;
    }
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Ошибка открытия файла: {}", e))?;
    }
    Ok(())
}