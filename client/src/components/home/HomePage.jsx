import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import HeroVideo from './HeroVideo';
import Header from '../layout/Header';
import { Compass, Shield, Wind, Navigation, AlertTriangle, ArrowRight } from 'lucide-react';

const CAPABILITIES = [
  {
    id: 'sea-ice',
    title: 'SEA ICE FORECASTING',
    subtitle: 'NSIDC & AMSR-2 Concentration Analysis',
    desc: 'Forecast dynamic pack ice movement, leads, and sea-ice concentration grids to identify safe transit windows across polar sectors.',
    route: '/sea-ice',
    icon: Shield,
    tag: 'DEMO / FORECAST',
    accent: '#7dd3fc'
  },
  {
    id: 'icebergs',
    title: 'ICEBERG TRAJECTORY TRACKING',
    subtitle: 'Sentinel-1 SAR Radar & Drift Modeling',
    desc: 'Track tabular icebergs and bergy bit drift paths using Synthetic Aperture Radar (SAR) imagery and hydrodynamic forcing factors.',
    route: '/icebergs',
    icon: AlertTriangle,
    tag: 'DEMO / DETECT',
    accent: '#e0f2fe'
  },
  {
    id: 'routes',
    title: 'ROUTE OPTIMIZATION',
    subtitle: 'Multi-Objective Voyage Planner',
    desc: 'Calculate optimal waypoints balancing icebreaker resistance, fuel consumption index, and standoff distance from active hazards.',
    route: '/routes',
    icon: Navigation,
    tag: 'DEMO / SOLVER',
    accent: '#fbbf24'
  },
  {
    id: 'weather',
    title: 'OCEAN & WEATHER CONDITIONS',
    subtitle: 'Copernicus & ERA5 Reanalysis Integration',
    desc: 'Monitor 10m wind vectors, sea surface temperatures, atmospheric pressure, and wave height fields impacting expedition safety.',
    route: '/weather',
    icon: Wind,
    tag: 'DEMO / ENVIRONMENT',
    accent: '#34d399'
  }
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#071018] text-[#F2F4F5] font-sans selection:bg-[#38bdf8]/30">
      
      {/* Global Persistent Header */}
      <Header />

      {/* ══════════════════════════════════════════════════════
          HERO SECTION — Fullscreen video backdrop + clear messaging
      ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-[calc(100vh-60px)] flex flex-col justify-between px-6 md:px-16 py-12 overflow-hidden">
        {/* Background video engine */}
        <HeroVideo />

        {/* Hero content */}
        <div className="relative z-10 my-auto max-w-4xl pt-8">
          
          {/* Main Title */}
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white uppercase font-display leading-[1.05]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            ANTARCTIC NAVIGATION <br />
            <span className="text-[#38bdf8]">INTELLIGENCE</span>
          </motion.h1>

          {/* Supporting Statement */}
          <motion.p
            className="mt-6 text-lg md:text-xl text-slate-300 max-w-2xl font-light leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            Forecast sea ice. Track iceberg trajectories. Identify safer, fuel-efficient routes for research vessels operating in extreme Southern Ocean latitudes.
          </motion.p>

          {/* Primary Action Buttons */}
          <motion.div
            className="mt-10 flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              onClick={() => navigate('/map')}
              className="px-8 py-3.5 rounded-sm bg-[#38bdf8] hover:bg-[#00e5ff] text-[#071018] font-mono text-xs font-semibold uppercase tracking-[0.2em] transition-all flex items-center gap-3 cursor-pointer shadow-lg shadow-[#38bdf8]/10"
            >
              <Compass className="w-4 h-4" />
              Launch GIS Map Dashboard
            </button>

            <button
              onClick={() => {
                document.getElementById('capabilities')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3.5 rounded-sm bg-black/40 hover:bg-black/60 border border-white/20 text-[#F2F4F5] font-mono text-xs uppercase tracking-[0.18em] transition-all cursor-pointer backdrop-blur-md"
            >
              Explore Capabilities ↓
            </button>
          </motion.div>
        </div>

        {/* Bottom indicator bar */}
        <div className="relative z-10 flex items-center justify-between pt-8 border-t border-white/10 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse" />
            <span>NCPOR / MoES POLAR DECISION SUPPORT</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-500">
            <span>BHARATI STATION</span>
            <span>·</span>
            <span>MAITRI STATION</span>
            <span>·</span>
            <span>PRYDZ BAY</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CAPABILITIES SECTION — Clean natural scrolling cards
      ══════════════════════════════════════════════════════ */}
      <section id="capabilities" className="relative px-6 md:px-16 py-24 bg-[#071018] border-t border-white/[0.08]">
        <div className="max-w-6xl mx-auto">
          
          <div className="mb-16">
            <span className="text-xs font-mono text-[#38bdf8] uppercase tracking-[0.2em]">
              NAVIGATION DECISION SUPPORT
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-white uppercase tracking-tight mt-2">
              System Capabilities
            </h2>
            <p className="text-slate-400 text-sm mt-3 max-w-xl">
              PolarNav AI integrates multi-source Earth observation data into a unified decision platform for Southern Ocean expeditions.
            </p>
          </div>

          {/* Grid of operational capabilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {CAPABILITIES.map((cap, i) => {
              const Icon = cap.icon;
              return (
                <motion.div
                  key={cap.id}
                  onClick={() => navigate(cap.route)}
                  className="group relative bg-[#0b1524]/60 hover:bg-[#0e1b2e] border border-white/[0.08] hover:border-[#38bdf8]/40 p-8 rounded-sm cursor-pointer transition-all duration-300 flex flex-col justify-between"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-10 h-10 rounded-sm bg-[#38bdf8]/10 border border-[#38bdf8]/20 flex items-center justify-center text-[#38bdf8] group-hover:scale-110 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-1 bg-white/5 border border-white/10 text-slate-400 rounded-sm uppercase tracking-wider">
                        {cap.tag}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold font-display text-white uppercase tracking-wide group-hover:text-[#38bdf8] transition-colors">
                      {cap.title}
                    </h3>
                    <div className="text-xs font-mono text-[#38bdf8]/80 mt-1 uppercase tracking-wider">
                      {cap.subtitle}
                    </div>
                    <p className="text-slate-400 text-xs mt-4 leading-relaxed font-sans">
                      {cap.desc}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-400 group-hover:text-white transition-colors">
                    <span className="uppercase tracking-wider">Access Module</span>
                    <ArrowRight className="w-4 h-4 text-[#38bdf8] group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Call to Map */}
          <div className="mt-16 bg-[#0b1524]/90 border border-white/[0.08] p-8 rounded-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold font-display text-white uppercase tracking-tight">
                Antarctic GIS Operational Map
              </h3>
              <p className="text-slate-400 text-xs mt-1 max-w-xl">
                View current vessel telemetry for ORV Sagar Nidhi, research stations, iceberg positions, and AI-assisted route recommendations.
              </p>
            </div>
            <button
              onClick={() => navigate('/map')}
              className="shrink-0 px-6 py-3 bg-[#38bdf8] hover:bg-[#00e5ff] text-[#071018] font-mono text-xs font-bold uppercase tracking-[0.18em] rounded-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              Open Map Console →
            </button>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-16 py-8 border-t border-white/[0.08] bg-[#050b12] text-xs font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          POLARNAV AI · SIH 2026 · PROBLEM ID: 26059
        </div>
        <div>
          NATIONAL CENTRE FOR POLAR AND OCEAN RESEARCH (NCPOR)
        </div>
      </footer>

    </div>
  );
}
