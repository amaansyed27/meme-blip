import { Cable, CheckCircle2, Headphones, Mic2, MonitorSpeaker, Settings2 } from 'lucide-react';
import { DeviceCard } from '../components/DeviceCard.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { useMemeBlipStore } from '../state/useMemeBlipStore.js';

export function AudioRouting() {
  const devices = useMemeBlipStore((state) => state.devices);
  const inputDevices = useMemeBlipStore((state) => state.inputDevices);
  const selectedDeviceId = useMemeBlipStore((state) => state.selectedDeviceId);
  const monitorDeviceId = useMemeBlipStore((state) => state.monitorDeviceId);
  const inputDeviceId = useMemeBlipStore((state) => state.inputDeviceId);
  const micPassthroughEnabled = useMemeBlipStore((state) => state.micPassthroughEnabled);
  const setSelectedDevice = useMemeBlipStore((state) => state.setSelectedDevice);
  const setMonitorDevice = useMemeBlipStore((state) => state.setMonitorDevice);
  const setInputDevice = useMemeBlipStore((state) => state.setInputDevice);
  const setMicPassthroughEnabled = useMemeBlipStore((state) => state.setMicPassthroughEnabled);
  const clearMonitorDevice = useMemeBlipStore((state) => state.clearMonitorDevice);
  const openSystemAudioApps = useMemeBlipStore((state) => state.openSystemAudioApps);
  const openSystemAudioAll = useMemeBlipStore((state) => state.openSystemAudioAll);

  return (
    <>
      <PageHeader
        eyebrow="Audio"
        title="Routing"
        description="Mic, memes, and optional system audio into one call input."
      />

      <section className="routing-status-strip">
        <div><Mic2 size={15} /><span>Mic → CABLE Input</span></div>
        <div><Cable size={15} /><span>Call mic: CABLE Output</span></div>
        <div><Headphones size={15} /><span>Speaker stays HyperX</span></div>
      </section>

      <section className="routing-compact-grid">
        <div className="panel compact-panel">
          <PanelTitle icon={<Mic2 size={18} />} title="Mic" hint="Your real microphone" />
          <button className={micPassthroughEnabled ? 'toggle-row selected' : 'toggle-row'} onClick={() => setMicPassthroughEnabled(!micPassthroughEnabled)}>
            <span>{micPassthroughEnabled ? 'Passthrough on' : 'Passthrough off'}</span>
            <small>{micPassthroughEnabled ? 'Voice included' : 'Memes only'}</small>
          </button>
          <div className="device-list compact-list">{inputDevices.map((device) => <DeviceCard key={'input-' + device.id} device={device} selected={inputDeviceId === device.id} onSelect={setInputDevice} />)}</div>
        </div>

        <div className="panel compact-panel">
          <PanelTitle icon={<Cable size={18} />} title="Route" hint="Select CABLE Input" />
          <div className="device-list compact-list">{devices.map((device) => <DeviceCard key={'route-' + device.id} device={device} selected={selectedDeviceId === device.id} onSelect={setSelectedDevice} />)}</div>
        </div>

        <div className="panel compact-panel">
          <PanelTitle icon={<Headphones size={18} />} title="Monitor" hint="Optional preview" />
          <button className={!monitorDeviceId ? 'toggle-row selected' : 'toggle-row'} onClick={clearMonitorDevice}>
            <span>No monitor</span>
            <small>Silent locally</small>
          </button>
          <div className="device-list compact-list">{devices.map((device) => <DeviceCard key={'monitor-' + device.id} device={device} selected={monitorDeviceId === device.id} onSelect={setMonitorDevice} />)}</div>
        </div>

        <div className="panel compact-panel system-panel">
          <PanelTitle icon={<MonitorSpeaker size={18} />} title="System audio" hint="Send app sound to call" />
          <div className="system-actions">
            <button className="system-card primary" onClick={openSystemAudioApps}>
              <strong>App audio</strong>
              <span>Pick browser/game → CABLE Input</span>
            </button>
            <button className="system-card" onClick={openSystemAudioAll}>
              <strong>All system</strong>
              <span>Everything → CABLE Input</span>
            </button>
          </div>
          <p className="tiny-warning">Keep Meet/Discord speakers on HyperX to avoid echo.</p>
        </div>
      </section>

      <section className="routing-mini-guide">
        <span><CheckCircle2 size={14} /> MemeBlip route: CABLE Input</span>
        <span><CheckCircle2 size={14} /> Call microphone: CABLE Output</span>
        <span><CheckCircle2 size={14} /> Call speaker: HyperX</span>
      </section>
    </>
  );
}

function PanelTitle({ icon, title, hint }) {
  return (
    <div className="compact-panel-title">
      <div>{icon}<strong>{title}</strong></div>
      <span>{hint}</span>
    </div>
  );
}
