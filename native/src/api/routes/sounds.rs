use anyhow::{anyhow, Context};
use axum::{extract::{Multipart, Path, State}, http::HeaderMap, Json};
use std::fs;
use uuid::Uuid;

use crate::models::{AssignHotkeyRequest, ImportSoundUrlRequest, SoundClip, UpdateSoundRequest};

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
    let sound = persist_sound_bytes(&state, original, bytes, board, hotkey, volume)?;
    Ok(Json(state.storage.add_sound(sound)?))
}

pub(crate) async fn import_sound_url(
    State(state): State<SharedState>,
    headers: HeaderMap,
    Json(payload): Json<ImportSoundUrlRequest>,
) -> Result<Json<SoundClip>, ApiError> {
    verify(&headers, &state)?;

    let title = payload.title.trim();
    if title.is_empty() {
        return Err(anyhow!("missing sound title").into());
    }

    let mp3 = payload.mp3.trim();
    if !(mp3.starts_with("https://www.myinstants.com/media/sounds/") || mp3.starts_with("https://myinstants.com/media/sounds/")) {
        return Err(anyhow!("remote import only accepts MyInstants media URLs").into());
    }

    let response = reqwest::get(mp3).await.context("could not download remote sound")?;
    if !response.status().is_success() {
        return Err(anyhow!("remote sound download failed: {}", response.status()).into());
    }

    let bytes = response.bytes().await.context("could not read remote sound bytes")?;
    if bytes.len() > 20 * 1024 * 1024 {
        return Err(anyhow!("remote sound is too large; max 20 MB").into());
    }

    let file_name = format!("{}.mp3", sanitize_file_stem(title));
    let sound = persist_sound_bytes(
        &state,
        file_name,
        bytes.to_vec(),
        payload.board.unwrap_or_else(|| String::from("Meme Kit")),
        String::new(),
        payload.volume.unwrap_or(80),
    )?;

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

fn persist_sound_bytes(
    state: &SharedState,
    original: String,
    bytes: Vec<u8>,
    board: String,
    hotkey: String,
    volume: u8,
) -> Result<SoundClip, anyhow::Error> {
    let extension = original.rsplit('.').next().unwrap_or("audio");
    let id = Uuid::new_v4().to_string();
    let stored_path = state.storage.sounds_dir().join(format!("{id}.{extension}"));
    fs::write(&stored_path, bytes)?;

    let display_name = original
        .rsplit_once('.')
        .map(|pair| pair.0)
        .unwrap_or(&original)
        .to_string();

    Ok(SoundClip {
        id,
        name: display_name,
        board,
        key: if hotkey.is_empty() { String::from("Unassigned") } else { hotkey },
        volume: volume.clamp(0, 150),
        duration: String::from("--"),
        color: String::from("mint"),
        file_path: stored_path.to_string_lossy().to_string(),
    })
}

fn sanitize_file_stem(value: &str) -> String {
    let mut result = String::new();
    for ch in value.chars() {
        if ch.is_ascii_alphanumeric() {
            result.push(ch.to_ascii_lowercase());
        } else if ch.is_whitespace() || matches!(ch, '-' | '_' | '.') {
            if !result.ends_with('-') {
                result.push('-');
            }
        }
    }
    let trimmed = result.trim_matches('-').to_string();
    if trimmed.is_empty() { String::from("myinstants-sound") } else { trimmed }
}
