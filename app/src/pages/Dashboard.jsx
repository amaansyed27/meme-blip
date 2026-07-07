import { Upload } from 'lucide-react';
import { MetricCard } from '../components/MetricCard.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { SoundCard } from '../components/SoundCard.jsx';
import { useMemeBlipStore } from '../state/useMemeBlipStore.js';

export function Dashboard() {
  const sounds = useMemeBlipStore((state) => state.sounds);
  const boards = useMemeBlipStore((state) => state.boards);
  const importSound = useMemeBlipStore((state) => state.importSound);
  const companionOnline = useMemeBlipStore((state) => state.companionOnline);
  const activeBoard = useMemeBlipStore((state) => state.activeBoard);

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

      <section className="panel flat-panel">
        <div className="panel-heading"><h2>Recent clips</h2><span className="muted-copy">Click to test playback</span></div>
        {sounds.length ? <div className="sound-table">{sounds.slice(0, 6).map((sound) => <SoundCard key={sound.id} sound={sound} />)}</div> : <div className="empty-state">Import an audio clip to start using MemeBlip.</div>}
      </section>
    </>
  );
}
