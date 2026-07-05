use crate::models::{AppSettings, SoundClip};
use anyhow::{Context, Result};
use directories::ProjectDirs;
use std::{fs, path::PathBuf, sync::{Arc, Mutex}};

#[derive(Clone)]
pub struct Storage {
    inner: Arc<Mutex<StorageInner>>,
}

struct StorageInner {
    data_dir: PathBuf,
    sounds: Vec<SoundClip>,
    settings: AppSettings,
}

impl Storage {
    pub fn load() -> Result<Self> {
        let dirs = ProjectDirs::from("dev", "Dawnlight", "MemeBlip").context("could not resolve app data directory")?;
        let data_dir = dirs.data_local_dir().to_path_buf();
        let sounds_dir = data_dir.join("sounds");
        fs::create_dir_all(&sounds_dir)?;

        let sounds_path = data_dir.join("sounds.json");
        let settings_path = data_dir.join("settings.json");

        let sounds = if sounds_path.exists() {
            let raw = fs::read_to_string(&sounds_path)?;
            serde_json::from_str(&raw).unwrap_or_default()
        } else {
            Vec::new()
        };

        let settings = if settings_path.exists() {
            let raw = fs::read_to_string(&settings_path)?;
            serde_json::from_str(&raw).unwrap_or_default()
        } else {
            AppSettings::default()
        };

        let storage = Self { inner: Arc::new(Mutex::new(StorageInner { data_dir, sounds, settings })) };
        storage.save_settings()?;
        storage.save_sounds()?;
        Ok(storage)
    }

    pub fn data_dir(&self) -> PathBuf {
        self.inner.lock().unwrap().data_dir.clone()
    }

    pub fn sounds_dir(&self) -> PathBuf {
        self.data_dir().join("sounds")
    }

    pub fn sounds(&self) -> Vec<SoundClip> {
        self.inner.lock().unwrap().sounds.clone()
    }

    pub fn settings(&self) -> AppSettings {
        self.inner.lock().unwrap().settings.clone()
    }

    pub fn set_settings(&self, settings: AppSettings) -> Result<AppSettings> {
        {
            let mut inner = self.inner.lock().unwrap();
            inner.settings = settings.clone();
        }
        self.save_settings()?;
        Ok(settings)
    }

    pub fn add_sound(&self, sound: SoundClip) -> Result<SoundClip> {
        {
            let mut inner = self.inner.lock().unwrap();
            inner.sounds.insert(0, sound.clone());
        }
        self.save_sounds()?;
        Ok(sound)
    }

    pub fn update_sound(&self, sound: SoundClip) -> Result<SoundClip> {
        {
            let mut inner = self.inner.lock().unwrap();
            if let Some(existing) = inner.sounds.iter_mut().find(|item| item.id == sound.id) {
                *existing = sound.clone();
            }
        }
        self.save_sounds()?;
        Ok(sound)
    }

    pub fn find_sound(&self, id: &str) -> Option<SoundClip> {
        self.inner.lock().unwrap().sounds.iter().find(|sound| sound.id == id).cloned()
    }

    pub fn delete_sound(&self, id: &str) -> Result<()> {
        let removed = {
            let mut inner = self.inner.lock().unwrap();
            let before = inner.sounds.len();
            inner.sounds.retain(|sound| sound.id != id);
            before != inner.sounds.len()
        };
        if removed {
            self.save_sounds()?;
        }
        Ok(())
    }

    fn save_sounds(&self) -> Result<()> {
        let inner = self.inner.lock().unwrap();
        let path = inner.data_dir.join("sounds.json");
        fs::write(path, serde_json::to_string_pretty(&inner.sounds)?)?;
        Ok(())
    }

    fn save_settings(&self) -> Result<()> {
        let inner = self.inner.lock().unwrap();
        let path = inner.data_dir.join("settings.json");
        fs::write(path, serde_json::to_string_pretty(&inner.settings)?)?;
        Ok(())
    }
}
