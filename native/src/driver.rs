use serde::Serialize;
use std::path::PathBuf;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DriverStatus {
    pub workspace_exists: bool,
    pub package_exists: bool,
    pub installed_hint: bool,
    pub workspace_path: String,
    pub package_path: String,
}

pub fn status() -> DriverStatus {
    let root = repo_root();
    let workspace = root.join("driver");
    let package = root.join("driver").join("out").join("memeblip-virtual-mic");
    DriverStatus {
        workspace_exists: workspace.exists(),
        package_exists: package.exists(),
        installed_hint: false,
        workspace_path: workspace.to_string_lossy().to_string(),
        package_path: package.to_string_lossy().to_string(),
    }
}

fn repo_root() -> PathBuf {
    std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))
}
