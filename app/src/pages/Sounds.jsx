import { useState } from 'react';
import { Radio, Upload } from 'lucide-react';
import { PageHeader } from '../components/PageHeader.jsx';
import { SoundCard } from '../components/SoundCard.jsx';
import { useMemeBlipStore } from '../state/useMemeBlipStore.js';

export function Sounds() {
  const sounds = useMemeBlipStore((state) => state.sounds);
  const boards = useMemeBlipStore((state) => state.boards);
  const activeBoard = useMemeBlipStore((state) => state.activeBoard);
  const setActiveBoard = useMemeBlipStore((state) => state.setActiveBoard);
  const importSound = useMemeBlipStore((state) => state.importSound);
  const setRoute = useMemeBlipStore((state) => state.setRoute);
  const query = useMemeBlipStore((state) => state.query).toLowerCase();
  const [isImporting, setIsImporting] = useState(false);

  const filtered = sounds.filter((sound) => {
    const matchesBoard = !activeBoard || sound.board === activeBoard;
    const matchesQuery = sound.name.toLowerCase().includes(query) || sound.board.toLowerCase().includes(query);
    return matchesBoard && matchesQuery;
  });

  const handleImport = async (event) => {
    const input = event.currentTarget;
    const files = Array.from(input.files || []);
    input.value = '';

    if (!files.length || isImporting) return;

    setIsImporting(true);
    try {
      for (const file of files) {
        await importSound(file);
      }
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Library"
        title="Your clip library."
        description={activeBoard ? `Showing ${activeBoard}. Imported clips are added to this board.` : 'Import clips, rename them, assign boards, and tune playback.'}
        action={(
          <div className="sound-page-actions">
            <button className="subtle-button" onClick={() => setRoute('supplier')}><Radio size={17} /> Get more</button>
            <label className="primary-button file-button" aria-disabled={isImporting}>
              <Upload size={18} /> {isImporting ? 'Importing...' : 'Import clips'}
              <input
                type="file"
                accept="audio/*,.mp3,.wav,.ogg,.flac,.m4a,.aac"
                multiple
                disabled={isImporting}
                onChange={handleImport}
              />
            </label>
          </div>
        )}
      />

      <section className="toolbar-panel board-filter-bar">
        <button className={!activeBoard ? 'filter-chip active' : 'filter-chip'} onClick={() => setActiveBoard(null)}>All clips</button>
        {boards.map((board) => <button key={board.id} className={activeBoard === board.name ? 'filter-chip active' : 'filter-chip'} onClick={() => setActiveBoard(board.name)}>{board.name}</button>)}
      </section>

      {filtered.length ? <section className="sound-grid">{filtered.map((sound) => <SoundCard key={sound.id} sound={sound} editable />)}</section> : <section className="empty-state">No clips here yet. Import audio to add it to this board.</section>}
    </>
  );
}
