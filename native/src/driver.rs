use anyhow::{anyhow, Result};
use serde::Serialize;
use std::{path::PathBuf, process::Command};

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

pub fn open_script(script: &str, elevated: bool) -> Result<()> {
    let root = repo_root();
    let script_path = root.join("driver").join("scripts").join(script);
    if !script_path.exists() {
        return Err(anyhow!("driver script not found: {}", script_path.display()));
    }

    let mut args = format!("-ExecutionPolicy Bypass -File \"{}\"", script_path.display());
    if elevated {
        args = format!("-NoExit {}", args);
        Command::new("powershell")
            .args(["-Command", "Start-Process", "powershell", "-Verb", "RunAs", "-ArgumentList", &args])
            .spawn()?;
    } else {
        Command::new("powershell")
            .args(["-NoExit", "-ExecutionPolicy", "Bypass", "-File"])
            .arg(script_path)
            .spawn()?;
    }

    Ok(())
}

fn repo_root() -> PathBuf {
    std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))
}
