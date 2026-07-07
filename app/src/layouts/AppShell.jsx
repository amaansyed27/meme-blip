import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CircleDot, Command, Moon, RefreshCw, Search, Sun, Volume2, VolumeX } from 'lucide-react';
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
  const [theme, setTheme] = React.useState(() => localStorage.getItem('memeblip-theme') || 'dark');

  React.useEffect(() => {
    document.body.classList.toggle('theme-light', theme === 'light');
    localStorage.setItem('memeblip-theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => current === 'dark' ? 'light' : 'dark');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => setRoute('dashboard')}>
          <span className="brand-mark">MB</span>
          <span><strong>MemeBlip</strong><small>Tray soundboard</small></span>
        </button>
        <nav className="sidebar-nav">
          {routes.map((item) => {
            const Icon = iconMap[item.icon] || CircleDot;
            const active = route === item.id;
            return (
              <button key={item.id} className={active ? 'nav-item active' : 'nav-item'} onClick={() => setRoute(item.id)}>
                {active ? <motion.span className="nav-selector" layoutId="nav-selector" transition={{ type: 'spring', stiffness: 420, damping: 34 }} /> : null}
                <Icon className="nav-icon" size={18} />
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
            <button className="icon-button" onClick={initialize} aria-label="Refresh"><RefreshCw size={18} /></button>
            <button className="icon-button" onClick={toggleTheme} aria-label="Toggle theme">{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
            <button className="icon-button" aria-label="Notifications"><Bell size={18} /></button>
            <button className="danger-soft" onClick={stopAll}>Stop all</button>
            <button className="icon-button" onClick={toggleMute} aria-label="Mute toggle">{muted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
          </div>
        </header>
        <AnimatePresence mode="wait">
          <motion.section key={route} className="page" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            {children}
          </motion.section>
        </AnimatePresence>
      </main>
    </div>
  );
}
