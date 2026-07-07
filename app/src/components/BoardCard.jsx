import { CheckCircle2, Star } from 'lucide-react';

export function BoardCard({ board, active = false, favorite = false, onActivate, actionLabel }) {
  return (
    <button className={active ? 'board-card active-board' : 'board-card'} onClick={() => onActivate(board.name)}>
      <div className="board-title-row">
        <h3>{board.name}</h3>
        {favorite ? <span className="favorite-board-pill"><Star size={12} fill="currentColor" /> Favorite</span> : null}
        {active && !favorite ? <span className="active-board-pill"><CheckCircle2 size={13} /> Active</span> : null}
      </div>
      <p>{board.mode}</p>
      <span>{actionLabel || (active ? 'Open active board' : 'Open board')}</span>
    </button>
  );
}
