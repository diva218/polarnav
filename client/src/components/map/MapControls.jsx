import React from 'react';
import { useMap } from 'react-leaflet';
import { Plus, Minus, RotateCcw } from 'lucide-react';

export default function MapControls({ onResetAntarctica }) {
  const map = useMap();

  return (
    <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-1.5 select-none font-mono">
      <button
        onClick={() => map.zoomIn()}
        title="Zoom In"
        className="w-8 h-8 rounded-sm bg-[#0B1520]/90 hover:bg-[#0E1B29] text-[#F2F4F5] border border-white/10 flex items-center justify-center backdrop-blur-md transition-colors shadow-lg"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => map.zoomOut()}
        title="Zoom Out"
        className="w-8 h-8 rounded-sm bg-[#0B1520]/90 hover:bg-[#0E1B29] text-[#F2F4F5] border border-white/10 flex items-center justify-center backdrop-blur-md transition-colors shadow-lg"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onResetAntarctica}
        title="Reset to Antarctic Overview"
        className="w-8 h-8 rounded-sm bg-[#0B1520]/90 hover:bg-[#0E1B29] text-[#82909B] hover:text-[#38bdf8] border border-white/10 flex items-center justify-center backdrop-blur-md transition-colors shadow-lg"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
