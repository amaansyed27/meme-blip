use crate::{audio::AudioEngine, models::{AssignHotkeyRequest, HealthResponse, SetOutputDeviceRequest, SoundClip, UpdateSoundRequest}, storage::Storage, updater};
use anyhow::{anyhow, Result};
use axum::{extract::{Multipart, Path, State}, http::{header::CONTENT_TYPE, HeaderMap, HeaderName, HeaderValue, Method, StatusCode}, response::IntoResponse, routing::{delete, get, patch, post}, Json, Router};
use std::{fs, net::SocketAddr, path::PathBuf, sync::Arc};
use tower_http::{cors::CorsLayer, services::ServeDir};
use uuid::Uuid;

#[derive(Clone)]
pub struct AppState {
    pub storage: Storage,
    pub audio: AudioEngine,
}

pub async fn serve(storage: Storage, audio: AudioEngine) -> Result<()> {
    let state = Arc::new(AppState { storage, audio });
    let cors = CorsLayer::new()
        .allow_origin([
            HeaderValue::from_static("http://127.0.0.1:48321"),
            HeaderValue::from_static("http://localhost:48321"),
            HeaderValue::from_static("http://127.0.0.1:48322"),
        ])
        .allow_methods([Method::GET, Method::POST, Method::PATCH, Method::DELETE])
        .allow_headers([CONTENT_TYPE, HeaderName::from_static("x-memeblip-token")]);

    let app = Router::new()
        .route("/health", get(health))
        .route("/sounds", get(list_sounds))
        .route("/sounds/import", post(import_sound))
        .route("/sounds/:id", patch(update_sound).delete(delete_sound))
        .route("/sounds/:id/play", post(play_sound))
        .route("/sounds/:id/hotkey", post(assign_hotkey))
        .route("/sounds/stop-all", post(stop_all))
        .route("/boards", get(list_boards))
        .route("/devices", get(list_devices))
        .route("/devices/test", post(test_device))
        .route("/settings", get(get_settings))
        .route("/settings/output-device", post(set_output_device))
        .route("/updates/check", get(check_update))
        .route("/updates/download", post(download_update))
        .fallback_service(ServeDir::new(static_dir()))
        .layer(cors)
        .with_state(state);

    let addr: SocketAddr = "127.0.0.1:48322".parse()?;
    let listener = tokio::net::TcpListener::bind(addr).await?;
    println!("MemeBlip companion running on http://{addr}");
    axum::serve(listener, app).await?;
    Ok(())
}

async fn health(State(state): State<Arc<AppState>>) -> Json<HealthResponse> {
    let settings = state.storage.settings();
    Json(HealthResponse { ok: true, version: env!("CARGO_PKG_VERSION"), api_token: settings.api_token })
}

async fn list_sounds(State(state): State<Arc<AppState>>, headers: HeaderMap) -> Result<Json<Vec<SoundClip>>, ApiError> {
    verify(&headers, &state)?;
    Ok(Json(state.storage.sounds()))
}

async fn list_boards(State(state): State<Arc<AppState>>, headers: HeaderMap) -> Result<Json<Vec<String>>, ApiError> {
    verify(&headers, &state)?;
    let mut boards = Vec::new();
    for sound in state.storage.sounds() {
        if !boards.contains(&sound.board) {
            boards.push(sound.board);
        }
    }
    Ok(Json(boards))
}

async fn list_devices(State(state): State<Arc<AppState>>, headers: HeaderMap) -> Result<Json<Vec<crate::models::AudioDevice>>, ApiError> {
    verify(&headers, &state)?;
    let settings = state.storage.settings();
    Ok(Json(state.audio.devices(settings.output_device_id)?))
}

async fn test_device(State(state): State<Arc<AppState>>, headers: HeaderMap) -> Result<Json<serde_json::Value>, ApiError> {
    verify(&headers, &state)?;
    let settings = state.storage.settings();
    state.audio.test_tone(settings.output_device_id)?;
    Ok(Json(serde_json::json!({ "ok": true })))
}

async fn get_settings(State(state): State<Arc<AppState>>, headers: HeaderMap) -> Result<Json<crate::models::AppSettings>, ApiError> {
    verify(&headers, &state)?;
    Ok(Json(state.storage.settings()))
}

async fn set_output_device(State(state): State<Arc<AppState>>, headers: HeaderMap, Json(payload): Json<SetOutputDeviceRequest>) -> Result<Json<crate::models::AppSettings>, ApiError> {
    verify(&headers, &state)?;
    let mut settings = state.storage.settings();
    settings.output_device_id = Some(payload.device_id);
    Ok(Json(state.storage.set_settings(settings)?))
}

