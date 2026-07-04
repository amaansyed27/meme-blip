import { motion } from 'framer-motion';
import { Gamepad2 } from 'lucide-react';

export function BoardCard({ board }) {
  return (
    <motion.article className={'board-card ' + board.accent} whileHover={{ y: -5, rotateX: 2 }}>
      <div className="board-icon"><Gamepad2 size={20} /></div>
      <h3>{board.name}</h3>
      <p>{board.mode}</p>
      <span>{board.sounds} sounds</span>
    </motion.article>
  );
}
