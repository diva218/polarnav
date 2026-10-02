import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function ModuleCard({
  number,
  title,
  description,
  path,
  badge,
  isFeatured = false,
  index = 0
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.15 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={path}
        className={`group relative block h-full p-6 md:p-8 rounded transition-all duration-300 border ${
          isFeatured
            ? 'bg-[#081224]/80 border-cyan-500/40 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(0,229,255,0.15)]'
            : 'bg-[#060b17]/60 border-slate-800/80 hover:border-slate-600 hover:bg-[#081020]/90'
        }`}
      >
        {/* Card Header: Number & Arrow */}
        <div className="flex items-start justify-between mb-8 md:mb-12">
          <span className="text-2xl md:text-3xl font-bold font-mono text-slate-500 group-hover:text-cyan-400 transition-colors duration-300">
            {number}
          </span>
          <div className="w-10 h-10 rounded-full border border-slate-700/80 flex items-center justify-center text-slate-400 group-hover:border-cyan-400 group-hover:text-cyan-300 group-hover:bg-cyan-950/60 transition-all duration-300">
            <ArrowUpRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>

        {/* Card Body: Title & Description */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xl md:text-2xl font-bold text-white font-display uppercase tracking-wide group-hover:translate-x-1 transition-transform duration-300">
              {title}
            </h3>
            {badge && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm text-slate-400 font-sans leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
            {description}
          </p>
        </div>

        {/* Bottom subtle accent line on hover */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b" />
      </Link>
    </motion.div>
  );
}
