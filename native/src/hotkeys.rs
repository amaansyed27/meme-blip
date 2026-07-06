use crate::{audio::AudioEngine, storage::Storage};
use std::{collections::{HashMap, HashSet}, thread, time::{Duration, Instant}};

#[cfg(target_os = "windows")]
use windows_sys::Win32::UI::Input::KeyboardAndMouse::{
    GetAsyncKeyState, VK_CONTROL, VK_LCONTROL, VK_RCONTROL, VK_MENU, VK_LMENU, VK_RMENU, VK_SHIFT, VK_LSHIFT, VK_RSHIFT,
};

#[derive(Clone, Debug, Eq, PartialEq, Hash)]
struct KeyCombo {
    ctrl: bool,
    alt: bool,
    shift: bool,
    vk: i32,
    label: String,
}

pub fn spawn_hotkeys(storage: Storage, audio: AudioEngine) {
    thread::spawn(move || {
        if let Err(error) = run_hotkeys(storage, audio) {
            eprintln!("hotkey worker stopped: {error}");
        }
    });
}

#[cfg(target_os = "windows")]
fn run_hotkeys(storage: Storage, audio: AudioEngine) -> Result<(), Box<dyn std::error::Error>> {
    let mut bindings: HashMap<KeyCombo, String> = HashMap::new();
    let mut pressed: HashSet<KeyCombo> = HashSet::new();
    let mut last_seen = String::new();
    let mut last_scan = Instant::now() - Duration::from_secs(3);

    println!("Hotkey worker active using Windows polling. For Valorant, run the companion as Administrator if keys do not fire in-game.");

    loop {
        if last_scan.elapsed() >= Duration::from_secs(2) {
            let settings = storage.settings();
            let active_board = settings.active_board.clone();
            let sound_signature = storage.sounds().iter().map(|sound| format!("{}:{}:{}", sound.id, sound.board, sound.key)).collect::<Vec<_>>().join("|");
            let signature = format!("active={:?}|{}", active_board, sound_signature);

            if signature != last_seen {
                bindings.clear();
                let mut registered_count = 0;

                for sound in storage.sounds() {
                    if let Some(board) = &active_board {
                        if sound.board != *board {
                            continue;
                        }
                    }

                    if let Some(combo) = parse_hotkey(&sound.key) {
                        println!("Registered hotkey: {} -> {} [{}]", combo.label, sound.name, sound.board);
                        bindings.insert(combo, sound.id.clone());
                        registered_count += 1;
                    } else if !sound.key.eq_ignore_ascii_case("unassigned") {
                        eprintln!("Unsupported hotkey '{}' for '{}'", sound.key, sound.name);
                    }
                }

                pressed.clear();
                println!("Hotkey map reloaded: {registered_count} active bindings. Active board: {}", active_board.unwrap_or_else(|| String::from("All boards")));
                last_seen = signature;
            }
            last_scan = Instant::now();
        }

        let combos: Vec<KeyCombo> = bindings.keys().cloned().collect();
        for combo in combos {
            let down = combo_is_down(&combo);
            if down && !pressed.contains(&combo) {
                pressed.insert(combo.clone());
                if let Some(sound_id) = bindings.get(&combo) {
                    if let Some(sound) = storage.find_sound(sound_id) {
                        let settings = storage.settings();
                        println!("Hotkey fired: {}", sound.name);
                        let _ = audio.play(&sound, settings.output_device_id, settings.monitor_device_id);
                    }
                }
            } else if !down {
                pressed.remove(&combo);
            }
        }

        thread::sleep(Duration::from_millis(35));
    }
}

#[cfg(not(target_os = "windows"))]
fn run_hotkeys(_storage: Storage, _audio: AudioEngine) -> Result<(), Box<dyn std::error::Error>> {
    println!("Hotkeys are currently implemented for Windows only.");
    loop { thread::sleep(Duration::from_secs(60)); }
}

