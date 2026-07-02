mod db;
mod commands;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle();
            tauri::async_runtime::block_on(async {
                let pool = db::create_pool()
                    .await
                    .expect("Не удалось создать подключение к БД");
                handle.manage(pool);
            });
            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            commands::register_user,
            commands::login_user,
            commands::get_profile,
            commands::update_profile,
            commands::get_services,       // <-- добавить
            commands::get_masters,        // <-- добавить 
            commands::get_masters_for_service,
            commands::create_appointment,   // <-- добавить (для теста)
            commands::get_client_appointments,
            commands::cancel_appointment,
            commands::get_users,
            commands::update_user_role,
            commands::generate_receipt,
            commands::open_file,
        ])
        .run(tauri::generate_context!("tauri.conf.json"))
        .expect("error while running tauri application");
}