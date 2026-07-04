import { Keyboard, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../components/PageHeader.jsx';
import { useMemeBlipStore } from '../state/useMemeBlipStore.js';

export function Hotkeys() {
  const sounds = useMemeBlipStore((state) => state.sounds);

  return (
    <>
      <PageHeader
        eyebrow="Global shortcuts"
        title="Hotkeys belong to the tray companion, not the browser."
        description="Assign fast combos, detect conflicts, and reserve one emergency stop key."
        action={<button className="primary-button"><Keyboard size={18} /> Capture key</button>}
      />
      <section className="hotkey-list">
        <div className="hotkey-row important"><div><ShieldCheck size={18} /><strong>Stop all sounds</strong></div><kbd>F8</kbd></div>
        {sounds.map((sound) => (
          <div className="hotkey-row" key={sound.id}>
            <div><span className={'mini-dot ' + sound.color} /><strong>{sound.name}</strong><small>{sound.board}</small></div>
            <kbd>{sound.key}</kbd>
          </div>
        ))}
      </section>
    </>
  );
}
