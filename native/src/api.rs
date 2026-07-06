mod auth;
mod error;
mod routes;

pub(crate) use error::ApiError;

use crate::{audio::AudioEngine, models::UpdateStatus, storage::Storage, updater};
use anyhow::Result;
use axum::{extract::State, http::{header::CONTENT_TYPE, HeaderMap, HeaderName, HeaderValue, Method}, Json};
use std::{net::SocketAddr, path::PathBuf, sync::Arc};
use tower_http::{cors::CorsLayer, services::ServeDir};

#[derive(Clone)]
pub struct AppState {
    pub storage: Storage,
    pub audio: AudioEngine,
}

pub(crate) type SharedState = Arc<AppState>;

pub async fn serve(storage: Storage, audio: AudioEngine) -> Result<()> {
    let state = Arc::new(AppState { storage, audio });
    apply_mic_passthrough(&state)?;

    let cors = CorsLayer::new()
        .allow_origin([
            HeaderValue::from_static("http://127.0.0.1:48321"),
            HeaderValue::from_static("http://localhost:48321"),
            HeaderValue::from_static("http://127.0.0.1:48322"),
        ])
        .allow_methods([Method::GET, Method::POST, Method::PATCH, Method::DELETE])
        .allow_headers([CONTENT_TYPE, HeaderName::from_static("x-memeblip-token")]);

    let app = routes::router()
        .fallback_service(ServeDir::new(static_dir()))
        .layer(cors)
        .with_state(state);

    let addr: SocketAddr = "127.0.0.1:48322".parse()?;
    let listener = match tokio::net::TcpListener::bind(addr).await {
        Ok(listener) => listener,
        Err(error) if error.kind() == std::io::ErrorKind::AddrInUse => {
            println!("MemeBlip companion is already running on http://{addr}");
            println!("To reload the new build, run: npm run companion:stop");
            return Ok(());
        }
        Err(error) => return Err(error.into()),
    };

    println!("MemeBlip companion running on http://{addr}");
    axum::serve(listener, app).await?;
    Ok(())
}

pub(crate) async fn check_update(
    State(state): State<SharedState>,
    headers: HeaderMap,
) -> Result<Json<UpdateStatus>, ApiError> {
    auth::verify(&headers, &state)?;
    Ok(Json(updater::check().await?))
}

pub(crate) async fn download_update(
    State(state): State<SharedState>,
    headers: HeaderMap,
) -> Result<Json<UpdateStatus>, ApiError> {
    auth::verify(&headers, &state)?;
    Ok(Json(updater::download(state.storage.clone()).await?))
}

pub(crate) fn apply_mic_passthrough(state: &AppState) -> Result<()> {
    let settings = state.storage.settings();
    state.audio.configure_passthrough(
        settings.input_device_id,
        settings.output_device_id,
        settings.mic_passthrough_enabled,
    )
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

    std::env::current_dir()
        .unwrap_or_else(|_| PathBuf::from("."))
        .join("dist")
}
