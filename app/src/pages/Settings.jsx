import { Download, Power, RefreshCw, RotateCcw, Save } from 'lucide-react';
import { PageHeader } from '../components/PageHeader.jsx';
import { useMemeBlipStore } from '../state/useMemeBlipStore.js';

export function Settings() {
  const updateStatus = useMemeBlipStore((state) => state.updateStatus);
  const checkUpdate = useMemeBlipStore((state) => state.checkUpdate);
  const downloadUpdate = useMemeBlipStore((state) => state.downloadUpdate);
  const hasUpdate = updateStatus && updateStatus.updateAvailable;
  const updateCopy = updateStatus ? `Current ${updateStatus.currentVersion}. Latest ${updateStatus.latestVersion || 'unknown'}.` : 'Check for a newer release.';

  return (
    <>
      <PageHeader
        eyebrow="Preferences"
        title="Small controls, predictable behavior."
        description="Keep the tray app quiet, local, and recoverable."
        action={<button className="primary-button"><Save size={18} /> Save</button>}
      />
      <section className="settings-grid">
        <article className="setting-card"><Power size={20} /><div><strong>Launch on startup</strong><p>Start MemeBlip with your computer.</p></div><button className="toggle on"><span /></button></article>
        <article className="setting-card"><RefreshCw size={20} /><div><strong>Updates</strong><p>{updateCopy}</p></div><button className="subtle-button" onClick={checkUpdate}>Check</button>{hasUpdate ? <button className="primary-button" onClick={downloadUpdate}>Download</button> : null}</article>
        <article className="setting-card"><Download size={20} /><div><strong>Export sound pack</strong><p>Bundle boards, metadata, and local paths.</p></div><button className="subtle-button">Export</button></article>
        <article className="setting-card"><RotateCcw size={20} /><div><strong>Reset local config</strong><p>Clear dashboard settings without deleting clips.</p></div><button className="danger-soft">Reset</button></article>
      </section>
    </>
  );
}
