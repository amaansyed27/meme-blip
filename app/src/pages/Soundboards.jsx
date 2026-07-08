import React from 'react';
import { Plus } from 'lucide-react';
import { BoardCard } from '../components/BoardCard.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { useMemeBlipStore } from '../state/useMemeBlipStore.js';

export function Soundboards() {
  const boards = useMemeBlipStore((state) => state.boards);
  const sounds = useMemeBlipStore((state) => state.sounds);
  const activeBoard = useMemeBlipStore((state) => state.activeBoard);
  const setActiveBoard = useMemeBlipStore((state) => state.setActiveBoard);
  const createBoard = useMemeBlipStore((state) => state.createBoard);
  const deleteBoard = useMemeBlipStore((state) => state.deleteBoard);
  const setFavoriteBoard = useMemeBlipStore((state) => state.setFavoriteBoard);
  const setRoute = useMemeBlipStore((state) => state.setRoute);
  const [newBoardName, setNewBoardName] = React.useState('');

  async function openBoard(boardName) {
    await setActiveBoard(boardName);
    setRoute('sounds');
  }

  async function submitBoard(event) {
    event.preventDefault();
    if (!newBoardName.trim()) return;
    await createBoard(newBoardName);
    setNewBoardName('');
  }

  async function removeBoard(boardName) {
    const boardSounds = sounds.filter((sound) => sound.board.toLowerCase() === boardName.toLowerCase());
    const suffix = boardSounds.length ? ` ${boardSounds.length} clip${boardSounds.length === 1 ? '' : 's'} will move to Meme Kit.` : '';
    if (!window.confirm(`Delete “${boardName}”?${suffix}`)) return;
    await deleteBoard(boardName);
  }

  return (
    <>
      <PageHeader
        eyebrow="Boards"
        title="Choose which board owns your hotkeys."
        description="Opening a board filters the library and scopes hotkeys to that board. Deleting a board moves its clips back to Meme Kit."
        action={activeBoard ? <button className="subtle-button" onClick={() => setActiveBoard(null)}>Use all boards</button> : null}
      />

      <form className="create-board-row" onSubmit={submitBoard}>
        <input value={newBoardName} onChange={(event) => setNewBoardName(event.target.value)} placeholder="New soundboard name" />
        <button className="primary-button" type="submit"><Plus size={15} /> Create soundboard</button>
      </form>

      {boards.length ? (
        <section className="board-grid">
          {boards.map((board) => {
            const boardSounds = sounds.filter((sound) => sound.board === board.name);
            return <BoardCard key={board.id} board={board} active={activeBoard === board.name} favorite={board.favorite} previewSounds={boardSounds} onActivate={openBoard} onFavorite={setFavoriteBoard} onDelete={removeBoard} />;
          })}
        </section>
      ) : (
        <section className="empty-state">Create a soundboard or import clips to start.</section>
      )}
    </>
  );
}
