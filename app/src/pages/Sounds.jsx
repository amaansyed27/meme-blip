import { FolderPlus, Upload } from 'lucide-react';
import { PageHeader } from '../components/PageHeader.jsx';
import { SoundCard } from '../components/SoundCard.jsx';
import { useMemeBlipStore } from '../state/useMemeBlipStore.js';

export function Sounds() {
  const sounds = useMemeBlipStore((state) => state.sounds);
  const importSound = useMemeBlipStore((state) => state.importSound);
  const query = useMemeBlipStore((state) => state.query).toLowerCase();
  const filtered = sounds.filter((sound) => sound.name.toLowerCase().includes(query) || sound.board.toLowerCase().includes(query));

  return (
    <>
      <PageHeader
        eyebrow="Library"
        title="Keep clips organised instead of buried in folders."
        description="Rename clips, change boards, tune volume, delete noise, and keep the library usable."
        action={<label className="primary-button file-button"><Upload size={18} /> Import clips<input type="file" accept="audio/*" onChange={(event) => event.target.files?.[0] && importSound(event.target.files[0])} /></label>}
      />
      <section className="toolbar-panel">
        <button className="filter-chip active">All clips</button>
        <button className="filter-chip">Memes</button>
        <button className="filter-chip">Gaming</button>
        <button className="filter-chip">Meetings</button>
        <button className="filter-chip"><FolderPlus size={15} /> New folder</button>
      </section>
      {filtered.length ? <section className="sound-grid">{filtered.map((sound) => <SoundCard key={sound.id} sound={sound} editable />)}</section> : <section className="empty-state">No sounds found. Import an audio clip to create your first board.</section>}
    </>
  );
}
