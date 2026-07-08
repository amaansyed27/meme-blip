use axum::{extract::State, http::HeaderMap, Json};

use crate::{driver, models::HealthResponse};

use super::super::{auth::verify, ApiError, SharedState};

const VB_CABLE_URL: &str = "https://vb-audio.com/Cable/";

pub(crate) async fn health(State(state): State<SharedState>) -> Json<HealthResponse> {
    let settings = state.storage.settings();
    Json(HealthResponse {
        ok: true,
        version: env!("CARGO_PKG_VERSION"),
        api_token: settings.api_token,
    })
}

pub(crate) async fn driver_status(
    State(state): State<SharedState>,
    headers: HeaderMap,
) -> Result<Json<driver::DriverStatus>, ApiError> {
    verify(&headers, &state)?;
    Ok(Json(driver::status()))
}

pub(crate) async fn open_vb_cable_setup(
    State(state): State<SharedState>,
    headers: HeaderMap,
) -> Result<Json<serde_json::Value>, ApiError> {
    verify(&headers, &state)?;
    open::that(VB_CABLE_URL)?;
    Ok(Json(serde_json::json!({ "ok": true, "url": VB_CABLE_URL })))
}
