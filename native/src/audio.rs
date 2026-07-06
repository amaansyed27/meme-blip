use crate::models::{AudioDevice, SoundClip};
use anyhow::{anyhow, Context, Result};
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::{SampleFormat, Stream, StreamConfig, SupportedStreamConfig};
use rodio::{Decoder, OutputStream, Sink, Source};
use std::{collections::VecDeque, fs::File, io::BufReader, sync::{mpsc, Arc, Mutex}, thread};

#[derive(Clone)]
pub struct AudioEngine {
    tx: mpsc::Sender<AudioCommand>,
}

enum AudioCommand {
    Play { sound: SoundClip, output_device_id: Option<String>, monitor_device_id: Option<String> },
    ConfigurePassthrough { input_device_id: Option<String>, output_device_id: Option<String>, enabled: bool },
    StopAll,
}

struct ActiveSink {
    _stream: OutputStream,
    sink: Sink,
}

struct ActivePassthrough {
    _input_stream: Stream,
    _output_stream: Stream,
}

struct PassthroughState {
    mono_samples: VecDeque<f32>,
    input_sample_rate: f32,
    read_pos: f32,
}

impl PassthroughState {
    fn new(input_sample_rate: f32) -> Self {
        Self { mono_samples: VecDeque::with_capacity(96_000), input_sample_rate, read_pos: 0.0 }
    }

    fn push_mono(&mut self, sample: f32) {
        while self.mono_samples.len() > 192_000 {
            self.mono_samples.pop_front();
            if self.read_pos > 0.0 {
                self.read_pos -= 1.0;
            }
        }
        self.mono_samples.push_back(sample.clamp(-1.0, 1.0));
    }

    fn next_sample(&mut self, output_sample_rate: f32) -> f32 {
        if self.mono_samples.len() < 2 {
            return 0.0;
        }

        let index = self.read_pos.floor() as usize;
        if index + 1 >= self.mono_samples.len() {
            return 0.0;
        }

        let frac = self.read_pos - index as f32;
        let a = self.mono_samples[index];
        let b = self.mono_samples[index + 1];
        let sample = a + (b - a) * frac;
        self.read_pos += self.input_sample_rate / output_sample_rate;

        let drop_count = self.read_pos.floor() as usize;
        if drop_count > 0 {
            for _ in 0..drop_count.min(self.mono_samples.len().saturating_sub(1)) {
                self.mono_samples.pop_front();
            }
            self.read_pos -= drop_count as f32;
        }

        sample.clamp(-1.0, 1.0)
    }
}

impl AudioEngine {
    pub fn new() -> Self {
        let (tx, rx) = mpsc::channel::<AudioCommand>();
        thread::spawn(move || audio_worker(rx));
        Self { tx }
    }

    pub fn output_devices(&self, output_device_id: Option<String>, monitor_device_id: Option<String>) -> Result<Vec<AudioDevice>> {
        list_output_devices(output_device_id, monitor_device_id)
    }

    pub fn input_devices(&self, input_device_id: Option<String>) -> Result<Vec<AudioDevice>> {
        list_input_devices(input_device_id)
    }

    pub fn play(&self, sound: &SoundClip, output_device_id: Option<String>, monitor_device_id: Option<String>) -> Result<()> {
        self.tx
            .send(AudioCommand::Play { sound: sound.clone(), output_device_id, monitor_device_id })
            .map_err(|error| anyhow!("audio worker unavailable: {error}"))
    }

    pub fn configure_passthrough(&self, input_device_id: Option<String>, output_device_id: Option<String>, enabled: bool) -> Result<()> {
        self.tx
            .send(AudioCommand::ConfigurePassthrough { input_device_id, output_device_id, enabled })
            .map_err(|error| anyhow!("audio worker unavailable: {error}"))
    }

    pub fn stop_all(&self) {
        let _ = self.tx.send(AudioCommand::StopAll);
    }
}

