import { CircleDot, Grid2X2, PlugZap, Radio } from 'lucide-react';
import { motion } from 'framer-motion';

const toneIcons = {
  wave: Radio,
  grid: Grid2X2,
  online: CircleDot,
  offline: CircleDot,
  route: PlugZap
};

export function MetricCard({ label, value, detail, tone = 'wave' }) {
  const Icon = toneIcons[tone] || Radio;

  return (
    <motion.section className={`metric-card metric-${tone}`} whileHover={{ y: -3 }}>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{detail}</span>
      </div>
      <i aria-hidden="true"><Icon size={17} /></i>
    </motion.section>
  );
}
