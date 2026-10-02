import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingLayersControl({
  layers,
  onToggleLayer,
  baseLayer = 'satellite',
  setBaseLayer
}) {
  const [isOpen, setIsOpen] = useState(false);

  const layerItems = [
    { key: 'vessel', label: 'Vessel (ORV Sagar Nidhi)', tag: 'LIVE' },
    { key: 'stations', label: 'Research Stations', tag: 'REAL CSV' },
    { key: 'seaIceConcentration', label: 'Sea Ice Concentration', tag: 'DEMO' },
    { key: 'icebergs', label: 'Iceberg Locations', tag: 'DEMO' },
    { key: 'recommendedRoute', label: 'Recommended Route', tag: 'DEMO' },
    { key: 'riskZones', label: 'Ice Hazard Risk Zones', tag: 'DEMO' },
  ];

  const basemaps = [
    { id: 'satellite', label: 'SATELLITE' },
    { id: 'ocean', label: 'OCEAN' },
    { id: 'topo', label: 'TOPO' }
  ];

  return (
    <div className="relative select-none font-tech">
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 h-9 px-3.5 bg-[#0B1520]/95 hover:bg-[#0E1B29] text-[#F2F4F5] border border-white/10 hover:border-[#38bdf8]/50 rounded-sm backdrop-blur-md transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-xl cursor-pointer"
        title="Toggle Map Layers & Basemaps"
      >
        <span className="text-xs text-[#38bdf8] leading-none">☷</span>
        <span className="text-[10px] tracking-[0.16em] uppercase font-medium">LAYERS & BASEMAPS</span>
      </button>

      {/* Popover Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mt-2.5 w-76 bg-[#071320]/96 backdrop-blur-md border border-white/10 rounded-sm p-4 shadow-2xl space-y-4 z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <span className="text-[10px] tracking-[0.2em] uppercase text-[#82909B] font-medium">
                MAP LAYER CONTROL
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs text-[#82909B] hover:text-[#F2F4F5] transition-colors leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Basemap Switcher */}
            {setBaseLayer && (
              <div>
                <label className="text-[9px] uppercase tracking-widest text-[#82909B] block mb-1.5">
                  BASEMAP TYPE
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {basemaps.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setBaseLayer(b.id)}
                      className={`py-1 text-[9px] tracking-wider rounded-sm transition-colors border cursor-pointer ${
                        baseLayer === b.id
                          ? 'bg-[#38bdf8]/20 border-[#38bdf8] text-[#F2F4F5] font-semibold'
                          : 'border-white/[0.06] text-[#82909B] hover:text-[#F2F4F5]'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Layer Toggles */}
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest text-[#82909B] block mb-1">
                OVERLAY LAYERS
              </label>
              {layerItems.map((item) => {
                const isActive = layers[item.key];
                return (
                  <button
                    key={item.key}
                    onClick={() => onToggleLayer(item.key)}
                    className="w-full flex items-center justify-between py-1 text-left group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] tracking-wider transition-colors ${
                          isActive ? 'text-[#F2F4F5] font-medium' : 'text-[#82909B] group-hover:text-[#F2F4F5]'
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border uppercase ${
                        item.tag === 'LIVE' || item.tag === 'REAL CSV'
                          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-950/40 text-amber-300 border-amber-500/30'
                      }`}>
                        {item.tag}
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${
                          isActive
                            ? 'bg-[#38bdf8] shadow-[0_0_8px_#38bdf8]'
                            : 'bg-white/20 group-hover:bg-white/40'
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
