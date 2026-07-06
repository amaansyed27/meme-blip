use crate::models::{AudioDevice, SoundClip};
use anyhow::{anyhow, Context, Result};
use cpal::traits::{DeviceTrait, HostTrait};
use rodio::{Decoder, OutputStream, Sink, Source};
use std::{fs::File, io::BufReader, sync::mpsc, thread};

#[derive(Clone)]
pub struct AudioEngine {
    tx: mpsc::Sender<AudioCommand>,
}

enum AudioCommand {
    Play { sound: SoundClip, selected_device_id: Option<String> },
    StopAll,
}

struct ActiveSink {
    _stream: OutputStream,
    sink: Sink,
}

impl AudioEngine {
    pub fn new() -> Self {
        let (tx, rx) = mpsc::channel::<AudioCommand>();
        thread::spawn(move || audio_worker(rx));
        Self { tx }
    }

    pub fn devices(&self, selected_device_id: Option<String>) -> Result<Vec<AudioDevice>> {
        list_output_devices(selected_device_id)
    }

    pub fn play(&self, sound: &SoundClip, selected_device_id: Option<String>) -> Result<()> {
        self.tx
            .send(AudioCommand::Play { sound: sound.clone(), selected_device_id })
            .map_err(|error| anyhow!("audio worker unavailable: {error}"))
    }

    pub fn stop_all(&self) {
        let _ = self.tx.send(AudioCommand::StopAll);
    }
}

fn audio_worker(rx: mpsc::Receiver<AudioCommand>) {
    let mut active_sinks: Vec<ActiveSink> = Vec::new();
    while let Ok(command) = rx.recv() {
        active_sinks.retain(|active| !active.sink.empty());
        match command {
            AudioCommand::Play { sound, selected_device_id } => {
                if let Err(error) = play_now(&sound, selected_device_id, &mut active_sinks) {
                    eprintln!("audio playback error: {error}");
                }
            }
            AudioCommand::StopAll => {
                for active in active_sinks.iter() {
                    active.sink.stop();
                }
                active_sinks.clear();
            }
        }
    }
}

fn play_now(sound: &SoundClip, selected_device_id: Option<String>, active_sinks: &mut Vec<ActiveSink>) -> Result<()> {
    let file = File::open(&sound.file_path).with_context(|| format!("could not open sound file {}", sound.file_path))?;
    let source = Decoder::new(BufReader::new(file)).context("could not decode audio file")?;
    let source = source.amplify((sound.volume as f32 / 100.0).clamp(0.0, 1.5));

    let (stream, handle) = match selected_device_id {
        Some(id) => {
            let device = find_output_device(&id)?.ok_or_else(|| anyhow!("selected output device not found"))?;
            OutputStream::try_from_device(&device).context("could not open selected output device")?
        }
        None => OutputStream::try_default().context("could not open default output device")?,
    };

    let sink = Sink::try_new(&handle).context("could not create audio sink")?;
    sink.append(source);
    active_sinks.push(ActiveSink { _stream: stream, sink });
    Ok(())
}

fn list_output_devices(selected_device_id: Option<String>) -> Result<Vec<AudioDevice>> {
    let host = cpal::default_host();
    let devices = host.output_devices().context("could not enumerate output devices")?;
    let mut result = Vec::new();

    for (index, device) in devices.enumerate() {
        let name = device.name().unwrap_or_else(|_| format!("Output device {index}"));
        let id = device_id(&name, index);
        let status = if selected_device_id.as_deref() == Some(id.as_str()) { "Selected" } else { "Available" };
        let lower = name.to_lowercase();
        let device_type = if lower.contains("cable") || lower.contains("blackhole") || lower.contains("voicemeeter") {
            "Virtual route"
        } else {
            "Output"
        };
        result.push(AudioDevice { id, name, device_type: device_type.to_string(), status: status.to_string() });
    }

    Ok(result)
}

fn find_output_device(requested_id: &str) -> Result<Option<cpal::Device>> {
    let host = cpal::default_host();
    let devices = host.output_devices()?;
    for (index, device) in devices.enumerate() {
        let name = device.name().unwrap_or_else(|_| format!("Output device {index}"));
        if device_id(&name, index) == requested_id {
            return Ok(Some(device));
        }
    }
    Ok(None)
}

fn device_id(name: &str, index: usize) -> String {
    format!("{}-{}", index, name.to_lowercase().replace(' ', "-"))
}
