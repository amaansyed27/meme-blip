pub struct AudioEngine;

impl AudioEngine {
    pub fn new() -> Self {
        Self
    }

    pub fn play(&self, sound_id: &str) {
        println!("play sound: {sound_id}");
    }

    pub fn stop_all(&self) {
        println!("stop all sounds");
    }
}
