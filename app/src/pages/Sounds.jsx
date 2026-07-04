import { FolderPlus, Upload } from 'lucide-react';
import { PageHeader } from '../components/PageHeader.jsx';
import { SoundCard } from '../components/SoundCard.jsx';
import { useMemeBlipStore } from '../state/useMemeBlipStore.js';

export function Sounds() {
  const sounds = useMemeBlipStore((state) => state.sounds);
  const query = useMemeBlipStore((state) => state.query).toLowerCase();
  const filtered = sounds.filter((sound) => sound.name.toLowerCase().includes(query) || sound.board.toLowerCase().includes(query));

  return (
    <>
      <PageHeader
        eyebrow="Library"
        title="Keep clips organised instead of buried in folders."
        description="Import sounds, tag them, tune volume, and assign them to boards."
        action={<button className="primary-button"><Upload size={18} /> Import clips</button>}
      />
      <section className="toolbar-panel">
        <button className="filter-chip active">All clips</button>
        <button className="filter-chip">Memes</button>
        <button className="filter-chip">Gaming</button>
        <button className="filter-chip">Meetings</button>
        <button className="filter-chip"><FolderPlus size={15} /> New folder</button>
      </section>
      <section className="sound-grid">{filtered.map((sound) => <SoundCard key={sound.id} sound={sound} />)}</section>
    </>
  );
}
