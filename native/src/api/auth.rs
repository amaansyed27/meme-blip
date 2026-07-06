use super::AppState;
use anyhow::{anyhow, Result};
use axum::http::HeaderMap;

pub(crate) fn verify(headers: &HeaderMap, state: &AppState) -> Result<()> {
    let expected = state.storage.settings().api_token;
    let provided = headers
        .get("x-memeblip-token")
        .and_then(|value| value.to_str().ok())
        .unwrap_or_default();

    if provided == expected {
        Ok(())
    } else {
        Err(anyhow!("unauthorized local API request"))
    }
}
