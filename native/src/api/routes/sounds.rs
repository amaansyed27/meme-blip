use anyhow::{anyhow, Context};
use axum::{extract::{Multipart, Path}, http::HeaderMap, Json};
use std::{fs, path::Path as FsPath};
use uuid::Uuid;

use crate::models::{AssignHotkeyRequest, ImportSoundUrlRequest, SoundClip, UpdateSoundRequest};

use super::super::{auth::verify, ApiError, SharedState};

const MAX_SOUND_BYTES: usize = 20 * 1024 * 1024;

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
                let original_name = field.file_name().map(|value| value.to_string());
                let bytes = field.bytes().await?;
                if bytes.is_empty() {
                    return Err(anyhow!("the selected audio file is empty").into());
                }
                if bytes.len() > MAX_SOUND_BYTES {
                    return Err(anyhow!("audio file is too large; max 20 MB").into());
                }
                file_name = original_name;
                file_bytes = Some(bytes.to_vec());
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

    let original = file_name.ok_or_else(|| anyhow!("missing audio file name"))?;
    let bytes = file_bytes.ok_or_else(|| anyhow!("missing audio file data"))?;
    let board = normalized_board(board);
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
    if bytes.len() > MAX_SOUND_BYTES {
        return Err(anyhow!("remote sound is too large; max 20 MB").into());
    }

    let file_name = format!("{}.mp3", sanitize_file_stem(title));
    let sound = persist_sound_bytes(
        &state,
        file_name,
        bytes.to_vec(),
        normalized_board(payload.board.unwrap_or_else(|| String::from("Meme Kit"))),
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

pub(crate) async fn preview_sound(
    State(state): State<SharedState>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<SoundClip>, ApiError> {
    verify(&headers, &state)?;
    let sound = state.storage.find_sound(&id).ok_or_else(|| anyhow!("sound not found"))?;
    state.audio.play(&sound, None, None)?;
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
    let extension = safe_extension(&original);
    let id = Uuid::new_v4().to_string();
    let stored_path = state.storage.sounds_dir().join(format!("{id}.{extension}"));
    fs::write(&stored_path, bytes).context("could not save imported audio file")?;

    let display_name = FsPath::new(&original)
        .file_stem()
        .and_then(|value| value.to_str())
        .filter(|value| !value.trim().is_empty())
        .unwrap_or("Imported sound")
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

fn normalized_board(board: String) -> String {
    let trimmed = board.trim();
    if trimmed.is_empty() { String::from("Meme Kit") } else { trimmed.to_string() }
}

fn safe_extension(original: &str) -> String {
    FsPath::new(original)
        .extension()
        .and_then(|value| value.to_str())
        .filter(|value| !value.is_empty() && value.len() <= 10 && value.chars().all(|ch| ch.is_ascii_alphanumeric()))
        .map(|value| value.to_ascii_lowercase())
        .unwrap_or_else(|| String::from("audio"))
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
