import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Layers, TrendingUp, Wind, Navigation2, Volume2, VolumeX, ChevronDown } from 'lucide-react';
import { VIDEO_REELS } from '../../data/videoData';

const VIDEO_DURATION_MS = 10000;
const FADE_DURATION_MS = 1000;

const CAPABILITIES = [
  {
    id: 'sea-ice',
    route: '/sea-ice',
    icon: Layers,
    label: 'SEA ICE',
    title: 'Concentration Analysis',
    body: 'Map passive microwave sea-ice concentration across Southern Ocean sectors. Identify navigable leads and impassable pack-ice regions.',
    status: 'DEMO DATA',
    statusColor: 'amber',
  },
  {
    id: 'icebergs',
    route: '/icebergs',
    icon: TrendingUp,
    label: 'ICEBERGS',
    title: 'Detection & Tracking',
    body: 'Catalog tabular icebergs detected from SAR imagery. Visualize drift vectors and assess collision hazard radii around vessel corridors.',
    status: 'DEMO DATA',
    statusColor: 'amber',
  },
  {
    id: 'routes',
    route: '/routes',
    icon: Navigation2,
    label: 'ROUTES',
    title: 'Optimized Navigation',
    body: 'Compare route options that balance distance, fuel, sea-ice resistance, and standoff distance from active ice hazards.',
    status: 'DEMO DATA',
    statusColor: 'amber',
  },
  {
    id: 'weather',
    route: '/weather',
    icon: Wind,
    label: 'WEATHER',
    title: 'Environmental Conditions',
    body: 'Monitor wind, wave height, temperature and surface current parameters across active operational sectors.',
    status: 'DATA NOT CONNECTED',
    statusColor: 'slate',
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }
  }),
};