#[cfg(target_os = "windows")]
fn combo_is_down(combo: &KeyCombo) -> bool {
    if combo.ctrl && !any_down(&[VK_CONTROL as i32, VK_LCONTROL as i32, VK_RCONTROL as i32]) { return false; }
    if combo.alt && !any_down(&[VK_MENU as i32, VK_LMENU as i32, VK_RMENU as i32]) { return false; }
    if combo.shift && !any_down(&[VK_SHIFT as i32, VK_LSHIFT as i32, VK_RSHIFT as i32]) { return false; }
    key_down(combo.vk)
}

#[cfg(target_os = "windows")]
fn any_down(keys: &[i32]) -> bool {
    keys.iter().any(|key| key_down(*key))
}

#[cfg(target_os = "windows")]
fn key_down(vk: i32) -> bool {
    unsafe { (GetAsyncKeyState(vk) as u16 & 0x8000) != 0 }
}

#[cfg(target_os = "windows")]
fn parse_hotkey(value: &str) -> Option<KeyCombo> {
    let parts: Vec<String> = value.split('+').map(|part| part.trim().to_lowercase()).filter(|part| !part.is_empty()).collect();
    if parts.is_empty() || value.eq_ignore_ascii_case("unassigned") {
        return None;
    }

    let mut ctrl = false;
    let mut alt = false;
    let mut shift = false;
    let mut vk = None;

    for part in parts {
        match part.as_str() {
            "ctrl" | "control" => ctrl = true,
            "alt" => alt = true,
            "shift" => shift = true,
            "1" => vk = Some(0x31),
            "2" => vk = Some(0x32),
            "3" => vk = Some(0x33),
            "4" => vk = Some(0x34),
            "5" => vk = Some(0x35),
            "6" => vk = Some(0x36),
            "7" => vk = Some(0x37),
            "8" => vk = Some(0x38),
            "9" => vk = Some(0x39),
            "0" => vk = Some(0x30),
            "a" => vk = Some(0x41),
            "b" => vk = Some(0x42),
            "c" => vk = Some(0x43),
            "d" => vk = Some(0x44),
            "e" => vk = Some(0x45),
            "f" => vk = Some(0x46),
            "g" => vk = Some(0x47),
            "h" => vk = Some(0x48),
            "i" => vk = Some(0x49),
            "j" => vk = Some(0x4A),
            "k" => vk = Some(0x4B),
            "l" => vk = Some(0x4C),
            "m" => vk = Some(0x4D),
            "n" => vk = Some(0x4E),
            "o" => vk = Some(0x4F),
            "p" => vk = Some(0x50),
            "q" => vk = Some(0x51),
            "r" => vk = Some(0x52),
            "s" => vk = Some(0x53),
            "t" => vk = Some(0x54),
            "u" => vk = Some(0x55),
            "v" => vk = Some(0x56),
            "w" => vk = Some(0x57),
            "x" => vk = Some(0x58),
            "y" => vk = Some(0x59),
            "z" => vk = Some(0x5A),
            "f1" => vk = Some(0x70),
            "f2" => vk = Some(0x71),
            "f3" => vk = Some(0x72),
            "f4" => vk = Some(0x73),
            "f5" => vk = Some(0x74),
            "f6" => vk = Some(0x75),
            "f7" => vk = Some(0x76),
            "f8" => vk = Some(0x77),
            "f9" => vk = Some(0x78),
            "f10" => vk = Some(0x79),
            "f11" => vk = Some(0x7A),
            "f12" => vk = Some(0x7B),
            _ => {}
        }
    }

    let vk = vk?;
    let mut pieces = Vec::new();
    if ctrl { pieces.push("Ctrl".to_string()); }
    if alt { pieces.push("Alt".to_string()); }
    if shift { pieces.push("Shift".to_string()); }
    pieces.push(key_label(vk));

    Some(KeyCombo { ctrl, alt, shift, vk, label: pieces.join(" + ") })
}

#[cfg(target_os = "windows")]
fn key_label(vk: i32) -> String {
    match vk {
        0x70..=0x7B => format!("F{}", vk - 0x6F),
        0x30..=0x39 | 0x41..=0x5A => char::from_u32(vk as u32).unwrap_or('?').to_string(),
        _ => format!("VK{vk}"),
    }
}
