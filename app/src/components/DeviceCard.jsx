import { CheckCircle2, Circle } from 'lucide-react';

export function DeviceCard({ device, selected, onSelect }) {
  return (
    <button className={selected ? 'device-card selected' : 'device-card'} onClick={() => onSelect(device.id)}>
      <span>{selected ? <CheckCircle2 size={18} /> : <Circle size={18} />}</span>
      <div>
        <strong>{device.name}</strong>
        <p>{device.type}</p>
      </div>
      <small>{device.status}</small>
    </button>
  );
}
