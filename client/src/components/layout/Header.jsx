import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUtcClock } from '../../hooks/useUtcClock';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const { utcIso } = useUtcClock();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const utcDisplay = utcIso ? utcIso.slice(0, 5) + ' UTC' : '––:–– UTC';

  const navLinks = [
    { label: 'HOME',     path: '/' },
    { label: 'MAP',      path: '/map' },
    { label: 'SEA ICE',  path: '/sea-ice' },
    { label: 'ICEBERGS', path: '/icebergs' },
    { label: 'ROUTES',   path: '/routes' },
    { label: 'WEATHER',  path: '/weather' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path;
  };

  return (
    <header className="h-[58px] bg-[#050d17]/96 backdrop-blur-md border-b border-white/[0.07] px-5 flex items-center justify-between z-[500] shrink-0 select-none sticky top-0">

      {/* Left: Logo */}
      <Link to="/" className="flex items-center gap-1.5 group shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="3 11 22 2 13 21 11 13 3 11"/>
        </svg>
        <span className="text-[13px] font-bold tracking-[0.18em] text-white font-display">POLARNAV</span>
        <span className="text-[9px] text-cyan-400 font-tech tracking-widest bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-500/30">AI</span>
      </Link>

      {/* Center: Desktop Nav */}
      <nav className="hidden md:flex items-center gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`relative px-3 py-1.5 text-[10.5px] tracking-[0.17em] uppercase font-tech transition-colors duration-200 rounded-sm ${
              isActive(link.path)
                ? 'text-white'
                : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            {link.label}
            {isActive(link.path) && (
              <span className="absolute bottom-0 left-3 right-3 h-[1.5px] bg-cyan-400 rounded-full" />
            )}
          </Link>
        ))}
      </nav>

      {/* Right: UTC + Mobile toggle */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 font-tech text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-slate-400 tabular-nums">{utcDisplay}</span>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-1.5 text-slate-400 hover:text-white transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="absolute top-[58px] left-0 right-0 bg-[#050d17]/98 border-b border-white/[0.07] md:hidden z-[600]">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={`block px-5 py-3 text-[11px] tracking-[0.18em] uppercase font-tech border-b border-white/[0.05] transition-colors ${
                isActive(link.path)
                  ? 'text-cyan-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
