import { Play, Upload } from 'lucide-react';
import { MetricCard } from '../components/MetricCard.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { useMemeBlipStore } from '../state/useMemeBlipStore.js';

export function Dashboard() {
  const sounds = useMemeBlipStore((state) => state.sounds);
  const boards = useMemeBlipStore((state) => state.boards);
  const importSound = useMemeBlipStore((state) => state.importSound);
  const playSound = useMemeBlipStore((state) => state.playSound);
  const companionOnline = useMemeBlipStore((state) => state.companionOnline);
  const activeBoard = useMemeBlipStore((state) => state.activeBoard);
  const selectedBoard = boards.find((board) => board.name === activeBoard) || boards[0];
  const selectedBoardSounds = selectedBoard ? sounds.filter((sound) => sound.board === selectedBoard.name) : [];

  return (
    <>
      <PageHeader
        eyebrow="Control"
        title="MemeBlip"
        description="Local clip playback, hotkeys, mic passthrough, and VB-CABLE routing."
        action={<label className="primary-button file-button"><Upload size={16} /> Import<input type="file" accept="audio/*" onChange={(event) => event.target.files?.[0] && importSound(event.target.files[0])} /></label>}
      />

      <section className="metric-grid dashboard-metrics">
        <MetricCard label="Clips" value={sounds.length} detail="Imported sounds" tone="wave" />
        <MetricCard label="Boards" value={boards.length} detail="All boards" tone="grid" />
        <MetricCard label="Companion" value={companionOnline ? 'Online' : 'Offline'} detail="Local playback API" tone={companionOnline ? 'online' : 'offline'} />
        <MetricCard label="Route" value="VB-CABLE" detail="Cable output for apps" tone="route" />
      </section>

      <section className="dashboard-showcase" aria-label="Selected soundboard">
        <div className="showcase-heading">
          <div>
            <p className="eyebrow">Currently selected board</p>
            {selectedBoard ? (
              <div className="showcase-title-row">
                <span className="board-emoji" aria-hidden="true">🎛️</span>
                <div>
                  <h2>{selectedBoard.name}</h2>
                  <p>{selectedBoard.mode || 'Sounds linked to this board are available for playback and hotkeys.'}</p>
                </div>
                {selectedBoard.favorite ? <span className="active-board-pill">Favorite</span> : null}
              </div>
            ) : (
              <div className="showcase-title-row">
                <span className="board-emoji" aria-hidden="true">＋</span>
                <div>
                  <h2>No board selected</h2>
                  <p>Create or import a soundboard to link clips and hotkeys.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedBoardSounds.length ? (
          <div className="showcase-list">
            {selectedBoardSounds.slice(0, 8).map((sound) => (
              <article className="showcase-sound-row" key={sound.id}>
                <button className="sound-play" onClick={() => playSound(sound.id)} aria-label={`Play ${sound.name}`}><Play size={13} fill="currentColor" /></button>
                <strong>{sound.name}</strong>
                <span className="showcase-meta">Board: {sound.board || selectedBoard.name}</span>
                <span className="showcase-meta">Volume: {sound.volume ?? 80}%</span>
                <kbd>{sound.hotkey || 'No key'}</kbd>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state dashboard-empty">
            {selectedBoard ? 'No clips on this board yet. Import audio while this board is selected.' : 'Create or import a soundboard to link hotkeys.'}
          </div>
        )}
      </section>
    </>
  );
}
