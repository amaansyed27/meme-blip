use crate::{audio::AudioEngine, models::{AssignHotkeyRequest, HealthResponse, SetOutputDeviceRequest, SoundClip}, storage::Storage};
use anyhow::{anyhow, Result};
use axum::{extract::{Multipart, Path, State}, http::StatusCode, response::IntoResponse, routing::{delete, get, post}, Json, Router};
use std::{fs, net::SocketAddr, sync::Arc};
use tower_http::cors::{Any, CorsLayer};
use uuid::Uuid;

#[derive(Clone)]
pub struct AppState {
    pub storage: Storage,
    pub audio: AudioEngine,
}

pub async fn serve(storage: Storage, audio: AudioEngine) -> Result<()> {
    let state = Arc::new(AppState { storage, audio });
    let cors = CorsLayer::new().allow_origin(Any).allow_methods(Any).allow_headers(Any);
    let app = Router::new()
        .route("/health", get(health))
        .route("/sounds", get(list_sounds))
        .route("/sounds/import", post(import_sound))
        .route("/sounds/:id", delete(delete_sound))
        .route("/sounds/:id/play", post(play_sound))
        .route("/sounds/:id/hotkey", post(assign_hotkey))
        .route("/sounds/stop-all", post(stop_all))
        .route("/boards", get(list_boards))
        .route("/devices", get(list_devices))
        .route("/settings", get(get_settings))
        .route("/settings/output-device", post(set_output_device))
        .layer(cors)
        .with_state(state);

    let addr: SocketAddr = "127.0.0.1:48322".parse()?;
    let listener = tokio::net::TcpListener::bind(addr).await?;
    println!("MemeBlip companion API running on http://{addr}");
    axum::serve(listener, app).await?;
    Ok(())
}

async fn health() -> Json<HealthResponse> {
    Json(HealthResponse { ok: true, version: env!("CARGO_PKG_VERSION") })
}

async fn list_sounds(State(state): State<Arc<AppState>>) -> Json<Vec<SoundClip>> {
    Json(state.storage.sounds())
}

async fn list_boards(State(state): State<Arc<AppState>>) -> Json<Vec<String>> {
    let mut boards = Vec::new();
    for sound in state.storage.sounds() {
        if !boards.contains(&sound.board) {
            boards.push(sound.board);
        }
    }
    Json(boards)
}

async fn list_devices(State(state): State<Arc<AppState>>) -> Result<Json<Vec<crate::models::AudioDevice>>, ApiError> {
    let settings = state.storage.settings();
    Ok(Json(state.audio.devices(settings.output_device_id)?))
}

async fn get_settings(State(state): State<Arc<AppState>>) -> Json<crate::models::AppSettings> {
    Json(state.storage.settings())
}

async fn set_output_device(State(state): State<Arc<AppState>>, Json(payload): Json<SetOutputDeviceRequest>) -> Result<Json<crate::models::AppSettings>, ApiError> {
    let mut settings = state.storage.settings();
    settings.output_device_id = Some(payload.device_id);
    Ok(Json(state.storage.set_settings(settings)?))
}

async fn import_sound(State(state): State<Arc<AppState>>, mut multipart: Multipart) -> Result<Json<SoundClip>, ApiError> {
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
        volume,
        duration: String::from("--"),
        color: String::from("mint"),
        file_path: stored_path.to_string_lossy().to_string(),
    };

    Ok(Json(state.storage.add_sound(sound)?))
}

async fn play_sound(State(state): State<Arc<AppState>>, Path(id): Path<String>) -> Result<Json<SoundClip>, ApiError> {
    let sound = state.storage.find_sound(&id).ok_or_else(|| anyhow!("sound not found"))?;
    let settings = state.storage.settings();
    state.audio.play(&sound, settings.output_device_id)?;
    Ok(Json(sound))
}

async fn stop_all(State(state): State<Arc<AppState>>) -> Json<serde_json::Value> {
    state.audio.stop_all();
    Json(serde_json::json!({ "ok": true }))
}

async fn assign_hotkey(State(state): State<Arc<AppState>>, Path(id): Path<String>, Json(payload): Json<AssignHotkeyRequest>) -> Result<Json<SoundClip>, ApiError> {
    let mut sound = state.storage.find_sound(&id).ok_or_else(|| anyhow!("sound not found"))?;
    sound.key = payload.hotkey;
    Ok(Json(state.storage.update_sound(sound)?))
}

async fn delete_sound(State(state): State<Arc<AppState>>, Path(id): Path<String>) -> Result<Json<serde_json::Value>, ApiError> {
    state.storage.delete_sound(&id)?;
    Ok(Json(serde_json::json!({ "ok": true })))
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
