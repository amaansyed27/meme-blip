use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SoundClip {
    pub id: String,
    pub name: String,
    pub board: String,
    pub key: String,
    pub volume: u8,
    pub duration: String,
    pub color: String,
    pub file_path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AudioDevice {
    pub id: String,
    pub name: String,
    #[serde(rename = "type")]
    pub device_type: String,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub output_device_id: Option<String>,
    pub monitor_device_id: Option<String>,
    pub start_on_boot: bool,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self { output_device_id: None, monitor_device_id: None, start_on_boot: true }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SetOutputDeviceRequest {
    pub device_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AssignHotkeyRequest {
    pub hotkey: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct HealthResponse {
    pub ok: bool,
    pub version: &'static str,
}
