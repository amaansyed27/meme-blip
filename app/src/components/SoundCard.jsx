import { Play, Trash2 } from 'lucide-react';
import { useMemeBlipStore } from '../state/useMemeBlipStore.js';

export function SoundCard({ sound, editable = false }) {
  const activeSoundId = useMemeBlipStore((state) => state.activeSoundId);
  const previewSound = useMemeBlipStore((state) => state.previewSound);
  const updateSound = useMemeBlipStore((state) => state.updateSound);
  const deleteSound = useMemeBlipStore((state) => state.deleteSound);
  const isActive = activeSoundId === sound.id;

  return (
    <article className={isActive ? 'sound-card is-playing' : 'sound-card'}>
      <button className="sound-play" onClick={() => previewSound(sound.id)} aria-label={'Preview ' + sound.name}>
        <Play size={15} fill="currentColor" />
      </button>

      <div className="sound-main">
        {editable ? <input className="inline-edit title-edit" defaultValue={sound.name} onBlur={(event) => updateSound(sound.id, { name: event.target.value })} /> : <h3>{sound.name}</h3>}
        {editable ? <input className="inline-edit board-edit" defaultValue={sound.board} onBlur={(event) => updateSound(sound.id, { board: event.target.value })} /> : <p>{sound.board}</p>}
      </div>

      <div className="sound-meta"><span>{sound.key}</span><small>{sound.duration}</small></div>

      {editable ? <button className="sound-delete danger-icon" onClick={() => deleteSound(sound.id)} aria-label={'Delete ' + sound.name}><Trash2 size={14} /></button> : null}

      {editable ? <input className="volume-slider" type="range" min="0" max="150" defaultValue={sound.volume} onMouseUp={(event) => updateSound(sound.id, { volume: Number(event.currentTarget.value) })} /> : <div className="volume-track"><span style={{ width: sound.volume + '%' }} /></div>}
    </article>
  );
}
