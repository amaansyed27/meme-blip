import { motion } from 'framer-motion';
import { Play, Trash2 } from 'lucide-react';
import { useMemeBlipStore } from '../state/useMemeBlipStore.js';

export function SoundCard({ sound, editable = false }) {
  const activeSoundId = useMemeBlipStore((state) => state.activeSoundId);
  const playSound = useMemeBlipStore((state) => state.playSound);
  const updateSound = useMemeBlipStore((state) => state.updateSound);
  const deleteSound = useMemeBlipStore((state) => state.deleteSound);
  const isActive = activeSoundId === sound.id;

  return (
    <motion.article className={isActive ? 'sound-card is-playing' : 'sound-card'} whileHover={{ y: -2 }}>
      <button className={'sound-orb ' + sound.color} onClick={() => playSound(sound.id)} aria-label={'Play ' + sound.name}>
        <Play size={17} fill="currentColor" />
      </button>

      <div className="sound-main">
        {editable ? <input className="inline-edit title-edit" defaultValue={sound.name} onBlur={(event) => updateSound(sound.id, { name: event.target.value })} /> : <h3>{sound.name}</h3>}
        {editable ? <input className="inline-edit board-edit" defaultValue={sound.board} onBlur={(event) => updateSound(sound.id, { board: event.target.value })} /> : <p>{sound.board}</p>}
        {editable ? <input className="volume-slider" type="range" min="0" max="150" defaultValue={sound.volume} onMouseUp={(event) => updateSound(sound.id, { volume: Number(event.currentTarget.value) })} /> : null}
      </div>

      <div className="sound-actions">
        <div className="sound-meta">
          <span>{sound.key}</span>
          <small>{sound.duration}</small>
        </div>
        {editable ? <button className="sound-delete danger-icon" onClick={() => deleteSound(sound.id)} aria-label={'Delete ' + sound.name}><Trash2 size={15} /></button> : null}
      </div>

      <div className="volume-track"><span style={{ width: sound.volume + '%' }} /></div>
    </motion.article>
  );
}
