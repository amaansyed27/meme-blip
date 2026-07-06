use std::{path::PathBuf, thread};
use tray_icon::{menu::{Menu, MenuEvent, MenuItem, PredefinedMenuItem}, Icon, TrayIconBuilder};

pub fn spawn_dashboard_tray() {
    thread::spawn(|| {
        if let Err(error) = run_tray() {
            eprintln!("tray error: {error}");
        }
    });
}

fn run_tray() -> Result<(), Box<dyn std::error::Error>> {
    let menu = Menu::new();
    let open_dashboard = MenuItem::new("Open Dashboard", true, None);
    let open_api = MenuItem::new("Open API Health", true, None);
    let quit = MenuItem::new("Quit", true, None);
    menu.append(&open_dashboard)?;
    menu.append(&open_api)?;
    menu.append(&PredefinedMenuItem::separator())?;
    menu.append(&quit)?;

    let _tray = TrayIconBuilder::new()
        .with_tooltip("MemeBlip - left click for menu")
        .with_menu(Box::new(menu))
        .with_menu_on_left_click(true)
        .with_icon(make_icon()?)
        .build()?;

    println!("MemeBlip tray ready. Open dashboard: {}", dashboard_url());

    let menu_channel = MenuEvent::receiver();
    while let Ok(event) = menu_channel.recv() {
        if event.id == open_dashboard.id() {
            let _ = open::that(dashboard_url());
        }
        if event.id == open_api.id() {
            let _ = open::that("http://127.0.0.1:48322/health");
        }
        if event.id == quit.id() {
            break;
        }
    }
    Ok(())
}

fn dashboard_url() -> &'static str {
    if bundled_dist_dir().exists() {
        "http://127.0.0.1:48322"
    } else {
        "http://127.0.0.1:48321"
    }
}

fn bundled_dist_dir() -> PathBuf {
    if let Ok(exe) = std::env::current_exe() {
        if let Some(parent) = exe.parent() {
            let bundled = parent.join("dist");
            if bundled.exists() {
                return bundled;
            }
        }
    }
    std::env::current_dir().unwrap_or_else(|_| PathBuf::from(".")).join("dist")
}

fn make_icon() -> Result<Icon, Box<dyn std::error::Error>> {
    let size = 32u32;
    let mut rgba = Vec::with_capacity((size * size * 4) as usize);
    for y in 0..size {
        for x in 0..size {
            let dx = x as i32 - 16;
            let dy = y as i32 - 16;
            let inside = dx * dx + dy * dy <= 196;
            if inside {
                rgba.extend_from_slice(&[125, 255, 196, 255]);
            } else {
                rgba.extend_from_slice(&[0, 0, 0, 0]);
            }
        }
    }
    Ok(Icon::from_rgba(rgba, size, size)?)
}
