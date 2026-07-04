import { Plus, Radio, Upload } from 'lucide-react';
import { BoardCard } from '../components/BoardCard.jsx';
import { MetricCard } from '../components/MetricCard.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { SoundCard } from '../components/SoundCard.jsx';
import { useMemeBlipStore } from '../state/useMemeBlipStore.js';

export function Dashboard() {
  const sounds = useMemeBlipStore((state) => state.sounds);
  const boards = useMemeBlipStore((state) => state.boards);
  const addDemoSound = useMemeBlipStore((state) => state.addDemoSound);

  return (
    <>
      <PageHeader
        eyebrow="Control center"
        title="Trigger sounds without leaving the match or meeting."
        description="A local dashboard for setup, plus a tray companion for hotkeys and audio routing."
        action={<button className="primary-button" onClick={addDemoSound}><Plus size={18} /> Add sound</button>}
      />
      <section className="metric-grid">
        <MetricCard label="Sounds" value={sounds.length} detail="Local clips indexed" />
        <MetricCard label="Boards" value={boards.length} detail="Mode-specific collections" />
        <MetricCard label="Latency" value="Low" detail="Native companion path" />
        <MetricCard label="Route" value="Cable" detail="Ready for mic apps" />
      </section>
      <section className="split-grid">
        <div className="panel large-panel">
          <div className="panel-heading"><h2>Quick fire</h2><button className="subtle-button"><Upload size={16} /> Import</button></div>
          <div className="sound-grid compact">{sounds.slice(0, 4).map((sound) => <SoundCard key={sound.id} sound={sound} />)}</div>
        </div>
        <div className="panel signal-panel">
          <Radio size={28} />
          <h2>Companion online</h2>
          <p>The tray app owns hotkeys, output devices, and background playback. This dashboard stays clean.</p>
          <div className="pulse-line"><span /></div>
        </div>
      </section>
      <section className="board-row">{boards.map((board) => <BoardCard key={board.id} board={board} />)}</section>
    </>
  );
}
