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
        eyebrow="No-driver mode"
        title="Use VB-CABLE now, build MemeBlip's own driver later."
        description="MemeBlip passes your real mic into CABLE Input and plays meme sounds into the same route. Target apps should use CABLE Output as the microphone."
        action={<button className="primary-button" onClick={testRoute}><TestTube2 size={18} /> Stop sounds</button>}
      />
      <section className="routing-grid">
        <div className="panel">
          <h2><Mic2 size={20} /> Real mic source</h2>
          <p className="muted-copy">Choose your normal physical mic. Do not choose CABLE Output here.</p>
          <button className={micPassthroughEnabled ? 'device-card selected' : 'device-card'} onClick={() => setMicPassthroughEnabled(!micPassthroughEnabled)}><span>{micPassthroughEnabled ? <CheckCircle2 size={18} /> : null}</span><div><strong>Mic passthrough</strong><p>{micPassthroughEnabled ? 'Voice is sent into CABLE Input' : 'Only meme sounds are sent into the cable'}</p></div><small>{micPassthroughEnabled ? 'On' : 'Off'}</small></button>
          <div className="device-list">{inputDevices.map((device) => <DeviceCard key={'input-' + device.id} device={device} selected={inputDeviceId === device.id} onSelect={setInputDevice} />)}</div>
        </div>
        <div className="panel">
          <h2><Cable size={20} /> Virtual route</h2>
          <p className="muted-copy">Select <strong>CABLE Input</strong>. This is where MemeBlip sends mic passthrough and meme sounds.</p>
          <div className="device-list">{devices.map((device) => <DeviceCard key={'route-' + device.id} device={device} selected={selectedDeviceId === device.id} onSelect={setSelectedDevice} />)}</div>
        </div>
        <div className="panel">
          <h2><Headphones size={20} /> Monitor output</h2>
          <p className="muted-copy">Optional preview only. Select your normal headphones/speakers if you want to hear meme clips yourself.</p>
          <button className={!monitorDeviceId ? 'device-card selected' : 'device-card'} onClick={clearMonitorDevice}><span>{!monitorDeviceId ? <CheckCircle2 size={18} /> : null}</span><div><strong>No monitor</strong><p>Do not preview sounds locally</p></div><small>Optional</small></button>
          <div className="device-list">{devices.map((device) => <DeviceCard key={'monitor-' + device.id} device={device} selected={monitorDeviceId === device.id} onSelect={setMonitorDevice} />)}</div>
        </div>
      </section>
      <section className="panel route-diagram setup-wide">
        <h2><Headphones size={20} /> Final audio flow</h2>
        <div className="route-step active"><CheckCircle2 size={16} /> 1. Install VB-CABLE, then reboot Windows</div>
        <div className="route-line" />
        <div className="route-step"><CheckCircle2 size={16} /> 2. In MemeBlip, Real mic source = your normal microphone</div>
        <div className="route-line" />
        <div className="route-step"><CheckCircle2 size={16} /> 3. In MemeBlip, Virtual route = CABLE Input</div>
        <div className="route-line" />
        <div className="route-step"><CheckCircle2 size={16} /> 4. In Discord, Meet, Zoom, or Valorant, Microphone = CABLE Output</div>
      </section>
      <section className="panel setup-wide">
        <h2><Cable size={20} /> Third-party notice</h2>
        <p className="muted-copy">No-driver mode is powered by VB-CABLE from VB-Audio Software. VB-CABLE is donationware; all participation is welcome. MemeBlip's own native driver remains a later path.</p>
      </section>
    </>
  );
}
