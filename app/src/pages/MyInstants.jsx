import React from 'react';
import { Download, ExternalLink, Plus, Radio, Search } from 'lucide-react';
import { PageHeader } from '../components/PageHeader.jsx';
import { myInstantsClient } from '../services/myInstantsClient.js';
import { useMemeBlipStore } from '../state/useMemeBlipStore.js';

const filters = [
  { id: 'trending', label: 'Trending' },
  { id: 'recent', label: 'Recent' },
  { id: 'best', label: 'Best' }
];

export function MyInstants() {
  const importRemoteSound = useMemeBlipStore((state) => state.importRemoteSound);
  const setRoute = useMemeBlipStore((state) => state.setRoute);
  const activeBoard = useMemeBlipStore((state) => state.activeBoard);
  const [mode, setMode] = React.useState('trending');
  const [query, setQuery] = React.useState('vine boom');
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [addingId, setAddingId] = React.useState(null);

  const loadSounds = React.useCallback(async (nextMode = mode, nextQuery = query) => {
    setLoading(true);
    setMessage('');
    try {
      let results;
      if (nextMode === 'search') {
        results = await myInstantsClient.search(nextQuery || 'meme');
      } else if (nextMode === 'recent') {
        results = await myInstantsClient.recent();
      } else if (nextMode === 'best') {
        results = await myInstantsClient.best('us');
      } else {
        results = await myInstantsClient.trending('us');
      }
      setItems(results.filter((item) => item?.title && item?.mp3));
    } catch (error) {
      setItems([]);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }, [mode, query]);

  React.useEffect(() => {
    loadSounds('trending', query);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function runSearch(event) {
    event.preventDefault();
    setMode('search');
    await loadSounds('search', query);
  }

  async function switchMode(nextMode) {
    setMode(nextMode);
    await loadSounds(nextMode, query);
  }

  async function addSound(item) {
    setAddingId(item.id || item.mp3);
    setMessage('');
    try {
      await importRemoteSound(item);
      setMessage(`Added “${item.title}” to ${activeBoard || 'Meme Kit'}.`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setAddingId(null);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Supplier"
        title="Get more sounds."
        description="Browse MyInstants, preview sounds, then import them into your active MemeBlip board."
        action={<button className="subtle-button" onClick={() => setRoute('sounds')}>Back to library</button>}
      />

      <section className="supplier-panel">
        <form className="supplier-search" onSubmit={runSearch}>
          <label>
            <Search size={16} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search memes, sounds, effects" />
          </label>
          <button className="primary-button" type="submit"><Search size={15} /> Search</button>
        </form>

        <div className="supplier-filters">
          {filters.map((filter) => (
            <button key={filter.id} className={mode === filter.id ? 'filter-chip active' : 'filter-chip'} onClick={() => switchMode(filter.id)}>
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      {message ? <section className="supplier-message">{message}</section> : null}
      {loading ? <section className="empty-state">Loading MyInstants sounds…</section> : null}

      {!loading && items.length ? (
        <section className="supplier-grid">
          {items.map((item) => (
            <article className="supplier-card" key={item.id || item.mp3}>
              <div className="supplier-card-main">
                <div className="supplier-icon"><Radio size={16} /></div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.id || 'MyInstants sound'}</p>
                </div>
              </div>
              <audio controls preload="none" src={item.mp3} />
              <div className="supplier-card-actions">
                {item.url ? <a className="subtle-button" href={item.url} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Source</a> : null}
                <button className="primary-button" onClick={() => addSound(item)} disabled={addingId === (item.id || item.mp3)}>
                  {addingId === (item.id || item.mp3) ? <Download size={14} /> : <Plus size={14} />}
                  {addingId === (item.id || item.mp3) ? 'Adding…' : 'Add to MemeBlip'}
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {!loading && !items.length && !message ? <section className="empty-state">No sounds found. Try another search.</section> : null}
    </>
  );
}
