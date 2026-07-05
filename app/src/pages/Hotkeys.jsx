import { Keyboard, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../components/PageHeader.jsx';
import { companionClient } from '../services/companionClient.js';
import { useMemeBlipStore } from '../state/useMemeBlipStore.js';

export function Hotkeys() {
  const sounds = useMemeBlipStore((state) => state.sounds);
  const initialize = useMemeBlipStore((state) => state.initialize);

  async function saveHotkey(sound, hotkey) {
    await companionClient.assignHotkey(sound.id, hotkey);
    await initialize();
  }

  return (
    <>
      <PageHeader
        eyebrow="Global shortcuts"
        title="Hotkeys belong to the tray companion, not the browser."
        description="Use Alt + number combos first. Restart the companion after changing shortcuts so the native registry can reload them."
        action={<button className="primary-button"><Keyboard size={18} /> Hotkey map</button>}
      />
      <section className="hotkey-list">
        <div className="hotkey-row important"><div><ShieldCheck size={18} /><strong>Stop all sounds</strong></div><kbd>API stop-all</kbd></div>
        {sounds.map((sound) => (
          <div className="hotkey-row" key={sound.id}>
            <div><span className={'mini-dot ' + sound.color} /><strong>{sound.name}</strong><small>{sound.board}</small></div>
            <input className="hotkey-input" defaultValue={sound.key} onBlur={(event) => saveHotkey(sound, event.target.value)} placeholder="Alt + 1" />
          </div>
        ))}
      </section>
    </>
  );
}
