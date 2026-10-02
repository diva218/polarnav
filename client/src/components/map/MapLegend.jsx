import React from 'react';

export default function MapLegend() {
  return (
    <div className="absolute bottom-4 left-6 z-[1000] bg-[#071018]/80 backdrop-blur-sm border border-white/[0.08] px-3 py-1.5 rounded-sm font-mono text-[10px] text-[#82909B] select-none pointer-events-none">
      <div className="flex items-center gap-3">
        <span className="tracking-widest uppercase text-[9px] text-[#F2F4F5] font-medium">SEA ICE</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px]">0</span>
          <div className="w-16 h-[3px] rounded-full bg-gradient-to-r from-transparent via-[#38bdf8]/40 to-[#38bdf8]" />
          <span className="text-[9px]">100%</span>
        </div>
      </div>
    </div>
  );
}
