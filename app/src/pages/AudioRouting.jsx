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
        eyebrow="Virtual mic"
        title="Use MemeBlip as the microphone source."
        description="The built-in route will appear as a MemeBlip capture device after the local WDK package is prepared."
        action={<button className="primary-button" onClick={testRoute}><TestTube2 size={18} /> Stop/Test route</button>}
      />
      <section className="routing-grid">
        <div className="panel">
          <h2><Cable size={20} /> MemeBlip mic route</h2>
          <p className="muted-copy">Select the MemeBlip endpoint here after it appears in Windows audio devices.</p>
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
        <h2><Headphones size={20} /> Built-in route checklist</h2>
        <div className="route-step active"><CheckCircle2 size={16} /> 1. Prepare the WDK workspace from driver/scripts</div>
        <div className="route-line" />
        <div className="route-step"><CheckCircle2 size={16} /> 2. Build the local audio package</div>
        <div className="route-line" />
        <div className="route-step"><CheckCircle2 size={16} /> 3. Add the package to Windows audio devices</div>
        <div className="route-line" />
        <div className="route-step"><CheckCircle2 size={16} /> 4. Select MemeBlip as the microphone in the target app</div>
      </section>
    </>
  );
}
