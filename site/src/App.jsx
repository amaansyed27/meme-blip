import { motion, useScroll, useTransform } from 'framer-motion';
import { Download, Gamepad2, Mic2, MonitorSpeaker, Radio, ShieldCheck, Sparkles, Zap } from 'lucide-react';

const downloadUrl = import.meta.env.VITE_MEMEBLIP_DOWNLOAD_URL || 'https://github.com/amaansyed27/meme-blip/releases/latest/download/MemeBlip-Setup.msi';

const features = [
  { icon: Zap, title: 'Hotkeys that stay out of the way', copy: 'Pick a board, bind keys, and trigger clips without leaving the match or meeting.' },
  { icon: Mic2, title: 'Mic passthrough', copy: 'Mix your real microphone and MemeBlip clips into the same virtual mic route.' },
  { icon: MonitorSpeaker, title: 'Local monitor preview', copy: 'Send clips to the call while still hearing them through your own headphones.' },
  { icon: ShieldCheck, title: 'Local-first companion', copy: 'Playback, routing, and hotkeys run through a localhost native companion.' }
];

const routing = ['Import clips', 'Choose board', 'Route to CABLE Input', 'Use CABLE Output in app'];

export function App() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const orbY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const glowScale = useTransform(scrollYProgress, [0, 0.6], [1, 1.28]);

  return (
    <main className="landing-shell">
      <motion.div className="ambient-orb orb-a" style={{ y: orbY, scale: glowScale }} />
      <motion.div className="ambient-orb orb-b" style={{ y: heroY }} />
      <div className="grain" />

      <nav className="nav">
        <a className="brand" href="#top" aria-label="MemeBlip home">
          <img src="/brand/memeblip-icon-1024.png" alt="" />
          <span>MemeBlip</span>
        </a>
        <div className="nav-actions">
          <a href="#how">How it works</a>
          <a href="https://github.com/amaansyed27/meme-blip" target="_blank" rel="noreferrer">GitHub</a>
          <a className="nav-download" href={downloadUrl}>Download</a>
        </div>
      </nav>

      <section id="top" className="hero">
        <motion.div className="hero-copy" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
          <div className="eyebrow"><Sparkles size={14} /> Local tray soundboard</div>
          <h1>Trigger sounds without leaving the match or meeting.</h1>
          <p>
            MemeBlip is a Windows tray soundboard that routes clips and optional mic passthrough into Discord, Meet, Zoom, Valorant, and other mic-based apps through VB-CABLE.
          </p>
          <div className="hero-actions">
            <a className="primary" href={downloadUrl}><Download size={18} /> Download Windows setup</a>
            <a className="secondary" href="#how">See routing flow</a>
          </div>
          <div className="trust-row">
            <span>Localhost companion</span>
            <span>VB-CABLE routing</span>
            <span>Active-board hotkeys</span>
          </div>
        </motion.div>

        <motion.div className="hero-device" initial={{ opacity: 0, y: 28, rotateX: 8 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ delay: 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <div className="window-bar"><span /><span /><span /></div>
          <div className="mock-layout">
            <aside>
              <img src="/brand/memeblip-icon-1024.png" alt="" />
              <b>MemeBlip</b>
              <small>Selected board</small>
              <div className="mock-nav active"><Radio size={13} /> Dashboard</div>
              <div className="mock-nav"><Gamepad2 size={13} /> Boards</div>
              <div className="mock-nav"><Zap size={13} /> Hotkeys</div>
            </aside>
            <section>
              <div className="mock-search" />
              <div className="mock-title">Currently selected board</div>
              <motion.div className="board-preview" whileHover={{ height: 176 }} transition={{ type: 'spring', stiffness: 260, damping: 24 }}>
                <div className="board-head"><b>Meme Kit</b><span>Hotkeys linked</span></div>
                {['vine-boom', 'among-us-role-reveal', 'anime-ahh', 'sher'].map((item, index) => <div className="clip-line" key={item}><span>{item}</span><small>Alt + {index + 1}</small></div>)}
              </motion.div>
            </section>
          </div>
        </motion.div>
      </section>

      <section className="feature-strip">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.article key={feature.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ delay: index * 0.06, duration: 0.45 }}>
              <Icon size={18} />
              <h2>{feature.title}</h2>
              <p>{feature.copy}</p>
            </motion.article>
          );
        })}
      </section>

      <section id="how" className="flow-section">
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <p className="eyebrow">How it routes</p>
          <h2>Simple setup. Predictable audio.</h2>
          <p className="flow-copy">MemeBlip sends clips to CABLE Input. Your target app listens to CABLE Output. Your headphones stay your normal speaker output.</p>
        </motion.div>
        <div className="flow-grid">
          {routing.map((step, index) => (
            <motion.div className="flow-card" key={step} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08, duration: 0.45 }}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <b>{step}</b>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="download-band">
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2>Ready to launch sounds from the tray?</h2>
          <p>Download the latest Windows setup from GitHub Releases.</p>
        </motion.div>
        <a className="primary" href={downloadUrl}><Download size={18} /> Download MemeBlip setup</a>
      </section>
    </main>
  );
}
