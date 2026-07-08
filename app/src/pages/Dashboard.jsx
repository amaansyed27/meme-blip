import { MoreHorizontal, Pencil, Play, Upload } from 'lucide-react';
import { MetricCard } from '../components/MetricCard.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { useMemeBlipStore } from '../state/useMemeBlipStore.js';

const demoSounds = [
  { id: 'demo-vine-boom', name: 'Vine Boom', hotkey: 'F1', board: 'Streamer Essentials' },
  { id: 'demo-bruh', name: 'Bruh', hotkey: 'F2', board: 'Streamer Essentials' },
  { id: 'demo-airhorn', name: 'Airhorn', hotkey: 'F3', board: 'Streamer Essentials' },
  { id: 'demo-sad-trombone', name: 'Sad Trombone', hotkey: 'F4', board: 'Streamer Essentials' },
  { id: 'demo-victory-horn', name: 'Victory Horn', hotkey: 'F5', board: 'Streamer Essentials' }
];

export function Dashboard() {
  const sounds = useMemeBlipStore((state) => state.sounds);
  const boards = useMemeBlipStore((state) => state.boards);
  const importSound = useMemeBlipStore((state) => state.importSound);
  const playSound = useMemeBlipStore((state) => state.playSound);
  const companionOnline = useMemeBlipStore((state) => state.companionOnline);
  const activeBoard = useMemeBlipStore((state) => state.activeBoard);
  const selectedBoard = boards.find((board) => board.name === activeBoard) || boards[0];
  const selectedBoardName = selectedBoard?.name || 'Streamer Essentials';
  const selectedBoardSounds = selectedBoard ? sounds.filter((sound) => sound.board === selectedBoard.name) : [];
  const showcaseSounds = selectedBoardSounds.length ? selectedBoardSounds.slice(0, 5) : demoSounds;

  function playShowcaseSound(sound) {
    if (String(sound.id).startsWith('demo-')) return;
    playSound(sound.id);
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
        <MetricCard label="Clips" value={sounds.length} detail="Imported sounds" tone="wave" />
        <MetricCard label="Boards" value={boards.length} detail="All boards" tone="grid" />
        <MetricCard label="Companion" value={companionOnline ? 'Online' : 'Offline'} detail="Local playback API" tone={companionOnline ? 'online' : 'offline'} />
        <MetricCard label="Route" value="VB-CABLE" detail="Cable output for apps" tone="route" />
      </section>

      <section className="dashboard-showcase" aria-label="Selected soundboard">
        <div className="showcase-heading">
          <div>
            <p className="eyebrow">Currently selected board</p>
            <div className="showcase-title-row">
              <span className="board-emoji" aria-hidden="true">🎉</span>
              <div>
                <h2>{selectedBoardName}</h2>
                <p>The go-to sounds for hype, laughs, and those perfect moments.</p>
              </div>
              <span className="active-board-pill">Default</span>
            </div>
          </div>
          <div className="showcase-actions">
            <button className="subtle-button"><Pencil size={14} /> Edit board</button>
            <button className="icon-button" aria-label="More board actions"><MoreHorizontal size={17} /></button>
          </div>
        </div>

        <div className="showcase-list">
          {showcaseSounds.map((sound, index) => (
            <article className="showcase-sound-row" key={sound.id || sound.name}>
              <button className="sound-play" onClick={() => playShowcaseSound(sound)} aria-label={`Play ${sound.name}`}><Play size={13} fill="currentColor" /></button>
              <strong>{sound.name}</strong>
              <div className="fake-wave" aria-hidden="true">
                {Array.from({ length: 26 }).map((_, waveIndex) => <span key={waveIndex} style={{ '--wave': (waveIndex + index) % 9 }} />)}
              </div>
              <kbd>{sound.hotkey || `F${index + 1}`}</kbd>
              <button className="sound-delete" aria-label="More clip actions"><MoreHorizontal size={17} /></button>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
