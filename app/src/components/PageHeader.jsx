import { motion } from 'framer-motion';

export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <motion.header className="page-header" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      {action ? <div className="page-action">{action}</div> : null}
    </motion.header>
  );
}
