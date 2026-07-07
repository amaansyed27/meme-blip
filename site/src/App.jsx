import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Download, ExternalLink, Mic2, MonitorSpeaker, Play, Radio, ShieldCheck, Sparkles, Zap } from 'lucide-react';

const downloadUrl = import.meta.env.VITE_MEMEBLIP_DOWNLOAD_URL || 'https://github.com/amaansyed27/meme-blip/releases/latest/download/MemeBlip-Setup.msi';

const productRows = [
  ['Alt + 1', 'vine-boom', 'Meme Kit'],
  ['Alt + 2', 'among-us-role-reveal', 'Meme Kit'],
  ['Alt + 3', 'sher', 'Meme Kit']
];

const details = [
  { icon: Zap, label: 'Board-scoped hotkeys', copy: 'Select one board and only those clips answer your keys.' },
  { icon: Mic2, label: 'Mic passthrough', copy: 'Keep your voice in the same route as MemeBlip clips.' },
  { icon: MonitorSpeaker, label: 'Monitor output', copy: 'Hear clips locally while the call receives the virtual mic.' },
  { icon: ShieldCheck, label: 'Local companion', copy: 'Playback and routing stay on localhost, not a cloud bot.' }
];

const setup = [
  ['01', 'Install VB-CABLE', 'One virtual route: CABLE Input to CABLE Output.'],
  ['02', 'Pick devices', 'Mic, route, and monitor are selected inside MemeBlip.'],
  ['03', 'Open your app', 'Use CABLE Output as the microphone in Meet, Discord, Zoom, or Valorant.'],
  ['04', 'Trigger clips', 'Press your linked hotkeys without changing windows.']
];

export function App() {
  const { scrollYProgress } = useScroll();
  const productY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const lineX = useTransform(scrollYProgress, [0, 1], ['-12%', '24%']);

  return (
    <main className="site-shell">
      <div className="site-noise" />
      <motion.div className="route-line-bg" style={{ x: lineX }} />

      <nav className="nav" aria-label="Main navigation">
        <a className="nav-brand" href="#top" aria-label="MemeBlip home">
          <img src="/brand/memeblip-icon-1024.png" alt="" />
          <span>MemeBlip</span>
        </a>
        <div className="nav-links">
          <a href="#routing">Routing</a>
          <a href="#setup">Setup</a>
          <a href="https://github.com/amaansyed27/meme-blip" target="_blank" rel="noreferrer"><ExternalLink size={15} /> GitHub</a>
          <a className="download-link" href={downloadUrl}>Download</a>
        </div>
      </nav>

      <section id="top" className="hero-section">
        <motion.div className="hero-copy" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
          <p className="kicker"><Sparkles size={14} /> Windows tray soundboard</p>
          <h1>Soundboard clips in your mic route. No tab switching.</h1>
          <p className="hero-lede">
            MemeBlip routes short clips, optional mic passthrough, and local monitoring through a small native companion. Built for games, meetings, and calls that listen to a microphone.
          </p>
          <div className="hero-actions">
            <a className="button-primary" href={downloadUrl}><Download size={18} /> Download setup</a>
            <a className="button-secondary" href="#routing">How routing works <ArrowRight size={16} /></a>
          </div>
          <div className="meta-row" aria-label="Product facts">
            <span>Localhost companion</span>
            <span>VB-CABLE route</span>
            <span>Active-board hotkeys</span>
          </div>
        </motion.div>

        <motion.aside className="product-card" style={{ y: productY }} initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.65 }}>
          <div className="product-topbar">
            <div><span /> <span /> <span /></div>
            <small>Companion online</small>
          </div>
          <div className="product-heading">
            <img src="/brand/memeblip-icon-1024.png" alt="" />
            <div><b>Currently selected board</b><p>Meme Kit owns the hotkeys</p></div>
          </div>
          <div className="clip-stack">
            {productRows.map(([key, name, board], index) => (
              <motion.div className="clip-row" key={name} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.24 + index * 0.08 }}>
                <button aria-label={`Play ${name}`}><Play size={12} fill="currentColor" /></button>
                <div><strong>{name}</strong><small>{board}</small></div>
                <kbd>{key}</kbd>
              </motion.div>
            ))}
          </div>
          <div className="route-meter"><span /></div>
        </motion.aside>
      </section>

      <section className="detail-strip" aria-label="Feature details">
        {details.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.article key={item.label} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ delay: index * 0.04 }}>
              <Icon size={18} />
              <h2>{item.label}</h2>
              <p>{item.copy}</p>
            </motion.article>
          );
        })}
      </section>

      <section id="routing" className="routing-section">
        <div className="section-copy">
          <p className="kicker"><Radio size={14} /> Routing</p>
          <h2>Designed around one route that actually makes sense.</h2>
          <p>MemeBlip sends clips to CABLE Input. Your target app listens to CABLE Output. Your headphones stay your normal speaker output.</p>
        </div>
        <div className="routing-map">
          <div className="route-node physical"><b>Physical mic</b><small>Your headset mic</small></div>
          <div className="route-node app"><b>MemeBlip</b><small>Clips + optional voice</small></div>
          <div className="route-node cable"><b>CABLE Input</b><small>Virtual route</small></div>
          <div className="route-node target"><b>CABLE Output</b><small>App microphone</small></div>
          <div className="route-arrow a1" /><div className="route-arrow a2" /><div className="route-arrow a3" />
        </div>
      </section>

      <section id="setup" className="setup-section">
        <div className="section-copy narrow">
          <p className="kicker">Setup</p>
          <h2>Four steps. Then leave it in the tray.</h2>
        </div>
        <div className="setup-list">
          {setup.map(([number, title, copy]) => (
            <motion.article key={number} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span>{number}</span>
              <div><h3>{title}</h3><p>{copy}</p></div>
            </motion.article>
          ))}
        </div>
      </section>

      <footer className="site-footer">
        <div>
          <img src="/brand/memeblip-icon-1024.png" alt="" />
          <span>MemeBlip</span>
          <small>Local tray soundboard for Windows.</small>
        </div>
        <a className="footer-download" href={downloadUrl}><Download size={16} /> Download setup</a>
      </footer>
    </main>
  );
}