export default function PolarNavHome() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRefs = useRef(VIDEO_REELS.map(() => React.createRef()));

  // Start all videos silently, play first one
  useEffect(() => {
    videoRefs.current.forEach((ref, i) => {
      if (!ref.current) return;
      ref.current.muted = true;
      if (i === 0) ref.current.play().catch(() => {});
    });
  }, []);

  // Sync mute
  useEffect(() => {
    videoRefs.current.forEach(ref => {
      if (ref.current) ref.current.muted = isMuted;
    });
  }, [isMuted]);

  // Auto-advance
  useEffect(() => {
    const t = setTimeout(() => {
      const next = (activeIndex + 1) % VIDEO_REELS.length;
      const nextEl = videoRefs.current[next]?.current;
      if (nextEl) { nextEl.muted = isMuted; nextEl.currentTime = 0; nextEl.play().catch(() => {}); }
      setFadingOut(true);
      setTimeout(() => { setActiveIndex(next); setFadingOut(false); }, FADE_DURATION_MS);
    }, VIDEO_DURATION_MS);
    return () => clearTimeout(t);
  }, [activeIndex, isMuted]);

  return (
    <div className="bg-[#050d17] text-white min-h-screen">

      {/* ════════════════════════════════════════
          HERO — fullscreen video
      ════════════════════════════════════════ */}
      <section className="relative h-screen w-full overflow-hidden">

        {/* Video layers */}
        {VIDEO_REELS.map((reel, i) => (
          <video
            key={reel.id}
            ref={videoRefs.current[i]}
            src={reel.videoSrc}
            loop muted playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: i === activeIndex ? (fadingOut ? 0 : 1) : 0,
              transition: `opacity ${FADE_DURATION_MS}ms ease-in-out`,
              zIndex: i === activeIndex ? 2 : 1,
            }}
          />
        ))}

        {/* Overlays — light, so video breathes */}
        <div className="absolute inset-0 z-[3] bg-gradient-to-b from-black/55 via-transparent to-black/80" />
        <div className="absolute inset-0 z-[3] bg-gradient-to-r from-black/30 via-transparent to-transparent" />

        {/* Top nav bar (standalone on hero, full nav is in App layout) */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 pt-5">
          <div className="flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="3 11 22 2 13 21 11 13 3 11"/>
            </svg>
            <span className="text-[12px] font-bold tracking-[0.2em] font-display text-white">POLARNAV AI</span>
          </div>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer backdrop-blur-sm"
          >
            {isMuted
              ? <VolumeX className="w-3.5 h-3.5 text-white/70" />
              : <Volume2 className="w-3.5 h-3.5 text-white" />
            }
          </button>
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end px-6 md:px-16 pb-20">

          {/* Reel tag */}
          <motion.div
            key={activeIndex + '-tag'}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 mb-5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-tech tracking-[0.25em] text-cyan-300/80 uppercase">
              {VIDEO_REELS[activeIndex].tag}
            </span>
          </motion.div>

          {/* Main title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="font-display font-extrabold uppercase text-white leading-[1.0] tracking-tight text-[clamp(2.5rem,6.8vw,6.2rem)]">
              Antarctic<br />
              <span className="text-[#38bdf8] font-medium">Navigation</span><br />
              Intelligence
            </h1>
          </motion.div>

          <motion.p
            className="mt-6 text-sm md:text-base text-slate-300/80 max-w-lg leading-relaxed font-body"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            Geospatial decision-support system for Southern Ocean navigation — integrating sea-ice monitoring, iceberg detection, and route optimization.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              onClick={() => navigate('/map')}
              className="group flex items-center gap-2.5 px-7 py-3.5 bg-[#38bdf8] hover:bg-cyan-300 text-[#050d17] text-xs font-bold font-tech tracking-[0.2em] uppercase rounded-sm transition-all cursor-pointer shadow-lg shadow-cyan-400/20"
            >
              LAUNCH MAP
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => {
                document.getElementById('capabilities')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group flex items-center gap-2.5 px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white/90 text-xs font-tech tracking-[0.18em] uppercase rounded-sm transition-all cursor-pointer backdrop-blur-md"
            >
              EXPLORE SYSTEM
              <ChevronDown className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </motion.div>

          {/* Video progress indicator */}
          <div className="flex items-center gap-2 mt-12">
            {VIDEO_REELS.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  const nextEl = videoRefs.current[i]?.current;
                  if (nextEl) { nextEl.muted = isMuted; nextEl.currentTime = 0; nextEl.play().catch(() => {}); }
                  setFadingOut(true);
                  setTimeout(() => { setActiveIndex(i); setFadingOut(false); }, FADE_DURATION_MS);
                }}
                className="h-[2px] rounded-full transition-all duration-500 cursor-pointer"
                style={{
                  width: i === activeIndex ? 36 : 12,
                  background: i === activeIndex ? '#38bdf8' : 'rgba(255,255,255,0.2)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-6 right-8 z-10 hidden sm:flex items-center gap-2 text-[9px] font-tech tracking-[0.2em] text-white/40 uppercase">
          <span>Scroll down</span>
          <ChevronDown className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
        </div>
      </section>

      {/* ════════════════════════════════════════
          WHAT IS POLARNAV
      ════════════════════════════════════════ */}
      <section className="px-6 md:px-16 py-28 border-t border-white/[0.08]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <p className="text-[11px] font-tech tracking-[0.25em] text-[#38bdf8] uppercase mb-4">
              Platform Overview
            </p>
            <h2 className="font-display font-bold text-white uppercase text-3xl md:text-5xl leading-tight tracking-tight">
              Designed for<br />
              Southern Ocean<br />
              Operations
            </h2>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="space-y-6 pt-2"
          >
            <p className="text-slate-300 text-base md:text-lg leading-relaxed font-body font-light">
              PolarNav unifies satellite observation streams, sea-ice models, iceberg telemetry, and interactive route calculation into a single high-contrast interface designed for vessel bridges and polar expedition centers.
            </p>
            <p className="text-slate-400 text-sm leading-relaxed font-body">
              Built as an expedition decision-support system prototype for NCPOR / MoES Antarctic operations. Every capability module provides targeted analytics with explicit data status labels.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CAPABILITIES — VERTICAL EDITORIAL SEQUENCE
      ════════════════════════════════════════ */}
      <section id="capabilities" className="px-6 md:px-16 py-28 border-t border-white/[0.08]">
        <div className="max-w-6xl mx-auto">

          <motion.div
            className="mb-16 pb-8 border-b border-white/[0.08] flex flex-col md:flex-row md:items-end justify-between gap-6"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            <div>
              <p className="text-[11px] font-tech tracking-[0.25em] text-[#38bdf8] uppercase mb-3">
                System Sequence
              </p>
              <h2 className="font-display font-extrabold text-white uppercase text-3xl md:text-5xl tracking-tight">
                Core Capabilities
              </h2>
            </div>
            <p className="text-xs font-tech text-slate-400 tracking-wider">
              (01 — 04) EDITORIAL SEQUENCE
            </p>
          </motion.div>

          {/* Single Vertical Editorial Sequence */}
          <div className="divide-y divide-white/[0.08]">
            {[
              {
                num: '(01)',
                id: 'map',
                route: '/map',
                icon: Navigation2,
                label: 'POLAR MAP',
                title: 'POLAR MAP',
                sub: 'Interactive Antarctic GIS & Multilayer Operational Engine',
                body: 'All geospatial intelligence streams — sea ice concentration, iceberg vectors, vessel telemetry, research stations, and navigation hazards — converge on an interactive Antarctic map console.',
                status: 'LIVE GIS',
                statusColor: 'cyan',
              },
              {
                num: '(02)',
                id: 'sea-ice',
                route: '/sea-ice',
                icon: Layers,
                label: 'SEA ICE',
                title: 'SEA ICE',
                sub: 'Sea-ice concentration & forecasting',
                body: 'Map passive microwave sea-ice observations across Southern Ocean operational sectors. Identify navigable leads, floe boundaries, and impassable pack ice regions.',
                status: 'DEMO DATA',
                statusColor: 'amber',
              },
              {
                num: '(03)',
                id: 'icebergs',
                route: '/icebergs',
                icon: TrendingUp,
                label: 'ICEBERGS',
                title: 'ICEBERGS',
                sub: 'Iceberg detection & trajectory prediction',
                body: 'Synthetic Aperture Radar (SAR) cataloging of tabular icebergs. Visualize drift vectors, size classifications, and collision hazard radii around active vessel corridors.',
                status: 'DEMO DATA',
                statusColor: 'amber',
              },
              {
                num: '(04)',
                id: 'routes',
                route: '/routes',
                icon: Wind,
                label: 'ROUTE INTELLIGENCE',
                title: 'ROUTE INTELLIGENCE',
                sub: 'Dynamic navigation & risk optimization',
                body: 'Calculate and compare route variants that optimize distance, fuel burn, sea-ice resistance, and safe standoff distances from active ice hazard zones.',
                status: 'DEMO DATA',
                statusColor: 'amber',
              },
            ].map((item, i) => {
              const Icon = item.icon;
              const statusClasses = {
                cyan: 'text-cyan-300 border-cyan-500/30 bg-cyan-950/30',
                amber: 'text-amber-300/90 border-amber-500/30 bg-amber-950/20',
                slate: 'text-slate-400 border-slate-600/30 bg-slate-900/40',
              }[item.statusColor];

              return (
                <motion.div
                  key={item.id}
                  variants={fadeInUp}
                  custom={i * 0.15}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  onClick={() => navigate(item.route)}
                  className="group relative cursor-pointer py-12 md:py-16 hover:py-16 md:hover:py-22 transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] border-b border-white/[0.08]"
                >
                  {/* Hover background ambient subtle shift */}
                  <div className="absolute inset-0 bg-[#081320]/0 group-hover:bg-[#071322]/60 transition-all duration-600 rounded-sm -mx-4 px-4 pointer-events-none" />

                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    
                    {/* Left: Section Number + Headline & Description */}
                    <div className="space-y-4 max-w-3xl">
                      <div className="flex items-center gap-4">
                        <span className="text-xs md:text-sm font-tech text-[#38bdf8] font-semibold tracking-widest">
                          {item.num}
                        </span>
                        <div className="h-px w-8 bg-cyan-500/30 group-hover:w-16 group-hover:bg-[#38bdf8] transition-all duration-500" />
                        <span className="text-xs font-tech tracking-[0.22em] text-slate-400 group-hover:text-slate-200 uppercase transition-colors">
                          {item.sub}
                        </span>
                        <span className={`ml-auto lg:ml-2 text-[8px] font-tech px-2.5 py-1 rounded-sm border uppercase tracking-widest ${statusClasses}`}>
                          {item.status}
                        </span>
                      </div>

                      {/* Main Title — Syne Wide Headline */}
                      <h3 className="font-display font-extrabold uppercase text-white tracking-tight leading-[0.98] text-[clamp(2.2rem,5vw,4.5rem)] group-hover:text-cyan-100 group-hover:translate-x-2 transition-all duration-500">
                        {item.title}
                      </h3>

                      {/* Description */}
                      <p className="text-slate-400 group-hover:text-slate-200 text-sm md:text-base font-body leading-relaxed max-w-2xl group-hover:translate-x-2 transition-all duration-500 delay-75">
                        {item.body}
                      </p>
                    </div>

                    {/* Right: CTA Arrow */}
                    <div className="lg:shrink-0 flex items-center gap-3 text-xs font-tech tracking-[0.2em] text-slate-500 group-hover:text-[#38bdf8] uppercase transition-all duration-500 pt-2 lg:pt-0">
                      <span className="font-medium group-hover:translate-x-1 transition-transform">EXPLORE MODULE</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-3 transition-transform duration-500 text-cyan-400" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CINEMATIC INTERLUDE — second video section
      ════════════════════════════════════════ */}
      <section className="relative h-[55vh] overflow-hidden">
        <video
          src="/videos/15642495_3840_2160_60fps.mp4"
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050d17] via-black/50 to-[#050d17]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050d17] via-transparent to-[#050d17]" />

        <div className="relative z-10 h-full flex items-center px-6 md:px-16">
          <div className="max-w-6xl mx-auto">
            <p className="text-[11px] font-tech tracking-[0.25em] text-[#38bdf8] uppercase mb-3">
              Interactive Map Engine
            </p>
            <h2 className="font-display font-bold text-white uppercase text-3xl md:text-5xl leading-tight tracking-tight max-w-xl">
              The Map is<br />the Instrument
            </h2>
            <p className="text-slate-300/80 text-sm md:text-base mt-4 max-w-lg leading-relaxed font-body font-light">
              All intelligence layers — sea ice, icebergs, routes, stations — converge on a single interactive Antarctic GIS map console.
            </p>
            <button
              onClick={() => navigate('/map')}
              className="mt-8 group flex items-center gap-2.5 px-6 py-3.5 bg-[#38bdf8]/15 hover:bg-[#38bdf8]/25 border border-[#38bdf8]/50 text-cyan-200 text-xs font-tech tracking-[0.2em] uppercase rounded-sm transition-all cursor-pointer backdrop-blur-md"
            >
              LAUNCH MAP CONSOLE
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════ */}
      <footer className="px-6 md:px-14 py-8 border-t border-white/[0.07] flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-tech text-slate-600 tracking-wider">
        <span>POLARNAV AI · NCPOR / MOES · SIH 2026</span>
        <span>BHARATI STATION · MAITRI STATION · ROSS ICE SHELF</span>
      </footer>
    </div>
  );
}
