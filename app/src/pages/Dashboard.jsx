import { Radio, Upload } from 'lucide-react';
import { BoardCard } from '../components/BoardCard.jsx';
import { MetricCard } from '../components/MetricCard.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { SoundCard } from '../components/SoundCard.jsx';
import { useMemeBlipStore } from '../state/useMemeBlipStore.js';

export function Dashboard() {
  const sounds = useMemeBlipStore((state) => state.sounds);
  const boards = useMemeBlipStore((state) => state.boards);
  const importSound = useMemeBlipStore((state) => state.importSound);
  const companionOnline = useMemeBlipStore((state) => state.companionOnline);

  return (
    <>
      <PageHeader
        eyebrow="Control center"
        title="Trigger sounds without leaving the match or meeting."
        description="A local dashboard for setup, plus a tray companion for hotkeys and audio routing."
        action={<label className="primary-button file-button"><Upload size={18} /> Import sound<input type="file" accept="audio/*" onChange={(event) => event.target.files?.[0] && importSound(event.target.files[0])} /></label>}
      />
      <section className="metric-grid">
        <MetricCard label="Sounds" value={sounds.length} detail="Local clips indexed" />
        <MetricCard label="Boards" value={boards.length} detail="Generated from library" />
        <MetricCard label="API" value={companionOnline ? 'Live' : 'Down'} detail="Local companion status" />
        <MetricCard label="Route" value="Cable" detail="Ready for mic apps" />
      </section>
      <section className="split-grid">
        <div className="panel large-panel">
          <div className="panel-heading"><h2>Quick fire</h2><label className="subtle-button file-button"><Upload size={16} /> Import<input type="file" accept="audio/*" onChange={(event) => event.target.files?.[0] && importSound(event.target.files[0])} /></label></div>
          {sounds.length ? <div className="sound-grid compact">{sounds.slice(0, 4).map((sound) => <SoundCard key={sound.id} sound={sound} />)}</div> : <div className="empty-state">Import an audio clip to start using MemeBlip.</div>}
        </div>
        <div className="panel signal-panel">
          <Radio size={28} />
          <h2>{companionOnline ? 'Companion online' : 'Companion offline'}</h2>
          <p>The tray app owns hotkeys, output devices, and background playback. This dashboard talks to it through localhost.</p>
          <div className="pulse-line"><span /></div>
        </div>
      </section>
      {boards.length ? <section className="board-row">{boards.map((board) => <BoardCard key={board.id} board={board} />)}</section> : null}
    </>
  );
}
