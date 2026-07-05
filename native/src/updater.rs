use crate::{models::UpdateStatus, storage::Storage};
use anyhow::{anyhow, Result};
use serde_json::Value;
use std::fs;

const LATEST_RELEASE_URL: &str = "https://api.github.com/repos/amaansyed27/meme-blip/releases/latest";

pub async fn check() -> Result<UpdateStatus> {
    let current = env!("CARGO_PKG_VERSION").to_string();
    let client = reqwest::Client::new();
    let release: Value = client
        .get(LATEST_RELEASE_URL)
        .header("User-Agent", "MemeBlip-Updater")
        .send()
        .await?
        .error_for_status()?
        .json()
        .await?;

    let latest = release.get("tag_name").and_then(Value::as_str).unwrap_or_default().trim_start_matches('v').to_string();
    let release_url = release.get("html_url").and_then(Value::as_str).map(ToString::to_string);
    let mut asset_name = None;
    let mut asset_url = None;

    if let Some(assets) = release.get("assets").and_then(Value::as_array) {
        for asset in assets {
            let name = asset.get("name").and_then(Value::as_str).unwrap_or_default();
            let lower = name.to_lowercase();
            if lower.contains("windows") || lower.ends_with(".exe") || lower.ends_with(".zip") {
                asset_name = Some(name.to_string());
                asset_url = asset.get("browser_download_url").and_then(Value::as_str).map(ToString::to_string);
                break;
            }
        }
    }

    Ok(UpdateStatus {
        current_version: current.clone(),
        latest_version: if latest.is_empty() { None } else { Some(latest.clone()) },
        update_available: !latest.is_empty() && latest != current,
        release_url,
        asset_name,
        asset_url,
        downloaded_path: None,
    })
}

pub async fn download(storage: Storage) -> Result<UpdateStatus> {
    let mut status = check().await?;
    let asset_url = status.asset_url.clone().ok_or_else(|| anyhow!("no downloadable release asset found"))?;
    let asset_name = status.asset_name.clone().unwrap_or_else(|| String::from("MemeBlip-update.bin"));
    let client = reqwest::Client::new();
    let bytes = client
        .get(asset_url)
        .header("User-Agent", "MemeBlip-Updater")
        .send()
        .await?
        .error_for_status()?
        .bytes()
        .await?;

    let update_dir = storage.data_dir().join("updates");
    fs::create_dir_all(&update_dir)?;
    let path = update_dir.join(asset_name);
    fs::write(&path, bytes)?;
    status.downloaded_path = Some(path.to_string_lossy().to_string());
    let _ = open::that(&path);
    Ok(status)
}
