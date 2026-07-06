use axum::{extract::State, http::HeaderMap, Json};

use crate::models::{AudioDevice, MixerStatus};

use super::super::{auth::verify, ApiError, SharedState};

pub(crate) async fn list_devices(
    State(state): State<SharedState>,
    headers: HeaderMap,
) -> Result<Json<Vec<AudioDevice>>, ApiError> {
    verify(&headers, &state)?;
    let settings = state.storage.settings();
    Ok(Json(state.audio.output_devices(settings.output_device_id, settings.monitor_device_id)?))
}

pub(crate) async fn list_input_devices(
    State(state): State<SharedState>,
    headers: HeaderMap,
) -> Result<Json<Vec<AudioDevice>>, ApiError> {
    verify(&headers, &state)?;
    let settings = state.storage.settings();
    Ok(Json(state.audio.input_devices(settings.input_device_id)?))
}

pub(crate) async fn test_device(
    State(state): State<SharedState>,
    headers: HeaderMap,
) -> Result<Json<serde_json::Value>, ApiError> {
    verify(&headers, &state)?;
    state.audio.stop_all();
    Ok(Json(serde_json::json!({ "ok": true })))
}

pub(crate) async fn mixer_status(
    State(state): State<SharedState>,
    headers: HeaderMap,
) -> Result<Json<MixerStatus>, ApiError> {
    verify(&headers, &state)?;
    let settings = state.storage.settings();
    Ok(Json(MixerStatus {
        input_device_id: settings.input_device_id,
        output_device_id: settings.output_device_id,
        monitor_device_id: settings.monitor_device_id,
        mic_passthrough_enabled: settings.mic_passthrough_enabled,
        intended_target_input: String::from("CABLE Output (VB-Audio Virtual Cable)"),
        intended_speaker_output: String::from("Existing system speakers/headphones"),
    }))
}
