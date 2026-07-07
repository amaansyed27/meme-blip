import { Cable, CheckCircle2, Headphones, Mic2, RefreshCw, Radio, Zap } from 'lucide-react';
import { PageHeader } from '../components/PageHeader.jsx';
import { useMemeBlipStore } from '../state/useMemeBlipStore.js';

function nameFor(items, id, fallback) {
  if (!id) return fallback;
  return items.find((item) => item.id === id)?.name || fallback;
}

export function Settings() {
  const updateStatus = useMemeBlipStore((state) => state.updateStatus);
  const checkUpdate = useMemeBlipStore((state) => state.checkUpdate);
  const downloadUpdate = useMemeBlipStore((state) => state.downloadUpdate);
  const companionOnline = useMemeBlipStore((state) => state.companionOnline);
  const boards = useMemeBlipStore((state) => state.boards);
  const activeBoard = useMemeBlipStore((state) => state.activeBoard);
  const setActiveBoard = useMemeBlipStore((state) => state.setActiveBoard);
  const devices = useMemeBlipStore((state) => state.devices);
  const inputDevices = useMemeBlipStore((state) => state.inputDevices);
  const selectedDeviceId = useMemeBlipStore((state) => state.selectedDeviceId);
  const monitorDeviceId = useMemeBlipStore((state) => state.monitorDeviceId);
  const inputDeviceId = useMemeBlipStore((state) => state.inputDeviceId);
  const micPassthroughEnabled = useMemeBlipStore((state) => state.micPassthroughEnabled);
  const setMicPassthroughEnabled = useMemeBlipStore((state) => state.setMicPassthroughEnabled);
  const hasUpdate = updateStatus && updateStatus.updateAvailable;
  const updateCopy = updateStatus ? `Current ${updateStatus.currentVersion}. Latest ${updateStatus.latestVersion || 'unknown'}.` : 'Check for a newer release.';

  return (
    <>
      <PageHeader
        eyebrow="Preferences"
        title="Settings"
        description="Real companion settings and current routing state."
      />

      <section className="settings-list">
        <article className="setting-row">
          <div className="setting-copy"><Zap size={16} /><div><strong>Active soundboard</strong><p>{activeBoard || 'All boards respond to hotkeys.'}</p></div></div>
          <select className="setting-select" value={activeBoard || ''} onChange={(event) => setActiveBoard(event.target.value || null)}>
            <option value="">All boards</option>
            {boards.map((board) => <option key={board.id} value={board.name}>{board.name}</option>)}
          </select>
        </article>

        <article className="setting-row">
          <div className="setting-copy"><Mic2 size={16} /><div><strong>Mic passthrough</strong><p>{micPassthroughEnabled ? 'Your voice is mixed into CABLE Input.' : 'Only clips are sent to the virtual route.'}</p></div></div>
          <button className={micPassthroughEnabled ? 'setting-toggle on' : 'setting-toggle'} onClick={() => setMicPassthroughEnabled(!micPassthroughEnabled)}>{micPassthroughEnabled ? 'On' : 'Off'}</button>
        </article>

        <article className="setting-row read-only-row">
          <div className="setting-copy"><Mic2 size={16} /><div><strong>Real microphone</strong><p>{nameFor(inputDevices, inputDeviceId, 'Not selected')}</p></div></div>
          <span className="setting-status">Audio Routing</span>
        </article>

        <article className="setting-row read-only-row">
          <div className="setting-copy"><Cable size={16} /><div><strong>Virtual route</strong><p>{nameFor(devices, selectedDeviceId, 'Not selected')}</p></div></div>
          <span className="setting-status">CABLE Input</span>
        </article>

        <article className="setting-row read-only-row">
          <div className="setting-copy"><Headphones size={16} /><div><strong>Monitor output</strong><p>{nameFor(devices, monitorDeviceId, 'No monitor')}</p></div></div>
          <span className="setting-status">Local preview</span>
        </article>

        <article className="setting-row read-only-row">
          <div className="setting-copy"><Radio size={16} /><div><strong>Companion</strong><p>{companionOnline ? 'Local playback API is online.' : 'Start the native companion to enable playback.'}</p></div></div>
          <span className={companionOnline ? 'setting-status online' : 'setting-status'}><CheckCircle2 size={13} /> {companionOnline ? 'Online' : 'Offline'}</span>
        </article>

        <article className="setting-row">
          <div className="setting-copy"><RefreshCw size={16} /><div><strong>Updates</strong><p>{updateCopy}</p></div></div>
          <div className="row-actions">
            <button className="subtle-button" onClick={checkUpdate}><RefreshCw size={15} /> Check</button>
            {hasUpdate ? <button className="primary-button" onClick={downloadUpdate}>Download</button> : null}
          </div>
        </article>
      </section>
    </>
  );
}
