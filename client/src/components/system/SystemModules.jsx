import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import ModuleCard from './ModuleCard';

const MODULES = [
  {
    number: '01',
    title: 'POLAR MAP',
    description: 'Interactive Antarctic navigation GIS map with MapTiler satellite telemetry, vessel tracking, and iceberg corridors.',
    path: '/map',
    badge: 'ONLINE GIS',
    isFeatured: true
  },
  {
    number: '02',
    title: 'SEA ICE',
    description: 'Satellite multi-sensor sea-ice concentration (SIC), thickness modeling, and seasonal fracture leads.',
    path: '/sea-ice',
    badge: 'SIMULATION'
  },
  {
    number: '03',
    title: 'ICEBERGS',
    description: 'Automated SAR iceberg detection, volume estimation, and drift trajectory forecasting.',
    path: '/icebergs',
    badge: 'SIMULATION'
  },
  {
    number: '04',
    title: 'ROUTE OPTIMIZATION',
    description: 'AI polar route planning, fuel-efficiency curves, and Polar Code ice risk minimization.',
    path: '/routes',
    badge: 'SIMULATION'
  },
  {
    number: '05',
    title: 'WEATHER & OCEAN',
    description: 'Katabatic wind streamlines, surface isotherms, ocean currents, and swell damping analytics.',
    path: '/weather',
    badge: 'SIMULATION'
  },
  {
    number: '06',
    title: 'MISSION CONTROL',
    description: 'Vessel telemetry stream, NCPOR base station communications, and operational loggers.',
    path: '/mission',
    badge: 'SIMULATION'
  }
];

export default function SystemModules() {
  return (
    <div className="min-h-screen w-full bg-[#040813] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950 select-none relative overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[300px] bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navigation */}
      <header className="px-6 md:px-12 py-6 md:py-8 flex items-center justify-between border-b border-white/5 relative z-10">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-300 uppercase tracking-widest transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>RETURN TO HOME</span>
        </Link>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-semibold">ALL SYSTEMS STANDBY</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 py-10 md:py-16 relative z-10">
        {/* Section Header */}
        <div className="mb-10 md:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2 text-cyan-400 text-xs font-mono tracking-[0.2em] uppercase mb-2"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>OPERATIONAL ARCHITECTURE</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl md:text-5xl lg:text-6xl font-black text-white font-display uppercase tracking-tight"
          >
            POLARNAV <span className="text-cyan-400 font-bold">MODULES</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs md:text-sm font-mono text-slate-400 uppercase tracking-wider mt-2"
          >
            SELECT AN OPERATIONAL SUBSYSTEM TO COMMENCE POLAR MONITORING & NAVIGATION
          </motion.p>
        </div>

        {/* Grid of 6 Interactive Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {MODULES.map((module, idx) => (
            <ModuleCard
              key={module.number}
              number={module.number}
              title={module.title}
              description={module.description}
              path={module.path}
              badge={module.badge}
              isFeatured={module.isFeatured}
              index={idx}
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-500 gap-3 relative z-10">
        <div>
          POLARNAV AI • SIH-26059 • MINISTRY OF EARTH SCIENCES (MOES)
        </div>
        <div className="text-slate-400 flex items-center gap-2">
          <span>NATIONAL CENTRE FOR POLAR AND OCEAN RESEARCH (NCPOR)</span>
        </div>
      </footer>
    </div>
  );
}
