import { motion } from 'framer-motion';
import { CheckCircle2, Gamepad2 } from 'lucide-react';

export function BoardCard({ board, active = false, onActivate }) {
  return (
    <motion.button className={active ? 'board-card active-board ' + board.accent : 'board-card ' + board.accent} onClick={() => onActivate(board.name)} whileHover={{ y: -2 }}>
      <div className="board-card-top">
        <div className="board-icon"><Gamepad2 size={19} /></div>
        {active ? <span className="active-board-pill"><CheckCircle2 size={13} /> Active</span> : null}
      </div>
      <h3>{board.name}</h3>
      <p>{board.mode}</p>
      <span>{active ? 'Hotkeys scoped to this board' : 'Click to activate'}</span>
    </motion.button>
  );
}
