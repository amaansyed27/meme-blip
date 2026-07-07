import { Upload } from 'lucide-react';
import { BoardCard } from '../components/BoardCard.jsx';
import { MetricCard } from '../components/MetricCard.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { useMemeBlipStore } from '../state/useMemeBlipStore.js';

export function Dashboard() {
  const sounds = useMemeBlipStore((state) => state.sounds);
  const boards = useMemeBlipStore((state) => state.boards);
  const importSound = useMemeBlipStore((state) => state.importSound);
  const companionOnline = useMemeBlipStore((state) => state.companionOnline);
  const activeBoard = useMemeBlipStore((state) => state.activeBoard);
  const setActiveBoard = useMemeBlipStore((state) => state.setActiveBoard);
  const setRoute = useMemeBlipStore((state) => state.setRoute);
  const favoriteBoards = boards.slice(0, 4);

  async function openBoard(boardName) {
    await setActiveBoard(boardName);
    setRoute('sounds');
  }

  return (
    <>
      <PageHeader
        eyebrow="Control"
        title="MemeBlip"
        description="Local clip playback, hotkeys, mic passthrough, and VB-CABLE routing."
        action={<label className="primary-button file-button"><Upload size={16} /> Import<input type="file" accept="audio/*" onChange={(event) => event.target.files?.[0] && importSound(event.target.files[0])} /></label>}
      />

      <section className="metric-grid dashboard-metrics">
        <MetricCard label="Clips" value={sounds.length} detail="Imported sounds" />
        <MetricCard label="Boards" value={boards.length} detail={activeBoard || 'All boards'} />
        <MetricCard label="Companion" value={companionOnline ? 'Online' : 'Offline'} detail="Local playback API" />
        <MetricCard label="Route" value="Cable" detail="CABLE Output for apps" />
      </section>

      <section className="dashboard-section">
        <div className="section-heading"><h2>Favorite soundboards</h2><span className="muted-copy">Open a board to manage its clips</span></div>
        {favoriteBoards.length ? (
          <div className="board-grid favorite-board-grid">
            {favoriteBoards.map((board) => <BoardCard key={board.id} board={board} active={activeBoard === board.name} favorite onActivate={openBoard} actionLabel="Open soundboard" />)}
          </div>
        ) : (
          <div className="empty-state">Import clips to create your first soundboard.</div>
        )}
      </section>
    </>
  );
}
