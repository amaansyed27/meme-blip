import { Cable, CheckCircle2, Headphones, TestTube2 } from 'lucide-react';
import { DeviceCard } from '../components/DeviceCard.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { useMemeBlipStore } from '../state/useMemeBlipStore.js';

export function AudioRouting() {
  const devices = useMemeBlipStore((state) => state.devices);
  const selectedDeviceId = useMemeBlipStore((state) => state.selectedDeviceId);
  const monitorDeviceId = useMemeBlipStore((state) => state.monitorDeviceId);
  const setSelectedDevice = useMemeBlipStore((state) => state.setSelectedDevice);
  const setMonitorDevice = useMemeBlipStore((state) => state.setMonitorDevice);
  const clearMonitorDevice = useMemeBlipStore((state) => state.clearMonitorDevice);
  const testRoute = useMemeBlipStore((state) => state.testRoute);

  return (
    <>
      <PageHeader
        eyebrow="Routing"
        title="Send clips into a mic route and still hear them locally."
        description="Set Mic Route to VB-CABLE Input or VoiceMeeter Input. Then set your game/meeting microphone to VB-CABLE Output or VoiceMeeter Output."
        action={<button className="primary-button" onClick={testRoute}><TestTube2 size={18} /> Stop/Test route</button>}
      />
      <section className="routing-grid">
        <div className="panel">
          <h2><Cable size={20} /> Mic route output</h2>
          <p className="muted-copy">Choose the virtual output that becomes a microphone input in other apps.</p>
          <div className="device-list">{devices.map((device) => <DeviceCard key={'route-' + device.id} device={device} selected={selectedDeviceId === device.id} onSelect={setSelectedDevice} />)}</div>
        </div>
        <div className="panel">
          <h2><Headphones size={20} /> Monitor output</h2>
          <p className="muted-copy">Optional. Choose headphones/speakers if you also want to hear the clip yourself.</p>
          <button className={!monitorDeviceId ? 'device-card selected' : 'device-card'} onClick={clearMonitorDevice}><span>{!monitorDeviceId ? <CheckCircle2 size={18} /> : null}</span><div><strong>No monitor</strong><p>Only send to mic route</p></div><small>Optional</small></button>
          <div className="device-list">{devices.map((device) => <DeviceCard key={'monitor-' + device.id} device={device} selected={monitorDeviceId === device.id} onSelect={setMonitorDevice} />)}</div>
        </div>
      </section>
      <section className="panel route-diagram setup-wide">
        <h2><Headphones size={20} /> Setup wizard</h2>
        <div className="route-step active"><CheckCircle2 size={16} /> 1. Install VB-CABLE or VoiceMeeter</div>
        <div className="route-line" />
        <div className="route-step"><CheckCircle2 size={16} /> 2. Set MemeBlip Mic Route to Cable Input / VoiceMeeter Input</div>
        <div className="route-line" />
        <div className="route-step"><CheckCircle2 size={16} /> 3. In Discord, Meet, Zoom, or Valorant, set microphone to Cable Output / VoiceMeeter Output</div>
        <div className="route-line" />
        <div className="route-step"><CheckCircle2 size={16} /> 4. Set Monitor Output to your headphones if you want local preview</div>
      </section>
    </>
  );
}
