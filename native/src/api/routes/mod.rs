pub mod devices;
pub mod settings;
pub mod sounds;
pub mod system;
pub mod updates;

use axum::{routing::{get, patch, post}, Router};

use super::SharedState;

pub(crate) fn router() -> Router<SharedState> {
    Router::new()
        .route("/health", get(system::health))
        .route("/driver/status", get(system::driver_status))
        .route("/sounds", get(sounds::list_sounds))
        .route("/sounds/import", post(sounds::import_sound))
        .route("/sounds/:id", patch(sounds::update_sound).delete(sounds::delete_sound))
        .route("/sounds/:id/play", post(sounds::play_sound))
        .route("/sounds/:id/hotkey", post(sounds::assign_hotkey))
        .route("/sounds/stop-all", post(sounds::stop_all))
        .route("/boards", get(sounds::list_boards))
        .route("/devices", get(devices::list_devices))
        .route("/devices/inputs", get(devices::list_input_devices))
        .route("/devices/test", post(devices::test_device))
        .route("/mixer/status", get(devices::mixer_status))
        .route("/settings", get(settings::get_settings))
        .route("/settings/output-device", post(settings::set_output_device))
        .route("/settings/monitor-device", post(settings::set_monitor_device))
        .route("/settings/input-device", post(settings::set_input_device))
        .route("/settings/active-board", post(settings::set_active_board))
        .route("/settings/mic-passthrough", post(settings::set_mic_passthrough))
        .route("/updates/check", get(updates::check_update))
        .route("/updates/download", post(updates::download_update))
}
