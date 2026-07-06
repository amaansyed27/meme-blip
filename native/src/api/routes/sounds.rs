use anyhow::anyhow;
use axum::{extract::{Multipart, Path, State}, http::HeaderMap, Json};
use std::fs;
use uuid::Uuid;

use crate::models::{AssignHotkeyRequest, SoundClip, UpdateSoundRequest};

use super::super::{auth::verify, ApiError, SharedState};

pub(crate) async fn list_sounds(
    State(state): State<SharedState>,
    headers: HeaderMap,
) -> Result<Json<Vec<SoundClip>>, ApiError> {
    verify(&headers, &state)?;
    Ok(Json(state.storage.sounds()))
}

pub(crate) async fn list_boards(
    State(state): State<SharedState>,
    headers: HeaderMap,
) -> Result<Json<Vec<String>>, ApiError> {
    verify(&headers, &state)?;
    let mut boards = Vec::new();
    for sound in state.storage.sounds() {
        if !boards.contains(&sound.board) {
            boards.push(sound.board);
        }
    }
    Ok(Json(boards))
}

pub(crate) async fn import_sound(
    State(state): State<SharedState>,
    headers: HeaderMap,
    mut multipart: Multipart,
) -> Result<Json<SoundClip>, ApiError> {
    verify(&headers, &state)?;

    let mut file_name = None;
    let mut file_bytes = None;
    let mut board = String::from("Meme Kit");
    let mut hotkey = String::new();
    let mut volume: u8 = 80;

    while let Some(field) = multipart.next_field().await? {
        let name = field.name().unwrap_or_default().to_string();
        match name.as_str() {
            "file" => {
                file_name = field.file_name().map(|value| value.to_string());
                file_bytes = Some(field.bytes().await?.to_vec());
            }
            "board" => board = field.text().await.unwrap_or_else(|_| String::from("Meme Kit")),
            "hotkey" => hotkey = field.text().await.unwrap_or_default(),
            "volume" => {
                volume = field
                    .text()
                    .await
                    .unwrap_or_else(|_| String::from("80"))
                    .parse()
                    .unwrap_or(80)
            }
            _ => {}
        }
    }

    let original = file_name.ok_or_else(|| anyhow!("missing file"))?;
    let bytes = file_bytes.ok_or_else(|| anyhow!("missing file bytes"))?;
    let extension = original.rsplit('.').next().unwrap_or("audio");
    let id = Uuid::new_v4().to_string();
    let stored_path = state.storage.sounds_dir().join(format!("{id}.{extension}"));
    fs::write(&stored_path, bytes)?;

    let display_name = original
        .rsplit_once('.')
        .map(|pair| pair.0)
        .unwrap_or(&original)
        .to_string();

    let sound = SoundClip {
        id,
        name: display_name,
        board,
        key: if hotkey.is_empty() { String::from("Unassigned") } else { hotkey },
        volume: volume.clamp(0, 150),
        duration: String::from("--"),
        color: String::from("mint"),
        file_path: stored_path.to_string_lossy().to_string(),
    };

    Ok(Json(state.storage.add_sound(sound)?))
}

pub(crate) async fn update_sound(
    State(state): State<SharedState>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(payload): Json<UpdateSoundRequest>,
) -> Result<Json<SoundClip>, ApiError> {
    verify(&headers, &state)?;
    let mut sound = state.storage.find_sound(&id).ok_or_else(|| anyhow!("sound not found"))?;
    if let Some(name) = payload.name { sound.name = name; }
    if let Some(board) = payload.board { sound.board = board; }
    if let Some(key) = payload.key { sound.key = key; }
    if let Some(volume) = payload.volume { sound.volume = volume.clamp(0, 150); }
    if let Some(color) = payload.color { sound.color = color; }
    Ok(Json(state.storage.update_sound(sound)?))
}

pub(crate) async fn play_sound(
    State(state): State<SharedState>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<SoundClip>, ApiError> {
    verify(&headers, &state)?;
    let sound = state.storage.find_sound(&id).ok_or_else(|| anyhow!("sound not found"))?;
    let settings = state.storage.settings();
    state.audio.play(&sound, settings.output_device_id, settings.monitor_device_id)?;
    Ok(Json(sound))
}

pub(crate) async fn stop_all(
    State(state): State<SharedState>,
    headers: HeaderMap,
) -> Result<Json<serde_json::Value>, ApiError> {
    verify(&headers, &state)?;
    state.audio.stop_all();
    Ok(Json(serde_json::json!({ "ok": true })))
}

pub(crate) async fn assign_hotkey(
    State(state): State<SharedState>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(payload): Json<AssignHotkeyRequest>,
) -> Result<Json<SoundClip>, ApiError> {
    verify(&headers, &state)?;
    let mut sound = state.storage.find_sound(&id).ok_or_else(|| anyhow!("sound not found"))?;
    sound.key = payload.hotkey;
    Ok(Json(state.storage.update_sound(sound)?))
}

pub(crate) async fn delete_sound(
    State(state): State<SharedState>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<serde_json::Value>, ApiError> {
    verify(&headers, &state)?;
    state.storage.delete_sound(&id)?;
    Ok(Json(serde_json::json!({ "ok": true })))
}