fn audio_worker(rx: mpsc::Receiver<AudioCommand>) {
    let mut active_sinks: Vec<ActiveSink> = Vec::new();
    let mut _passthrough: Option<ActivePassthrough> = None;

    while let Ok(command) = rx.recv() {
        active_sinks.retain(|active| !active.sink.empty());
        match command {
            AudioCommand::Play { sound, output_device_id, monitor_device_id } => {
                if let Err(error) = play_now(&sound, output_device_id, &mut active_sinks) {
                    eprintln!("virtual route playback error: {error}");
                }
                if let Some(monitor_id) = monitor_device_id {
                    if let Err(error) = play_now(&sound, Some(monitor_id), &mut active_sinks) {
                        eprintln!("monitor playback error: {error}");
                    }
                }
            }
            AudioCommand::ConfigurePassthrough { input_device_id, output_device_id, enabled } => {
                _passthrough = None;
                if enabled {
                    match (input_device_id, output_device_id) {
                        (Some(input_id), Some(output_id)) => match start_passthrough(&input_id, &output_id) {
                            Ok(active) => {
                                println!("Mic passthrough active: {input_id} -> {output_id}");
                                _passthrough = Some(active);
                            }
                            Err(error) => eprintln!("mic passthrough error: {error}"),
                        },
                        _ => eprintln!("mic passthrough waiting for input and VB-CABLE route selection"),
                    }
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

fn start_passthrough(input_id: &str, output_id: &str) -> Result<ActivePassthrough> {
    let input_device = find_input_device(input_id)?.ok_or_else(|| anyhow!("selected input device not found"))?;
    let output_device = find_output_device(output_id)?.ok_or_else(|| anyhow!("selected route device not found"))?;

    let input_config = input_device.default_input_config().context("could not open selected input config")?;
    let output_config = output_device.default_output_config().context("could not open selected output config")?;
    let input_sample_rate = input_config.sample_rate().0 as f32;
    let output_sample_rate = output_config.sample_rate().0 as f32;
    let input_channels = input_config.channels();
    let output_channels = output_config.channels();
    let state = Arc::new(Mutex::new(PassthroughState::new(input_sample_rate)));

    println!(
        "Mic passthrough formats: input={}Hz/{}ch -> output={}Hz/{}ch",
        input_sample_rate, input_channels, output_sample_rate, output_channels
    );

    let input_stream = build_input_stream(&input_device, &input_config, state.clone())?;
    let output_stream = build_output_stream(&output_device, &output_config, state)?;
    input_stream.play().context("could not start mic input stream")?;
    output_stream.play().context("could not start virtual cable output stream")?;

    Ok(ActivePassthrough { _input_stream: input_stream, _output_stream: output_stream })
}

fn build_input_stream(device: &cpal::Device, config: &SupportedStreamConfig, state: Arc<Mutex<PassthroughState>>) -> Result<Stream> {
    let stream_config: StreamConfig = config.clone().into();
    let channels = config.channels() as usize;
    let error = |err| eprintln!("input stream error: {err}");
    match config.sample_format() {
        SampleFormat::F32 => device.build_input_stream(&stream_config, move |data: &[f32], _| push_input_frames(data.iter().copied(), channels, &state), error, None),
        SampleFormat::I16 => device.build_input_stream(&stream_config, move |data: &[i16], _| push_input_frames(data.iter().map(|sample| *sample as f32 / i16::MAX as f32), channels, &state), error, None),
        SampleFormat::U16 => device.build_input_stream(&stream_config, move |data: &[u16], _| push_input_frames(data.iter().map(|sample| (*sample as f32 - 32768.0) / 32768.0), channels, &state), error, None),
        other => return Err(anyhow!("unsupported input sample format: {other:?}")),
    }
    .context("could not build mic input stream")
}

fn build_output_stream(device: &cpal::Device, config: &SupportedStreamConfig, state: Arc<Mutex<PassthroughState>>) -> Result<Stream> {
    let stream_config: StreamConfig = config.clone().into();
    let channels = config.channels() as usize;
    let sample_rate = config.sample_rate().0 as f32;
    let error = |err| eprintln!("output stream error: {err}");
    match config.sample_format() {
        SampleFormat::F32 => device.build_output_stream(&stream_config, move |data: &mut [f32], _| fill_output_frames(data, channels, sample_rate, &state), error, None),
        SampleFormat::I16 => device.build_output_stream(&stream_config, move |data: &mut [i16], _| fill_output_frames(data, channels, sample_rate, &state), error, None),
        SampleFormat::U16 => device.build_output_stream(&stream_config, move |data: &mut [u16], _| fill_output_frames(data, channels, sample_rate, &state), error, None),
        other => return Err(anyhow!("unsupported output sample format: {other:?}")),
    }
    .context("could not build virtual cable output stream")
}

fn push_input_frames<I>(samples: I, channels: usize, state: &Arc<Mutex<PassthroughState>>)
where
    I: IntoIterator<Item = f32>,
{
    let mut pending = Vec::with_capacity(channels.max(1));
    let mut locked = state.lock().unwrap();
    for sample in samples {
        pending.push(sample.clamp(-1.0, 1.0));
        if pending.len() == channels.max(1) {
            let mono = pending.iter().copied().sum::<f32>() / pending.len() as f32;
            locked.push_mono(mono);
            pending.clear();
        }
    }
}

trait OutputSample: Sized {
    fn from_f32(sample: f32) -> Self;
}

impl OutputSample for f32 {
    fn from_f32(sample: f32) -> Self { sample.clamp(-1.0, 1.0) }
}

impl OutputSample for i16 {
    fn from_f32(sample: f32) -> Self { (sample.clamp(-1.0, 1.0) * i16::MAX as f32) as i16 }
}

impl OutputSample for u16 {
    fn from_f32(sample: f32) -> Self { ((sample.clamp(-1.0, 1.0) + 1.0) * 0.5 * u16::MAX as f32) as u16 }
}

fn fill_output_frames<T: OutputSample>(data: &mut [T], channels: usize, sample_rate: f32, state: &Arc<Mutex<PassthroughState>>) {
    let channels = channels.max(1);
    let mut locked = state.lock().unwrap();
    for frame in data.chunks_mut(channels) {
        let mono = locked.next_sample(sample_rate);
        for sample in frame {
            *sample = T::from_f32(mono);
        }
    }
}

fn list_output_devices(output_device_id: Option<String>, monitor_device_id: Option<String>) -> Result<Vec<AudioDevice>> {
    let host = cpal::default_host();
    let devices = host.output_devices().context("could not enumerate output devices")?;
    let mut result = Vec::new();

    for (index, device) in devices.enumerate() {
        let name = device.name().unwrap_or_else(|_| format!("Output device {index}"));
        let id = device_id(&name, index);
        let status = if output_device_id.as_deref() == Some(id.as_str()) {
            "Meme route"
        } else if monitor_device_id.as_deref() == Some(id.as_str()) {
            "Monitor"
        } else {
            "Available"
        };
        let lower = name.to_lowercase();
        let device_type = if is_vb_cable_input(&lower) {
            "VB-CABLE route"
        } else if lower.contains("memeblip") || lower.contains("virtual") {
            "Virtual route"
        } else {
            "Speaker output"
        };
        result.push(AudioDevice { id, name, device_type: device_type.to_string(), status: status.to_string() });
    }

    Ok(result)
}

fn list_input_devices(input_device_id: Option<String>) -> Result<Vec<AudioDevice>> {
    let host = cpal::default_host();
    let devices = host.input_devices().context("could not enumerate input devices")?;
    let mut result = Vec::new();

    for (index, device) in devices.enumerate() {
        let name = device.name().unwrap_or_else(|_| format!("Input device {index}"));
        let id = device_id(&name, index);
        let status = if input_device_id.as_deref() == Some(id.as_str()) { "Voice source" } else { "Available" };
        let lower = name.to_lowercase();
        let device_type = if is_vb_cable_output(&lower) {
            "Target app mic"
        } else if lower.contains("microphone") || lower.contains("mic") {
            "Physical mic"
        } else {
            "Input"
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

fn find_input_device(requested_id: &str) -> Result<Option<cpal::Device>> {
    let host = cpal::default_host();
    let devices = host.input_devices()?;
    for (index, device) in devices.enumerate() {
        let name = device.name().unwrap_or_else(|_| format!("Input device {index}"));
        if device_id(&name, index) == requested_id {
            return Ok(Some(device));
        }
    }
    Ok(None)
}

fn is_vb_cable_input(lower_name: &str) -> bool {
    lower_name.contains("cable input") || lower_name.contains("cable in") || (lower_name.contains("vb-audio") && lower_name.contains("input"))
}

fn is_vb_cable_output(lower_name: &str) -> bool {
    lower_name.contains("cable output") || lower_name.contains("cable out") || (lower_name.contains("vb-audio") && lower_name.contains("output"))
}

fn device_id(name: &str, index: usize) -> String {
    format!("{}-{}", index, name.to_lowercase().replace(' ', "-"))
}
