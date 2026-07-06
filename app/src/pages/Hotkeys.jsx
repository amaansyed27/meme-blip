import React from 'react';
import { Gamepad2, Keyboard, Mic2, RotateCcw, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../components/PageHeader.jsx';
import { useMemeBlipStore } from '../state/useMemeBlipStore.js';

const presets = [
  {
    id: 'valorant',
    name: 'Valorant PTT',
    icon: Gamepad2,
    keys: ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8']
  },
  {
    id: 'meeting',
    name: 'Meeting',
    icon: Mic2,
    keys: ['Ctrl + Alt + 1', 'Ctrl + Alt + 2', 'Ctrl + Alt + 3', 'Ctrl + Alt + 4', 'Ctrl + Alt + 5', 'Ctrl + Alt + 6']
  },
  {
    id: 'number-row',
    name: 'Number row',
    icon: Keyboard,
    keys: ['Alt + 1', 'Alt + 2', 'Alt + 3', 'Alt + 4', 'Alt + 5', 'Alt + 6', 'Alt + 7', 'Alt + 8']
  }
];

function normalizeKey(event) {
  const blocked = ['Control', 'Shift', 'Alt', 'Meta'];
  if (blocked.includes(event.key)) return null;

  let key = event.key;
  if (key.length === 1) key = key.toUpperCase();
  const supported = /^[A-Z0-9]$/.test(key) || /^F([1-9]|1[0-2])$/.test(key);
  if (!supported) return null;

  const parts = [];
  if (event.ctrlKey) parts.push('Ctrl');
  if (event.altKey) parts.push('Alt');
  if (event.shiftKey) parts.push('Shift');
  parts.push(key);
  return parts.join(' + ');
}

export function Hotkeys() {
  const sounds = useMemeBlipStore((state) => state.sounds);
  const assignHotkey = useMemeBlipStore((state) => state.assignHotkey);
  const [recordingId, setRecordingId] = React.useState(null);

  async function applyPreset(preset) {
    const targets = sounds.slice(0, preset.keys.length);
    await Promise.all(targets.map((sound, index) => assignHotkey(sound.id, preset.keys[index])));
  }

  async function clearAll() {
    await Promise.all(sounds.map((sound) => assignHotkey(sound.id, 'Unassigned')));
  }

  async function capture(event, sound) {
    if (recordingId !== sound.id) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.key === 'Escape') {
      setRecordingId(null);
      return;
    }
    const combo = normalizeKey(event);
    if (!combo) return;
    await assignHotkey(sound.id, combo);
    setRecordingId(null);
  }

  function startRecording(event, sound) {
    setRecordingId(sound.id);
    event.currentTarget.focus();
  }

  return (
    <>
      <PageHeader
        eyebrow="Shortcuts"
        title="Hotkeys"
        description="For Valorant, hold your voice key first, then press the MemeBlip hotkey."
        action={<button className="subtle-button" onClick={clearAll}><RotateCcw size={16} /> Clear</button>}
      />

      <section className="ptt-note">
        <strong>Valorant flow</strong>
        <span>Hold <kbd>V</kbd>, press <kbd>F1</kbd>–<kbd>F8</kbd>, release after the clip starts.</span>
      </section>

      <section className="preset-row">
        {presets.map((preset) => {
          const Icon = preset.icon;
          return <button className="preset-card" key={preset.id} onClick={() => applyPreset(preset)}><Icon size={17} /><span>{preset.name}</span></button>;
        })}
      </section>

      <section className="hotkey-list">
        <div className="hotkey-row important"><div><ShieldCheck size={18} /><strong>Stop all sounds</strong></div><kbd>Stop button</kbd></div>
        {sounds.map((sound) => (
          <div className="hotkey-row" key={sound.id}>
            <div><span className={'mini-dot ' + sound.color} /><strong>{sound.name}</strong><small>{sound.board}</small></div>
            <button
              className={recordingId === sound.id ? 'record-hotkey recording' : 'record-hotkey'}
              onClick={(event) => startRecording(event, sound)}
              onKeyDown={(event) => capture(event, sound)}
            >
              {recordingId === sound.id ? 'Press keys…' : sound.key || 'Record'}
            </button>
          </div>
        ))}
      </section>
    </>
  );
}
