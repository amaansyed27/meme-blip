import { RefreshCw } from 'lucide-react';
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
        title="Settings"
        description="Small controls for the local companion."
      />

      <section className="settings-list">
        <article className="setting-row">
          <div><strong>Updates</strong><p>{updateCopy}</p></div>
          <div className="row-actions">
            <button className="subtle-button" onClick={checkUpdate}><RefreshCw size={15} /> Check</button>
            {hasUpdate ? <button className="primary-button" onClick={downloadUpdate}>Download</button> : null}
          </div>
        </article>
      </section>
    </>
  );
}
