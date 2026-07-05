import { Download, Power, RotateCcw, Save } from 'lucide-react';
import { PageHeader } from '../components/PageHeader.jsx';

export function Settings() {
  return (
    <>
      <PageHeader
        eyebrow="Preferences"
        title="Small controls, predictable behavior."
        description="Keep the tray app quiet, local, and easy to recover if routing gets weird."
        action={<button className="primary-button"><Save size={18} /> Save</button>}
      />
      <section className="settings-grid">
        <article className="setting-card"><Power size={20} /><div><strong>Launch on startup</strong><p>Start the companion when Windows starts.</p></div><button className="toggle on"><span /></button></article>
        <article className="setting-card"><Download size={20} /><div><strong>Export sound pack</strong><p>Bundle boards, metadata, and local paths.</p></div><button className="subtle-button">Export</button></article>
        <article className="setting-card"><RotateCcw size={20} /><div><strong>Reset local config</strong><p>Clear dashboard settings without deleting clips.</p></div><button className="danger-soft">Reset</button></article>
      </section>
    </>
  );
}
