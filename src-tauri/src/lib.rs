mod commands;
mod db;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle();
            tauri::async_runtime::block_on(async {
                let pool = db::create_pool().await.expect("Failed to create DB pool");
                handle.manage(pool);
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::create_client,
            commands::get_clients,
            commands::create_appointment,
            commands::get_revenue_report,
            commands::get_services,
            commands::update_client_profile,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}