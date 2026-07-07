import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Download, ExternalLink, Mic2, MonitorSpeaker, Play, Radio, ShieldCheck, Sparkles, Zap } from 'lucide-react';

const downloadUrl = import.meta.env.VITE_MEMEBLIP_DOWNLOAD_URL || 'https://github.com/amaansyed27/meme-blip/releases/latest/download/MemeBlip-Setup.msi';

const clips = [
  ['Alt + 1', 'vine-boom', '00:02'],
  ['Alt + 2', 'role-reveal', '00:04'],
  ['Alt + 3', 'sher', '00:03'],
  ['Alt + 4', 'anime-ahh', '00:01']
];

const pillars = [
  { icon: Zap, title: 'One active board', copy: 'Your current board owns the keys, so hotkeys stay predictable in-game and in calls.' },
  { icon: Mic2, title: 'Voice stays in route', copy: 'Optional mic passthrough keeps your real microphone and clips in the same virtual mic path.' },
  { icon: MonitorSpeaker, title: 'Hear what you send', copy: 'Monitor clips through your own output while the call receives CABLE Output.' }
];

const routeSteps = ['Physical mic', 'MemeBlip mixer', 'CABLE Input', 'CABLE Output', 'Discord / Meet / Game'];

const setup = [
  ['01', 'Install the setup', 'Use the Windows installer from GitHub Releases.'],
  ['02', 'Select CABLE Input', 'MemeBlip sends clips into the virtual route.'],
  ['03', 'Set app mic to CABLE Output', 'Your game or call receives the mixed signal.'],
  ['04', 'Trigger with hotkeys', 'Leave MemeBlip in the tray and play clips without tab switching.']
];

export function App() {
  const { scrollYProgress } = useScroll();
  const heroDrift = useTransform(scrollYProgress, [0, 0.7], [0, -72]);

  return (
    <main className="site-shell">
      <div className="page-grain" />

      <nav className="nav" aria-label="Main navigation">
        <a className="nav-brand" href="#top" aria-label="MemeBlip home">
          <img src="/brand/memeblip-icon-1024.png" alt="" />
          <span>MemeBlip</span>
        </a>
        <div className="nav-links">
          <a href="#routing">Routing</a>
          <a href="#install">Install</a>
          <a href="https://github.com/amaansyed27/meme-blip" target="_blank" rel="noreferrer"><ExternalLink size={15} /> GitHub</a>
          <a className="nav-cta" href={downloadUrl}>Download</a>
        </div>
      </nav>

      <section id="top" className="hero-section">
        <motion.div className="hero-copy" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}>
          <p className="kicker"><Sparkles size={14} /> Windows tray soundboard</p>
          <h1>Put memes directly into your mic.</h1>
          <p className="hero-lede">
            MemeBlip mixes short clips and optional mic passthrough into a virtual microphone route, so your game or call hears the sound without you leaving the window.
          </p>
          <div className="hero-actions">
            <a className="button-primary" href={downloadUrl}><Download size={18} /> Download Windows setup</a>
            <a className="button-secondary" href="#routing">View audio route <ArrowRight size={16} /></a>
          </div>
          <div className="hero-proof">
            <span>Local companion</span>
            <span>VB-CABLE route</span>
            <span>Board hotkeys</span>
          </div>
        </motion.div>

        <motion.aside className="hero-stage" style={{ y: heroDrift }} initial={{ opacity: 0, y: 26, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }} aria-label="MemeBlip product preview">
          <div className="stage-orbit orbit-one" />
          <div className="stage-orbit orbit-two" />
          <div className="stage-core">
            <img src="/brand/memeblip-icon-1024.png" alt="" />
            <strong>Live route</strong>
            <small>Board: Meme Kit</small>
          </div>
          <div className="wave-card">
            <div className="wave-header"><Radio size={15} /> Signal preview</div>
            <div className="wave-bars" aria-hidden="true">
              {Array.from({ length: 28 }).map((_, index) => <span key={index} style={{ '--i': index }} />)}
            </div>
          </div>
          <div className="clip-panel">
            <div className="clip-panel-head"><b>Armed hotkeys</b><span>4 clips</span></div>
            {clips.map(([key, name, length], index) => (
              <motion.div className="clip-item" key={name} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.26 + index * 0.06 }}>
                <button aria-label={`Preview ${name}`}><Play size={11} fill="currentColor" /></button>
                <div><strong>{name}</strong><small>{length}</small></div>
                <kbd>{key}</kbd>
              </motion.div>
            ))}
          </div>
        </motion.aside>
      </section>

      <section className="marquee-row" aria-label="Supported use cases">
        <span>Discord</span><span>Google Meet</span><span>Zoom</span><span>Valorant</span><span>OBS monitor</span><span>Any mic-based app</span>
      </section>

      <section className="pillar-section">
        {pillars.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.article key={item.title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ delay: index * 0.05 }}>
              <Icon size={20} />
              <h2>{item.title}</h2>
              <p>{item.copy}</p>
            </motion.article>
          );
        })}
      </section>

      <section id="routing" className="routing-section">
        <div className="section-copy">
          <p className="kicker"><Radio size={14} /> Routing</p>
          <h2>No fake system audio magic. Just a clean mic route.</h2>
          <p>MemeBlip is built around the stable path: clips and optional voice go to CABLE Input, then your target app uses CABLE Output as the microphone.</p>
        </div>
        <div className="route-timeline">
          {routeSteps.map((step, index) => (
            <motion.div className="route-step" key={step} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <b>{step}</b>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="install" className="install-section">
        <div className="install-card">
          <div>
            <p className="kicker"><ShieldCheck size={14} /> Release build</p>
            <h2>Install once. Keep it in the tray.</h2>
            <p>The setup installs the Windows companion and dashboard assets. For virtual mic routing, install VB-CABLE and select CABLE Output in the target app.</p>
          </div>
          <a className="button-primary" href={downloadUrl}><Download size={18} /> Download MemeBlip setup</a>
        </div>
        <div className="setup-list">
          {setup.map(([number, title, copy]) => (
            <motion.article key={number} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span>{number}</span>
              <div><h3>{title}</h3><p>{copy}</p></div>
            </motion.article>
          ))}
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-brand">
          <img src="/brand/memeblip-icon-1024.png" alt="" />
          <div><span>MemeBlip</span><small>Local tray soundboard for Windows.</small></div>
        </div>
        <div className="footer-links">
          <a href="#routing">Routing</a>
          <a href="#install">Install</a>
          <a href={downloadUrl}>Download</a>
        </div>
      </footer>
    </main>
  );
}