async fn import_sound(State(state): State<Arc<AppState>>, headers: HeaderMap, mut multipart: Multipart) -> Result<Json<SoundClip>, ApiError> {
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
            "volume" => volume = field.text().await.unwrap_or_else(|_| String::from("80")).parse().unwrap_or(80),
            _ => {}
        }
    }

    let original = file_name.ok_or_else(|| anyhow!("missing file"))?;
    let bytes = file_bytes.ok_or_else(|| anyhow!("missing file bytes"))?;
    let extension = original.rsplit('.').next().unwrap_or("audio");
    let id = Uuid::new_v4().to_string();
    let stored_name = format!("{id}.{extension}");
    let stored_path = state.storage.sounds_dir().join(stored_name);
    fs::write(&stored_path, bytes)?;

    let display_name = original.rsplit_once('.').map(|pair| pair.0).unwrap_or(&original).to_string();
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

async fn update_sound(State(state): State<Arc<AppState>>, headers: HeaderMap, Path(id): Path<String>, Json(payload): Json<UpdateSoundRequest>) -> Result<Json<SoundClip>, ApiError> {
    verify(&headers, &state)?;
    let mut sound = state.storage.find_sound(&id).ok_or_else(|| anyhow!("sound not found"))?;
    if let Some(name) = payload.name { sound.name = name; }
    if let Some(board) = payload.board { sound.board = board; }
    if let Some(key) = payload.key { sound.key = key; }
    if let Some(volume) = payload.volume { sound.volume = volume.clamp(0, 150); }
    if let Some(color) = payload.color { sound.color = color; }
    Ok(Json(state.storage.update_sound(sound)?))
}

async fn play_sound(State(state): State<Arc<AppState>>, headers: HeaderMap, Path(id): Path<String>) -> Result<Json<SoundClip>, ApiError> {
    verify(&headers, &state)?;
    let sound = state.storage.find_sound(&id).ok_or_else(|| anyhow!("sound not found"))?;
    let settings = state.storage.settings();
    state.audio.play(&sound, settings.output_device_id)?;
    Ok(Json(sound))
}

async fn stop_all(State(state): State<Arc<AppState>>, headers: HeaderMap) -> Result<Json<serde_json::Value>, ApiError> {
    verify(&headers, &state)?;
    state.audio.stop_all();
    Ok(Json(serde_json::json!({ "ok": true })))
}

async fn assign_hotkey(State(state): State<Arc<AppState>>, headers: HeaderMap, Path(id): Path<String>, Json(payload): Json<AssignHotkeyRequest>) -> Result<Json<SoundClip>, ApiError> {
    verify(&headers, &state)?;
    let mut sound = state.storage.find_sound(&id).ok_or_else(|| anyhow!("sound not found"))?;
    sound.key = payload.hotkey;
    Ok(Json(state.storage.update_sound(sound)?))
}

async fn delete_sound(State(state): State<Arc<AppState>>, headers: HeaderMap, Path(id): Path<String>) -> Result<Json<serde_json::Value>, ApiError> {
    verify(&headers, &state)?;
    state.storage.delete_sound(&id)?;
    Ok(Json(serde_json::json!({ "ok": true })))
}

async fn check_update(State(state): State<Arc<AppState>>, headers: HeaderMap) -> Result<Json<crate::models::UpdateStatus>, ApiError> {
    verify(&headers, &state)?;
    Ok(Json(updater::check().await?))
}

async fn download_update(State(state): State<Arc<AppState>>, headers: HeaderMap) -> Result<Json<crate::models::UpdateStatus>, ApiError> {
    verify(&headers, &state)?;
    Ok(Json(updater::download(state.storage.clone()).await?))
}

fn verify(headers: &HeaderMap, state: &AppState) -> Result<()> {
    let expected = state.storage.settings().api_token;
    let provided = headers.get("x-memeblip-token").and_then(|value| value.to_str().ok()).unwrap_or_default();
    if provided == expected {
        Ok(())
    } else {
        Err(anyhow!("unauthorized local API request"))
    }
}

fn static_dir() -> PathBuf {
    if let Ok(exe) = std::env::current_exe() {
        if let Some(parent) = exe.parent() {
            let bundled = parent.join("dist");
            if bundled.exists() {
                return bundled;
            }
        }
    }
    std::env::current_dir().unwrap_or_else(|_| PathBuf::from(".")).join("dist")
}

pub struct ApiError(anyhow::Error);

impl<E> From<E> for ApiError where E: Into<anyhow::Error> {
    fn from(error: E) -> Self {
        Self(error.into())
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> axum::response::Response {
        (StatusCode::INTERNAL_SERVER_ERROR, self.0.to_string()).into_response()
    }
}
