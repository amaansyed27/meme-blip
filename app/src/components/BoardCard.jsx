import { CheckCircle2, Star, Trash2 } from 'lucide-react';

export function BoardCard({ board, active = false, favorite = false, previewSounds = [], onActivate, onFavorite, onDelete, actionLabel }) {
  function toggleFavorite(event) {
    event.preventDefault();
    event.stopPropagation();
    onFavorite?.(board.name, !favorite);
  }

  function deleteBoard(event) {
    event.preventDefault();
    event.stopPropagation();
    onDelete?.(board.name);
  }

  const canDelete = board.name.toLowerCase() !== 'meme kit';

  return (
    <article className={active ? 'board-card active-board' : 'board-card'} onClick={() => onActivate(board.name)} role="button" tabIndex={0} onKeyDown={(event) => event.key === 'Enter' && onActivate(board.name)}>
      <div className="board-title-row">
        <h3>{board.name}</h3>
        <span className="board-pills">
          {active ? <span className="active-board-pill"><CheckCircle2 size={13} /> Selected</span> : null}
          <button className={favorite ? 'favorite-board-pill is-favorite' : 'favorite-board-pill'} onClick={toggleFavorite} title={favorite ? 'Remove favorite' : 'Mark favorite'}><Star size={12} fill={favorite ? 'currentColor' : 'none'} /> {favorite ? 'Favorite' : 'Star'}</button>
          {canDelete ? <button className="delete-board-pill" onClick={deleteBoard} title="Delete soundboard"><Trash2 size={12} /> Delete</button> : null}
        </span>
      </div>
      <p>{board.mode}</p>
      <span className="board-action-copy">{actionLabel || (active ? 'Open selected board' : 'Open board')}</span>
      {previewSounds.length ? (
        <div className="board-preview-list">
          {previewSounds.slice(0, 4).map((sound) => <small key={sound.id}>{sound.name}</small>)}
        </div>
      ) : <div className="board-preview-list empty"><small>No clips yet. Import while this board is selected.</small></div>}
    </article>
  );
}
