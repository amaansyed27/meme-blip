mod api;
mod audio;
mod models;
mod settings;
mod storage;
mod tray;

use anyhow::Result;
use audio::AudioEngine;
use storage::Storage;

#[tokio::main]
async fn main() -> Result<()> {
    let storage = Storage::load()?;
    let audio = AudioEngine::new();
    tray::spawn_dashboard_tray();
    api::serve(storage, audio).await?;
    Ok(())
}
