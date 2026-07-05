import { motion } from 'framer-motion';

export function MetricCard({ label, value, detail }) {
  return (
    <motion.section className="metric-card" whileHover={{ y: -3 }}>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </motion.section>
  );
}
