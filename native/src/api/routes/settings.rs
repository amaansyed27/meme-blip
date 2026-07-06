use axum::{extract::State, http::HeaderMap, Json};

use crate::models::{
    AppSettings, SetActiveBoardRequest, SetInputDeviceRequest, SetMicPassthroughRequest,
    SetMonitorDeviceRequest, SetOutputDeviceRequest,
};

use super::super::{apply_mic_passthrough, auth::verify, ApiError, SharedState};

pub(crate) async fn get_settings(
    State(state): State<SharedState>,
    headers: HeaderMap,
) -> Result<Json<AppSettings>, ApiError> {
    verify(&headers, &state)?;
    Ok(Json(state.storage.settings()))
}

pub(crate) async fn set_output_device(
    State(state): State<SharedState>,
    headers: HeaderMap,
    Json(payload): Json<SetOutputDeviceRequest>,
) -> Result<Json<AppSettings>, ApiError> {
    verify(&headers, &state)?;
    let mut settings = state.storage.settings();
    settings.output_device_id = Some(payload.device_id);
    let saved = state.storage.set_settings(settings)?;
    apply_mic_passthrough(&state)?;
    Ok(Json(saved))
}

pub(crate) async fn set_monitor_device(
    State(state): State<SharedState>,
    headers: HeaderMap,
    Json(payload): Json<SetMonitorDeviceRequest>,
) -> Result<Json<AppSettings>, ApiError> {
    verify(&headers, &state)?;
    let mut settings = state.storage.settings();
    settings.monitor_device_id = payload.device_id;
    Ok(Json(state.storage.set_settings(settings)?))
}

pub(crate) async fn set_input_device(
    State(state): State<SharedState>,
    headers: HeaderMap,
    Json(payload): Json<SetInputDeviceRequest>,
) -> Result<Json<AppSettings>, ApiError> {
    verify(&headers, &state)?;
    let mut settings = state.storage.settings();
    settings.input_device_id = payload.device_id;
    let saved = state.storage.set_settings(settings)?;
    apply_mic_passthrough(&state)?;
    Ok(Json(saved))
}

pub(crate) async fn set_active_board(
    State(state): State<SharedState>,
    headers: HeaderMap,
    Json(payload): Json<SetActiveBoardRequest>,
) -> Result<Json<AppSettings>, ApiError> {
    verify(&headers, &state)?;
    let mut settings = state.storage.settings();
    settings.active_board = payload.board.filter(|board| !board.trim().is_empty());
    Ok(Json(state.storage.set_settings(settings)?))
}

pub(crate) async fn set_mic_passthrough(
    State(state): State<SharedState>,
    headers: HeaderMap,
    Json(payload): Json<SetMicPassthroughRequest>,
) -> Result<Json<AppSettings>, ApiError> {
    verify(&headers, &state)?;
    let mut settings = state.storage.settings();
    settings.mic_passthrough_enabled = payload.enabled;
    let saved = state.storage.set_settings(settings)?;
    apply_mic_passthrough(&state)?;
    Ok(Json(saved))
}
