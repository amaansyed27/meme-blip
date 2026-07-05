import { AppShell } from './layouts/AppShell.jsx';
import { AudioRouting } from './pages/AudioRouting.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Hotkeys } from './pages/Hotkeys.jsx';
import { Settings } from './pages/Settings.jsx';
import { Soundboards } from './pages/Soundboards.jsx';
import { Sounds } from './pages/Sounds.jsx';
import { useMemeBlipStore } from './state/useMemeBlipStore.js';

const pages = {
  dashboard: Dashboard,
  sounds: Sounds,
  boards: Soundboards,
  hotkeys: Hotkeys,
  routing: AudioRouting,
  settings: Settings
};

export default function App() {
  const route = useMemeBlipStore((state) => state.route);
  const Page = pages[route] || Dashboard;

  return (
    <AppShell>
      <Page />
    </AppShell>
  );
}
