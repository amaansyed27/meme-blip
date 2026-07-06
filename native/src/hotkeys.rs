use crate::{audio::AudioEngine, storage::Storage};
use global_hotkey::{GlobalHotKeyEvent, GlobalHotKeyManager, HotKeyState};
use global_hotkey::hotkey::{Code, HotKey, Modifiers};
use std::{collections::HashMap, thread, time::{Duration, Instant}};

pub fn spawn_hotkeys(storage: Storage, audio: AudioEngine) {
    thread::spawn(move || {
        let _ = run_hotkeys(storage, audio);
    });
}

fn run_hotkeys(storage: Storage, audio: AudioEngine) -> Result<(), Box<dyn std::error::Error>> {
    let manager = GlobalHotKeyManager::new()?;
    let receiver = GlobalHotKeyEvent::receiver();
    let mut bindings = HashMap::new();
    let mut last_seen = String::new();
    let mut last_scan = Instant::now() - Duration::from_secs(3);

    loop {
        if last_scan.elapsed() >= Duration::from_secs(2) {
            let signature = storage.sounds().iter().map(|sound| format!("{}:{}", sound.id, sound.key)).collect::<Vec<_>>().join("|");
            if signature != last_seen {
                for sound in storage.sounds() {
                    if let Some(hotkey) = parse_hotkey(&sound.key) {
                        let id = hotkey.id();
                        if manager.register(hotkey).is_ok() {
                            bindings.insert(id, sound.id.clone());
                        }
                    }
                }
                last_seen = signature;
            }
            last_scan = Instant::now();
        }

        if let Ok(event) = receiver.recv_timeout(Duration::from_millis(250)) {
            if event.state == HotKeyState::Pressed {
                if let Some(sound_id) = bindings.get(&event.id) {
                    if let Some(sound) = storage.find_sound(sound_id) {
                        let settings = storage.settings();
                        let _ = audio.play(&sound, settings.output_device_id, settings.monitor_device_id);
                    }
                }
            }
        }
    }
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
            "a" => code = Some(Code::KeyA),
            "b" => code = Some(Code::KeyB),
            "c" => code = Some(Code::KeyC),
            "d" => code = Some(Code::KeyD),
            "e" => code = Some(Code::KeyE),
            "f" => code = Some(Code::KeyF),
            "g" => code = Some(Code::KeyG),
            "h" => code = Some(Code::KeyH),
            "i" => code = Some(Code::KeyI),
            "j" => code = Some(Code::KeyJ),
            "k" => code = Some(Code::KeyK),
            "l" => code = Some(Code::KeyL),
            "m" => code = Some(Code::KeyM),
            "n" => code = Some(Code::KeyN),
            "o" => code = Some(Code::KeyO),
            "p" => code = Some(Code::KeyP),
            "q" => code = Some(Code::KeyQ),
            "r" => code = Some(Code::KeyR),
            "s" => code = Some(Code::KeyS),
            "t" => code = Some(Code::KeyT),
            "u" => code = Some(Code::KeyU),
            "v" => code = Some(Code::KeyV),
            "w" => code = Some(Code::KeyW),
            "x" => code = Some(Code::KeyX),
            "y" => code = Some(Code::KeyY),
            "z" => code = Some(Code::KeyZ),
            "f1" => code = Some(Code::F1),
            "f2" => code = Some(Code::F2),
            "f3" => code = Some(Code::F3),
            "f4" => code = Some(Code::F4),
            "f5" => code = Some(Code::F5),
            "f6" => code = Some(Code::F6),
            "f7" => code = Some(Code::F7),
            "f8" => code = Some(Code::F8),
            "f9" => code = Some(Code::F9),
            "f10" => code = Some(Code::F10),
            "f11" => code = Some(Code::F11),
            "f12" => code = Some(Code::F12),
            _ => {}
        }
    }

    code.map(|key| HotKey::new(if modifiers.is_empty() { None } else { Some(modifiers) }, key))
}
