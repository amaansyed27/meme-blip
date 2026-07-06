import { Cable, CheckCircle2, Headphones, Mic2 } from 'lucide-react';
import { DeviceCard } from '../components/DeviceCard.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { useMemeBlipStore } from '../state/useMemeBlipStore.js';

function isStandardCableInput(device) {
  const name = device.name.toLowerCase();
  return name.includes('cable input') && !name.includes('16ch');
}

function routeRank(device) {
  const name = device.name.toLowerCase();
  if (isStandardCableInput(device)) return 0;
  if (name.includes('cable') && name.includes('16ch')) return 3;
  if (name.includes('cable input')) return 1;
  return 2;
}

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
  const routeDevices = [...devices].sort((a, b) => routeRank(a) - routeRank(b));

  return (
    <>
      <PageHeader
        eyebrow="Audio"
        title="Routing"
        description="Route mic and MemeBlip clips into your call."
      />

      <section className="routing-status-strip">
        <div><Mic2 size={15} /><span>Mic passthrough</span></div>
        <div><Cable size={15} /><span>CABLE Input → CABLE Output</span></div>
        <div><Headphones size={15} /><span>Monitor: HyperX</span></div>
      </section>

      <section className="routing-compact-grid routing-three">
        <div className="panel compact-panel">
          <PanelTitle icon={<Mic2 size={18} />} title="Mic" hint="Your real microphone" />
          <button className={micPassthroughEnabled ? 'toggle-row selected' : 'toggle-row'} onClick={() => setMicPassthroughEnabled(!micPassthroughEnabled)}>
            <span>{micPassthroughEnabled ? 'Passthrough on' : 'Passthrough off'}</span>
            <small>{micPassthroughEnabled ? 'Voice included' : 'Clips only'}</small>
          </button>
          <div className="device-list compact-list">{inputDevices.map((device) => <DeviceCard key={'input-' + device.id} device={device} selected={inputDeviceId === device.id} onSelect={setInputDevice} />)}</div>
        </div>

        <div className="panel compact-panel">
          <PanelTitle icon={<Cable size={18} />} title="Route" hint="Use normal CABLE Input" />
          <p className="micro-note">Avoid the 16ch cable for now.</p>
          <div className="device-list compact-list">{routeDevices.map((device) => <DeviceCard key={'route-' + device.id} device={device} selected={selectedDeviceId === device.id} onSelect={setSelectedDevice} />)}</div>
        </div>

        <div className="panel compact-panel">
          <PanelTitle icon={<Headphones size={18} />} title="Monitor" hint="What you hear" />
          <button className={!monitorDeviceId ? 'toggle-row selected' : 'toggle-row'} onClick={clearMonitorDevice}>
            <span>No monitor</span>
            <small>Silent locally</small>
          </button>
          <div className="device-list compact-list">{devices.map((device) => <DeviceCard key={'monitor-' + device.id} device={device} selected={monitorDeviceId === device.id} onSelect={setMonitorDevice} />)}</div>
        </div>
      </section>

      <section className="routing-mini-guide">
        <span><CheckCircle2 size={14} /> Upload clips in MemeBlip</span>
        <span><CheckCircle2 size={14} /> Call mic: CABLE Output</span>
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
