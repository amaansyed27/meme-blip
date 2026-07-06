import { BoardCard } from '../components/BoardCard.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { useMemeBlipStore } from '../state/useMemeBlipStore.js';

export function Soundboards() {
  const boards = useMemeBlipStore((state) => state.boards);
  const activeBoard = useMemeBlipStore((state) => state.activeBoard);
  const setActiveBoard = useMemeBlipStore((state) => state.setActiveBoard);

  return (
    <>
      <PageHeader
        eyebrow="Boards"
        title="Choose which board owns your hotkeys."
        description="Only the active board responds to global hotkeys. Clips can still be played manually from the library."
        action={activeBoard ? <button className="subtle-button" onClick={() => setActiveBoard(null)}>Use all boards</button> : null}
      />

      {boards.length ? (
        <section className="board-grid">
          {boards.map((board) => <BoardCard key={board.id} board={board} active={activeBoard === board.name} onActivate={setActiveBoard} />)}
        </section>
      ) : (
        <section className="empty-state">Import clips to create your first soundboard.</section>
      )}
    </>
  );
}
