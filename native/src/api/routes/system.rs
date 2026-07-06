use axum::{extract::State, http::HeaderMap, Json};

use crate::{driver, models::HealthResponse};

use super::super::{auth::verify, ApiError, SharedState};

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
