import { Cable, CheckCircle2, Headphones, Mic2, TestTube2 } from 'lucide-react';
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
  const testRoute = useMemeBlipStore((state) => state.testRoute);

  return (
    <>
      <PageHeader
        eyebrow="Mixer route"
        title="Keep your mic and speakers normal, then add MemeBlip on top."
        description="Target apps should use MemeBlip Virtual Mic. Internally, MemeBlip passes through your real mic and mixes meme sounds into that stream."
        action={<button className="primary-button" onClick={testRoute}><TestTube2 size={18} /> Stop/Test route</button>}
      />
      <section className="routing-grid">
        <div className="panel">
          <h2><Mic2 size={20} /> Real mic source</h2>
          <p className="muted-copy">Choose your normal physical mic. MemeBlip keeps this as the voice source for passthrough.</p>
          <button className={micPassthroughEnabled ? 'device-card selected' : 'device-card'} onClick={() => setMicPassthroughEnabled(!micPassthroughEnabled)}><span>{micPassthroughEnabled ? <CheckCircle2 size={18} /> : null}</span><div><strong>Mic passthrough</strong><p>{micPassthroughEnabled ? 'Voice is included in MemeBlip Virtual Mic' : 'Only meme sounds are included'}</p></div><small>{micPassthroughEnabled ? 'On' : 'Off'}</small></button>
          <div className="device-list">{inputDevices.map((device) => <DeviceCard key={'input-' + device.id} device={device} selected={inputDeviceId === device.id} onSelect={setInputDevice} />)}</div>
        </div>
        <div className="panel">
          <h2><Cable size={20} /> MemeBlip Virtual Mic</h2>
          <p className="muted-copy">Select the MemeBlip endpoint after the WDK package appears in Windows audio devices.</p>
          <div className="device-list">{devices.map((device) => <DeviceCard key={'route-' + device.id} device={device} selected={selectedDeviceId === device.id} onSelect={setSelectedDevice} />)}</div>
        </div>
        <div className="panel">
          <h2><Headphones size={20} /> Monitor output</h2>
          <p className="muted-copy">Optional preview only. Your system speaker output can stay as it is.</p>
          <button className={!monitorDeviceId ? 'device-card selected' : 'device-card'} onClick={clearMonitorDevice}><span>{!monitorDeviceId ? <CheckCircle2 size={18} /> : null}</span><div><strong>No monitor</strong><p>Do not preview sounds locally</p></div><small>Optional</small></button>
          <div className="device-list">{devices.map((device) => <DeviceCard key={'monitor-' + device.id} device={device} selected={monitorDeviceId === device.id} onSelect={setMonitorDevice} />)}</div>
        </div>
      </section>
      <section className="panel route-diagram setup-wide">
        <h2><Headphones size={20} /> Final audio flow</h2>
        <div className="route-step active"><CheckCircle2 size={16} /> 1. Your system speakers/headphones remain unchanged</div>
        <div className="route-line" />
        <div className="route-step"><CheckCircle2 size={16} /> 2. Your real mic is selected as MemeBlip voice source</div>
        <div className="route-line" />
        <div className="route-step"><CheckCircle2 size={16} /> 3. MemeBlip mixes real mic audio + meme sounds</div>
        <div className="route-line" />
        <div className="route-step"><CheckCircle2 size={16} /> 4. Discord, Meet, Zoom, or Valorant selects MemeBlip Virtual Mic</div>
      </section>
    </>
  );
}
