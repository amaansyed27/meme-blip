import { Cable, Headphones, TestTube2 } from 'lucide-react';
import { DeviceCard } from '../components/DeviceCard.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { useMemeBlipStore } from '../state/useMemeBlipStore.js';

export function AudioRouting() {
  const devices = useMemeBlipStore((state) => state.devices);

  return (
    <>
      <PageHeader
        eyebrow="Routing"
        title="Choose where MemeBlip sends audio."
        description="Use a virtual route for games and meetings, then keep a monitor output for your headphones."
        action={<button className="primary-button"><TestTube2 size={18} /> Test route</button>}
      />
      <section className="routing-grid">
        <div className="panel">
          <h2><Cable size={20} /> Output device</h2>
          <p className="muted-copy">Select the device that receives soundboard clips.</p>
          <div className="device-list">{devices.map((device) => <DeviceCard key={device.id} device={device} />)}</div>
        </div>
        <div className="panel route-diagram">
          <h2><Headphones size={20} /> Flow</h2>
          <div className="route-step">MemeBlip companion</div>
          <div className="route-line" />
          <div className="route-step active">Virtual cable input</div>
          <div className="route-line" />
          <div className="route-step">Game or meeting microphone</div>
          <p>Version one uses existing virtual audio drivers. The custom driver comes later.</p>
        </div>
      </section>
    </>
  );
}
