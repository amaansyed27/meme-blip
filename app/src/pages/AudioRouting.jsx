import { Cable, CheckCircle2, Headphones, TestTube2 } from 'lucide-react';
import { DeviceCard } from '../components/DeviceCard.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { useMemeBlipStore } from '../state/useMemeBlipStore.js';

export function AudioRouting() {
  const devices = useMemeBlipStore((state) => state.devices);
  const testRoute = useMemeBlipStore((state) => state.testRoute);

  return (
    <>
      <PageHeader
        eyebrow="Routing"
        title="Choose where MemeBlip sends audio."
        description="Use a virtual route for games and meetings, then set that route as the mic inside Discord, Meet, Zoom, or Valorant."
        action={<button className="primary-button" onClick={testRoute}><TestTube2 size={18} /> Test route</button>}
      />
      <section className="routing-grid">
        <div className="panel">
          <h2><Cable size={20} /> Output device</h2>
          <p className="muted-copy">Pick Cable Input, VoiceMeeter Input, BlackHole, or your headphones.</p>
          <div className="device-list">{devices.map((device) => <DeviceCard key={device.id} device={device} />)}</div>
        </div>
        <div className="panel route-diagram">
          <h2><Headphones size={20} /> Setup wizard</h2>
          <div className="route-step active"><CheckCircle2 size={16} /> 1. Install a virtual audio route</div>
          <div className="route-line" />
          <div className="route-step"><CheckCircle2 size={16} /> 2. Select that route above</div>
          <div className="route-line" />
          <div className="route-step"><CheckCircle2 size={16} /> 3. Set app microphone to its output</div>
          <p>For Windows use VB-CABLE or VoiceMeeter. For macOS use BlackHole. For Linux use PipeWire routing.</p>
        </div>
      </section>
    </>
  );
}
