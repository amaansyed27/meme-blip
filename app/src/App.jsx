import React from 'react';
import { AlertTriangle, CheckCircle2, ExternalLink, RefreshCw } from 'lucide-react';
import { AppShell } from './layouts/AppShell.jsx';
import { AudioRouting } from './pages/AudioRouting.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Hotkeys } from './pages/Hotkeys.jsx';
import { Settings } from './pages/Settings.jsx';
import { Soundboards } from './pages/Soundboards.jsx';
import { Sounds } from './pages/Sounds.jsx';
import { useMemeBlipStore } from './state/useMemeBlipStore.js';
import { getVbCableStatus, VB_CABLE_DOWNLOAD_URL } from './utils/vbCable.js';

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
  const initialize = useMemeBlipStore((state) => state.initialize);
  const loading = useMemeBlipStore((state) => state.loading);
  const devices = useMemeBlipStore((state) => state.devices);
  const inputDevices = useMemeBlipStore((state) => state.inputDevices);
  const refreshDevices = useMemeBlipStore((state) => state.refreshDevices);
  const setRoute = useMemeBlipStore((state) => state.setRoute);
  const Page = pages[route] || Dashboard;
  const [cableGateDismissed, setCableGateDismissed] = React.useState(false);
  const [checkingCable, setCheckingCable] = React.useState(false);
  const cableStatus = getVbCableStatus(devices, inputDevices);
  const shouldShowCableGate = !loading && !cableStatus.ready && !cableGateDismissed;

  React.useEffect(() => {
    initialize();
  }, [initialize]);

  React.useEffect(() => {
    if (!cableStatus.ready) return;
    setCableGateDismissed(false);
  }, [cableStatus.ready]);

  async function checkCableAgain() {
    setCheckingCable(true);
    try {
      await refreshDevices();
    } finally {
      setCheckingCable(false);
    }
  }

  function continueLimitedMode() {
    setCableGateDismissed(true);
    setRoute('routing');
  }

  return (
    <AppShell>
      <Page />
      {shouldShowCableGate && (
        <VbCableSetupGate
          cableStatus={cableStatus}
          checkingCable={checkingCable}
          onCheckAgain={checkCableAgain}
          onContinue={continueLimitedMode}
        />
      )}
    </AppShell>
  );
}

function VbCableSetupGate({ cableStatus, checkingCable, onCheckAgain, onContinue }) {
  return (
    <div className="setup-gate-backdrop" role="dialog" aria-modal="true" aria-labelledby="vbcable-setup-title">
      <section className="setup-gate-card">
        <div className="setup-gate-icon"><AlertTriangle size={22} /></div>
        <div>
          <p className="eyebrow">Audio setup required</p>
          <h1 id="vbcable-setup-title">Set up VB-CABLE before routing clips.</h1>
          <p className="setup-gate-copy">
            MemeBlip installed correctly. To send clips into Google Meet, Valorant, Zoom, or any mic-based app, Windows must expose the standard VB-CABLE devices.
          </p>
        </div>

        <div className="setup-checklist">
          <StatusRow ok={cableStatus.hasCableInput} label="CABLE Input found" detail="MemeBlip sends clips here." />
          <StatusRow ok={cableStatus.hasCableOutput} label="CABLE Output found" detail="Your game or meeting app uses this as the microphone." />
        </div>

        <div className="setup-gate-actions">
          <a className="primary-button" href={VB_CABLE_DOWNLOAD_URL} target="_blank" rel="noreferrer">
            <ExternalLink size={15} /> Open VB-CABLE download
          </a>
          <button className="subtle-button" onClick={onCheckAgain} disabled={checkingCable}>
            <RefreshCw size={15} /> {checkingCable ? 'Checking...' : 'Check again'}
          </button>
          <button className="subtle-button" onClick={onContinue}>Continue in limited mode</button>
        </div>

        <p className="setup-gate-note">
          VB-CABLE is a separate virtual audio driver. MemeBlip does not install it silently because Windows may require admin approval and a reboot. Limited mode only hides this screen for the current app session.
        </p>
      </section>
    </div>
  );
}

function StatusRow({ ok, label, detail }) {
  return (
    <div className={ok ? 'setup-status-row ok' : 'setup-status-row missing'}>
      {ok ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
      <div>
        <strong>{label}</strong>
        <small>{detail}</small>
      </div>
    </div>
  );
}
