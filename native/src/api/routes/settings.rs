use anyhow::anyhow;
use axum::{extract::State, http::HeaderMap, Json};

use crate::models::{
    AppSettings, CreateBoardRequest, DeleteBoardRequest, SetActiveBoardRequest, SetFavoriteBoardRequest,
    SetInputDeviceRequest, SetMicPassthroughRequest, SetMonitorDeviceRequest, SetOutputDeviceRequest,
};

use super::super::{apply_mic_passthrough, auth::verify, ApiError, SharedState};

const DEFAULT_BOARD: &str = "Meme Kit";

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

pub(crate) async fn create_board(
    State(state): State<SharedState>,
    headers: HeaderMap,
    Json(payload): Json<CreateBoardRequest>,
) -> Result<Json<AppSettings>, ApiError> {
    verify(&headers, &state)?;
    let name = payload.name.trim();
    let mut settings = state.storage.settings();
    if !name.is_empty() && !settings.custom_boards.iter().any(|board| board.eq_ignore_ascii_case(name)) {
        settings.custom_boards.push(name.to_string());
    }
    settings.active_board = Some(name.to_string()).filter(|board| !board.is_empty());
    Ok(Json(state.storage.set_settings(settings)?))
}

pub(crate) async fn delete_board(
    State(state): State<SharedState>,
    headers: HeaderMap,
    Json(payload): Json<DeleteBoardRequest>,
) -> Result<Json<AppSettings>, ApiError> {
    verify(&headers, &state)?;
    let board = payload.name.trim();
    if board.is_empty() {
        return Err(anyhow!("missing board name").into());
    }
    if board.eq_ignore_ascii_case(DEFAULT_BOARD) {
        return Err(anyhow!("Meme Kit is the default board and cannot be deleted").into());
    }

    let mut settings = state.storage.settings();
    settings.custom_boards.retain(|item| !item.eq_ignore_ascii_case(board));
    settings.favorite_boards.retain(|item| !item.eq_ignore_ascii_case(board));
    if settings.active_board.as_ref().is_some_and(|active| active.eq_ignore_ascii_case(board)) {
        settings.active_board = None;
    }

    for mut sound in state.storage.sounds().into_iter().filter(|sound| sound.board.eq_ignore_ascii_case(board)) {
        sound.board = DEFAULT_BOARD.to_string();
        let _ = state.storage.update_sound(sound)?;
    }

    Ok(Json(state.storage.set_settings(settings)?))
}

pub(crate) async fn set_favorite_board(
    State(state): State<SharedState>,
    headers: HeaderMap,
    Json(payload): Json<SetFavoriteBoardRequest>,
) -> Result<Json<AppSettings>, ApiError> {
    verify(&headers, &state)?;
    let board = payload.board.trim();
    let mut settings = state.storage.settings();
    if !board.is_empty() {
        if payload.favorite {
            if !settings.favorite_boards.iter().any(|item| item.eq_ignore_ascii_case(board)) {
                settings.favorite_boards.push(board.to_string());
            }
        } else {
            settings.favorite_boards.retain(|item| !item.eq_ignore_ascii_case(board));
        }
    }
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
