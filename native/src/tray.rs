use std::{path::PathBuf, process::Command, thread, time::Duration};
use tao::{
    event::{Event, StartCause},
    event_loop::{ControlFlow, EventLoopBuilder},
};
#[cfg(target_os = "windows")]
use tao::platform::windows::EventLoopBuilderExtWindows;
use tray_icon::{menu::{Menu, MenuEvent, MenuItem, PredefinedMenuItem}, Icon, TrayIconBuilder};

const TRAY_ICON_PNG: &[u8] = include_bytes!("../../assets/brand/memeblip-icon-1024.png");

pub fn spawn_dashboard_tray() {
    thread::spawn(|| {
        if let Err(error) = run_tray() {
            eprintln!("tray error: {error}");
        }
    });
}

fn run_tray() -> Result<(), Box<dyn std::error::Error>> {
    let mut event_loop_builder = EventLoopBuilder::new();
    #[cfg(target_os = "windows")]
    event_loop_builder.with_any_thread(true);
    let event_loop = event_loop_builder.build();

    let menu = Menu::new();
    let open_dashboard = MenuItem::new("Open Dashboard", true, None);
    let open_api = MenuItem::new("Open API Health", true, None);
    let close_app = MenuItem::new("Close MemeBlip", true, None);
    menu.append(&open_dashboard)?;
    menu.append(&open_api)?;
    menu.append(&PredefinedMenuItem::separator())?;
    menu.append(&close_app)?;

    let _tray = TrayIconBuilder::new()
        .with_tooltip("MemeBlip")
        .with_menu(Box::new(menu))
        .with_menu_on_left_click(true)
        .with_icon(make_icon()?)
        .build()?;

    println!("MemeBlip tray ready. Dashboard: {}", dashboard_url());

    event_loop.run(move |event, _, control_flow| {
        *control_flow = ControlFlow::Wait;

        while let Ok(menu_event) = MenuEvent::receiver().try_recv() {
            if menu_event.id == open_dashboard.id() {
                let _ = open::that(dashboard_url());
            }
            if menu_event.id == open_api.id() {
                let _ = open::that("http://127.0.0.1:48322/health");
            }
            if menu_event.id == close_app.id() {
                shutdown_meme_blip();
            }
        }

        if let Event::NewEvents(StartCause::Init) = event {
            println!("MemeBlip tray event loop started");
        }
    });
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

fn shutdown_meme_blip() -> ! {
    println!("Closing MemeBlip and clearing local ports...");
    #[cfg(target_os = "windows")]
    stop_windows_port_processes(&[48321, 48322], std::process::id());
    thread::sleep(Duration::from_millis(120));
    std::process::exit(0);
}

#[cfg(target_os = "windows")]
fn stop_windows_port_processes(ports: &[u16], current_pid: u32) {
    let port_list = ports.iter().map(|port| port.to_string()).collect::<Vec<_>>().join(",");
    let script = format!(
        "$ports=@({}); Get-NetTCPConnection -LocalPort $ports -ErrorAction SilentlyContinue | ForEach-Object {{ $pid=$_.OwningProcess; if ($pid -and $pid -ne 0 -and $pid -ne {}) {{ Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue }} }}",
        port_list, current_pid
    );

    let _ = Command::new("powershell")
        .args(["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", &script])
        .spawn()
        .and_then(|mut child| child.wait());
}

fn make_icon() -> Result<Icon, Box<dyn std::error::Error>> {
    let image = image::load_from_memory(TRAY_ICON_PNG)?
        .resize_exact(32, 32, image::imageops::FilterType::Lanczos3)
        .to_rgba8();
    Ok(Icon::from_rgba(image.into_raw(), 32, 32)?)
}
