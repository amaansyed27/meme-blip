import { CheckCircle2, Circle } from 'lucide-react';
import { useMemeBlipStore } from '../state/useMemeBlipStore.js';

export function DeviceCard({ device }) {
  const selectedDeviceId = useMemeBlipStore((state) => state.selectedDeviceId);
  const setSelectedDevice = useMemeBlipStore((state) => state.setSelectedDevice);
  const selected = selectedDeviceId === device.id;

  return (
    <button className={selected ? 'device-card selected' : 'device-card'} onClick={() => setSelectedDevice(device.id)}>
      <span>{selected ? <CheckCircle2 size={18} /> : <Circle size={18} />}</span>
      <div>
        <strong>{device.name}</strong>
        <p>{device.type}</p>
      </div>
      <small>{device.status}</small>
    </button>
  );
}
