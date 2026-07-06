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
    pub input_device_id: Option<String>,
    pub mic_passthrough_enabled: bool,
    pub start_on_boot: bool,
    pub api_token: String,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            output_device_id: None,
            monitor_device_id: None,
            input_device_id: None,
            mic_passthrough_enabled: true,
            start_on_boot: true,
            api_token: uuid::Uuid::new_v4().to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SetOutputDeviceRequest {
    pub device_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SetMonitorDeviceRequest {
    pub device_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SetInputDeviceRequest {
    pub device_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SetMicPassthroughRequest {
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MixerStatus {
    pub input_device_id: Option<String>,
    pub output_device_id: Option<String>,
    pub monitor_device_id: Option<String>,
    pub mic_passthrough_enabled: bool,
    pub intended_target_input: String,
    pub intended_speaker_output: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AssignHotkeyRequest {
    pub hotkey: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct UpdateSoundRequest {
    pub name: Option<String>,
    pub board: Option<String>,
    pub key: Option<String>,
    pub volume: Option<u8>,
    pub color: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HealthResponse {
    pub ok: bool,
    pub version: &'static str,
    pub api_token: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateStatus {
    pub current_version: String,
    pub latest_version: Option<String>,
    pub update_available: bool,
    pub release_url: Option<String>,
    pub asset_name: Option<String>,
    pub asset_url: Option<String>,
    pub downloaded_path: Option<String>,
}
