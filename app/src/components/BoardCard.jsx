import { CheckCircle2, Star } from 'lucide-react';

export function BoardCard({ board, active = false, favorite = false, previewSounds = [], onActivate, onFavorite, actionLabel }) {
  function toggleFavorite(event) {
    event.preventDefault();
    event.stopPropagation();
    onFavorite?.(board.name, !favorite);
  }

  return (
    <button className={active ? 'board-card active-board' : 'board-card'} onClick={() => onActivate(board.name)}>
      <div className="board-title-row">
        <h3>{board.name}</h3>
        <span className="board-pills">
          {active ? <span className="active-board-pill"><CheckCircle2 size={13} /> Selected</span> : null}
          <span className={favorite ? 'favorite-board-pill is-favorite' : 'favorite-board-pill'} onClick={toggleFavorite} title={favorite ? 'Remove favorite' : 'Mark favorite'}><Star size={12} fill={favorite ? 'currentColor' : 'none'} /> {favorite ? 'Favorite' : 'Star'}</span>
        </span>
      </div>
      <p>{board.mode}</p>
      <span className="board-action-copy">{actionLabel || (active ? 'Open selected board' : 'Open board')}</span>
      {previewSounds.length ? (
        <div className="board-preview-list">
          {previewSounds.slice(0, 4).map((sound) => <small key={sound.id}>{sound.name}</small>)}
        </div>
      ) : <div className="board-preview-list empty"><small>No clips yet. Import while this board is selected.</small></div>}
    </button>
  );
}
