import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function HeroNavigation({ onOpenAbout }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-20 w-full px-6 md:px-12 py-6 md:py-8 flex items-center justify-between select-none"
    >
      {/* Top Left Branding */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-sm bg-white/5 border border-white/20 flex items-center justify-center text-cyan-300 group-hover:border-cyan-400/60 transition-colors">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold tracking-[0.2em] text-white font-tech uppercase">
              POLARNAV <span className="text-cyan-400 font-extrabold">AI</span>
            </div>
            <div className="text-[10px] font-mono tracking-widest text-slate-400 flex items-center gap-1.5 uppercase mt-0.5">
              <span>MOES / NCPOR</span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400/80">SIH-26059</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Top Right Minimal Navigation */}
      <nav className="flex items-center gap-6 md:gap-10 text-[11px] font-mono tracking-[0.15em] uppercase text-slate-300">
        <Link
          to="/system"
          className="hover:text-cyan-300 transition-colors duration-200"
        >
          SYSTEM
        </Link>
        <Link
          to="/map"
          className="hover:text-cyan-300 transition-colors duration-200 hidden sm:inline"
        >
          MAP
        </Link>
        <button
          onClick={onOpenAbout}
          className="hover:text-cyan-300 transition-colors duration-200 text-slate-300 hover:text-white"
        >
          ABOUT
        </button>
      </nav>
    </motion.header>
  );
}
