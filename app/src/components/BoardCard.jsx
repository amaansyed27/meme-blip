import { CheckCircle2 } from 'lucide-react';

export function BoardCard({ board, active = false, onActivate }) {
  return (
    <button className={active ? 'board-card active-board' : 'board-card'} onClick={() => onActivate(board.name)}>
      <div className="board-title-row">
        <h3>{board.name}</h3>
        {active ? <span className="active-board-pill"><CheckCircle2 size={13} /> Active</span> : null}
      </div>
      <p>{board.mode}</p>
      <span>{active ? 'Hotkeys scoped here' : 'Activate board'}</span>
    </button>
  );
}
