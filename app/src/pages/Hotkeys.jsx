import React from 'react';
import { Gamepad2, Keyboard, Mic2, RotateCcw, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../components/PageHeader.jsx';
import { useMemeBlipStore } from '../state/useMemeBlipStore.js';

const presets = [
  {
    id: 'valorant',
    name: 'Valorant',
    icon: Gamepad2,
    keys: ['Alt + F1', 'Alt + F2', 'Alt + F3', 'Alt + F4', 'Alt + F5', 'Alt + F6', 'Alt + F7', 'Alt + F8']
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

  const parts = [];
  if (event.ctrlKey) parts.push('Ctrl');
  if (event.altKey) parts.push('Alt');
  if (event.shiftKey) parts.push('Shift');

  let key = event.key;
  if (key === ' ') key = 'Space';
  if (key.length === 1) key = key.toUpperCase();
  if (key.startsWith('Arrow')) key = key.replace('Arrow', '');

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

  return (
    <>
      <PageHeader
        eyebrow="Shortcuts"
        title="Hotkeys"
        description="Pick a preset or click Record and press a combo."
        action={<button className="subtle-button" onClick={clearAll}><RotateCcw size={16} /> Clear</button>}
      />

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
              onClick={() => setRecordingId(sound.id)}
              onKeyDown={(event) => capture(event, sound)}
              autoFocus={recordingId === sound.id}
            >
              {recordingId === sound.id ? 'Press keys…' : sound.key || 'Record'}
            </button>
          </div>
        ))}
      </section>
    </>
  );
}
