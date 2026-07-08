import React from 'react';
import { AlertTriangle, CheckCircle2, Download, ExternalLink, RefreshCw } from 'lucide-react';
import { AppShell } from './layouts/AppShell.jsx';
import { AudioRouting } from './pages/AudioRouting.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Hotkeys } from './pages/Hotkeys.jsx';
import { MyInstants } from './pages/MyInstants.jsx';
import { Settings } from './pages/Settings.jsx';
import { Soundboards } from './pages/Soundboards.jsx';
import { Sounds } from './pages/Sounds.jsx';
import { companionClient } from './services/companionClient.js';
import { useMemeBlipStore } from './state/useMemeBlipStore.js';
import { getVbCableStatus, VB_CABLE_DOWNLOAD_URL } from './utils/vbCable.js';

const pages = {
  dashboard: Dashboard,
  sounds: Sounds,
  boards: Soundboards,
  hotkeys: Hotkeys,
  routing: AudioRouting,
  settings: Settings,
  supplier: MyInstants
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
  const [openingCableSetup, setOpeningCableSetup] = React.useState(false);
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

  async function openCableSetup() {
    setOpeningCableSetup(true);
    try {
      await companionClient.openVbCableSetup();
    } catch {
      window.open(VB_CABLE_DOWNLOAD_URL, '_blank', 'noopener,noreferrer');
    } finally {
      setOpeningCableSetup(false);
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
          openingCableSetup={openingCableSetup}
          onOpenSetup={openCableSetup}
          onCheckAgain={checkCableAgain}
          onContinue={continueLimitedMode}
        />
      )}
    </AppShell>
  );
}

function VbCableSetupGate({ cableStatus, checkingCable, openingCableSetup, onOpenSetup, onCheckAgain, onContinue }) {
  return (
    <div className="setup-gate-backdrop" role="dialog" aria-modal="true" aria-labelledby="vbcable-setup-title">
      <section className="setup-gate-card">
        <div className="setup-gate-icon"><AlertTriangle size={22} /></div>
        <div>
          <p className="eyebrow">Driver setup required</p>
          <h1 id="vbcable-setup-title">Install VB-CABLE to enable mic routing.</h1>
          <p className="setup-gate-copy">
            MemeBlip is installed. To send sounds into Google Meet, Valorant, Zoom, or any app microphone, install the separate VB-CABLE virtual audio driver.
          </p>
        </div>

        <div className="setup-driver-steps">
          <div><span>1</span><strong>Click “Download / install VB-CABLE”.</strong></div>
          <div><span>2</span><strong>Extract the ZIP, run VBCABLE_Setup_x64.exe as Administrator, then click Install Driver.</strong></div>
          <div><span>3</span><strong>Reboot if Windows asks, reopen MemeBlip, then click Check again.</strong></div>
        </div>

        <div className="setup-checklist">
          <StatusRow ok={cableStatus.hasCableInput} label="CABLE Input found" detail="MemeBlip sends clips here." />
          <StatusRow ok={cableStatus.hasCableOutput} label="CABLE Output found" detail="Your game or meeting app uses this as the microphone." />
        </div>

        <div className="setup-gate-actions">
          <button className="primary-button" onClick={onOpenSetup} disabled={openingCableSetup}>
            <Download size={15} /> {openingCableSetup ? 'Opening...' : 'Download / install VB-CABLE'}
          </button>
          <button className="subtle-button" onClick={onCheckAgain} disabled={checkingCable}>
            <RefreshCw size={15} /> {checkingCable ? 'Checking...' : 'Check again'}
          </button>
          <a className="subtle-button" href={VB_CABLE_DOWNLOAD_URL} target="_blank" rel="noreferrer">
            <ExternalLink size={15} /> Manual link
          </a>
          <button className="subtle-button" onClick={onContinue}>Continue without routing</button>
        </div>

        <p className="setup-gate-note">
          MemeBlip cannot silently install VB-CABLE because it is a Windows audio driver and may require admin approval and a reboot.
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
