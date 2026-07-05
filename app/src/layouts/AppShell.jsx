import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CircleDot, Command, Moon, RefreshCw, Search, Volume2, VolumeX } from 'lucide-react';
import { routes } from '../data/seedData.js';
import { iconMap } from '../lib/iconMap.js';
import { useMemeBlipStore } from '../state/useMemeBlipStore.js';

export function AppShell({ children }) {
  const route = useMemeBlipStore((state) => state.route);
  const setRoute = useMemeBlipStore((state) => state.setRoute);
  const query = useMemeBlipStore((state) => state.query);
  const setQuery = useMemeBlipStore((state) => state.setQuery);
  const muted = useMemeBlipStore((state) => state.muted);
  const toggleMute = useMemeBlipStore((state) => state.toggleMute);
  const stopAll = useMemeBlipStore((state) => state.stopAll);
  const initialize = useMemeBlipStore((state) => state.initialize);
  const companionOnline = useMemeBlipStore((state) => state.companionOnline);
  const error = useMemeBlipStore((state) => state.error);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => setRoute('dashboard')}>
          <span className="brand-mark">MB</span>
          <span><strong>MemeBlip</strong><small>Tray soundboard</small></span>
        </button>
        <nav>
          {routes.map((item) => {
            const Icon = iconMap[item.icon] || CircleDot;
            return (
              <button key={item.id} className={route === item.id ? 'nav-item active' : 'nav-item'} onClick={() => setRoute(item.id)}>
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className={companionOnline ? 'sidebar-card' : 'sidebar-card offline'}>
          <p>Companion</p>
          <strong><CircleDot size={13} /> {companionOnline ? 'Online' : 'Offline'}</strong>
          <span>{companionOnline ? 'Hotkeys and audio API are active.' : 'Start the native companion to enable playback.'}</span>
          {error ? <small>{error}</small> : null}
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <label className="search-box">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search sounds, boards, hotkeys" />
            <kbd><Command size={12} /> K</kbd>
          </label>
          <div className="top-actions">
            <button className="icon-button" onClick={initialize}><RefreshCw size={18} /></button>
            <button className="icon-button"><Moon size={18} /></button>
            <button className="icon-button"><Bell size={18} /></button>
            <button className="danger-soft" onClick={stopAll}>Stop all</button>
            <button className="icon-button" onClick={toggleMute}>{muted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
          </div>
        </header>
        <AnimatePresence mode="wait">
          <motion.section key={route} className="page" initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -8, filter: 'blur(6px)' }} transition={{ duration: 0.22 }}>
            {children}
          </motion.section>
        </AnimatePresence>
      </main>
    </div>
  );
}
