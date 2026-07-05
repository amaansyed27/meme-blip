use crate::{audio::AudioEngine, storage::Storage};
use global_hotkey::{GlobalHotKeyEvent, GlobalHotKeyManager, HotKeyState};
use global_hotkey::hotkey::{Code, HotKey, Modifiers};
use std::{collections::HashMap, thread};

pub fn spawn_hotkeys(storage: Storage, audio: AudioEngine) {
    thread::spawn(move || {
        let _ = run_hotkeys(storage, audio);
    });
}

fn run_hotkeys(storage: Storage, audio: AudioEngine) -> Result<(), Box<dyn std::error::Error>> {
    let manager = GlobalHotKeyManager::new()?;
    let mut bindings = HashMap::new();

    for sound in storage.sounds() {
        if let Some(hotkey) = parse_hotkey(&sound.key) {
            let id = hotkey.id();
            if manager.register(hotkey).is_ok() {
                bindings.insert(id, sound.id.clone());
            }
        }
    }

    let receiver = GlobalHotKeyEvent::receiver();
    while let Ok(event) = receiver.recv() {
        if event.state == HotKeyState::Pressed {
            if let Some(sound_id) = bindings.get(&event.id) {
                if let Some(sound) = storage.find_sound(sound_id) {
                    let settings = storage.settings();
                    let _ = audio.play(&sound, settings.output_device_id);
                }
            }
        }
    }
    Ok(())
}

fn parse_hotkey(value: &str) -> Option<HotKey> {
    let parts: Vec<String> = value.split('+').map(|part| part.trim().to_lowercase()).collect();
    if parts.is_empty() || value.eq_ignore_ascii_case("unassigned") {
        return None;
    }

    let mut modifiers = Modifiers::empty();
    let mut code = None;
    for part in parts {
        match part.as_str() {
            "alt" => modifiers |= Modifiers::ALT,
            "ctrl" | "control" => modifiers |= Modifiers::CONTROL,
            "shift" => modifiers |= Modifiers::SHIFT,
            "1" => code = Some(Code::Digit1),
            "2" => code = Some(Code::Digit2),
            "3" => code = Some(Code::Digit3),
            "4" => code = Some(Code::Digit4),
            "5" => code = Some(Code::Digit5),
            "6" => code = Some(Code::Digit6),
            "7" => code = Some(Code::Digit7),
            "8" => code = Some(Code::Digit8),
            "9" => code = Some(Code::Digit9),
            "f8" => code = Some(Code::F8),
            _ => {}
        }
    }

    code.map(|key| HotKey::new(if modifiers.is_empty() { None } else { Some(modifiers) }, key))
}
