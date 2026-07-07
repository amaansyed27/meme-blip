import { BoardCard } from '../components/BoardCard.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { useMemeBlipStore } from '../state/useMemeBlipStore.js';

export function Soundboards() {
  const boards = useMemeBlipStore((state) => state.boards);
  const activeBoard = useMemeBlipStore((state) => state.activeBoard);
  const setActiveBoard = useMemeBlipStore((state) => state.setActiveBoard);
  const setRoute = useMemeBlipStore((state) => state.setRoute);

  async function openBoard(boardName) {
    await setActiveBoard(boardName);
    setRoute('sounds');
  }

  return (
    <>
      <PageHeader
        eyebrow="Boards"
        title="Choose which board owns your hotkeys."
        description="Opening a board filters the library and scopes hotkeys to that board."
        action={activeBoard ? <button className="subtle-button" onClick={() => setActiveBoard(null)}>Use all boards</button> : null}
      />

      {boards.length ? (
        <section className="board-grid">
          {boards.map((board) => <BoardCard key={board.id} board={board} active={activeBoard === board.name} onActivate={openBoard} />)}
        </section>
      ) : (
        <section className="empty-state">Import clips to create your first soundboard.</section>
      )}
    </>
  );
}
