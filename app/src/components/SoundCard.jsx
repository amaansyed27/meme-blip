import { motion } from 'framer-motion';
import { Play, SlidersHorizontal } from 'lucide-react';
import { useMemeBlipStore } from '../state/useMemeBlipStore.js';

export function SoundCard({ sound }) {
  const activeSoundId = useMemeBlipStore((state) => state.activeSoundId);
  const playSound = useMemeBlipStore((state) => state.playSound);
  const isActive = activeSoundId === sound.id;

  return (
    <motion.article className={isActive ? 'sound-card is-playing' : 'sound-card'} whileHover={{ y: -4, scale: 1.01 }}>
      <button className={'sound-orb ' + sound.color} onClick={() => playSound(sound.id)}>
        <Play size={18} fill="currentColor" />
      </button>
      <div className="sound-main">
        <h3>{sound.name}</h3>
        <p>{sound.board}</p>
      </div>
      <div className="sound-meta">
        <span>{sound.key}</span>
        <small>{sound.duration}</small>
      </div>
      <div className="volume-track"><span style={{ width: sound.volume + '%' }} /></div>
      <button className="ghost-icon"><SlidersHorizontal size={16} /></button>
    </motion.article>
  );
}
