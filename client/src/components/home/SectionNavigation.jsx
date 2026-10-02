import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SECTIONS = [
  { id: 'hero',    num: '—',   label: 'POLARNAV' },
  { id: 'map',     num: '01',  label: 'POLAR MAP' },
  { id: 'sea-ice', num: '02',  label: 'SEA ICE' },
  { id: 'icebergs',num: '03',  label: 'ICEBERGS' },
  { id: 'routes',  num: '04',  label: 'ROUTES' },
  { id: 'ocean',   num: '05',  label: 'OCEAN' },
  { id: 'mission', num: '06',  label: 'MISSION' },
];

export default function SectionNavigation({ active }) {
  const handleClick = (id) => {
    const el = document.getElementById(`section-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav
      className="fixed right-8 top-1/2 z-40 hidden lg:flex flex-col gap-5"
      style={{ transform: 'translateY(-50%)' }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {SECTIONS.map((s) => {
        const isActive = active === s.id;
        return (
          <button
            key={s.id}
            onClick={() => handleClick(s.id)}
            className="group flex items-center gap-3 text-right cursor-pointer"
            style={{ background: 'none', border: 'none', padding: 0 }}
          >
            {/* Label — appears on hover or active */}
            <AnimatePresence>
              {isActive && (
                <motion.span
                  className="font-mono text-white"
                  style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  {s.label}
                </motion.span>
              )}
            </AnimatePresence>

            {/* Dot / indicator */}
            <div className="relative flex items-center justify-center" style={{ width: 20, height: 20 }}>
              <motion.div
                className="rounded-full"
                animate={{
                  width: isActive ? 8 : 4,
                  height: isActive ? 8 : 4,
                  backgroundColor: isActive ? '#00e5ff' : 'rgba(255,255,255,0.3)',
                  boxShadow: isActive ? '0 0 10px rgba(0,229,255,0.6)' : 'none',
                }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              />
              {/* Hover ring */}
              <motion.div
                className="absolute rounded-full border border-white/20"
                style={{ width: 16, height: 16 }}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </button>
        );
      })}
    </motion.nav>
  );
}
