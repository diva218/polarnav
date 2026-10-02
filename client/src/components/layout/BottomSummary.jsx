import React from 'react';

export default function BottomSummary({
  vessel,
  routes,
  selectedRouteType = 'recommended',
  onSelectRoute
}) {
  if (!vessel || !routes?.recommended) return null;

  const activeRoute = selectedRouteType === 'recommended' ? routes.recommended : routes.alternative;

  return (
    <footer className="h-[44px] bg-[#071018] border-t border-white/[0.07] px-6 flex items-center justify-between z-20 shrink-0 select-none font-mono text-xs text-[#82909B]">
      {/* Route Path Indicator */}
      <div className="flex items-center gap-2 text-[#F2F4F5]">
        <span className="font-semibold tracking-wider">{vessel.name}</span>
        <span className="text-[#38bdf8] text-xs">→</span>
        <span className="text-[#F2F4F5] tracking-wider">{vessel.destination || 'BHARATI STATION'}</span>
      </div>

      {/* Summary Metrics */}
      <div className="flex items-center gap-4 text-[11px]">
        <span className="text-[#F2F4F5]">
          {activeRoute.totalDistanceNM} NM
        </span>
        <span className="text-white/20">•</span>
        <span className="text-[#38bdf8]">
          {activeRoute.estimatedTimeHours} H
        </span>
        <span className="text-white/20">•</span>
        <span className="text-emerald-400 uppercase tracking-wider">
          {activeRoute.riskCategory || 'LOW RISK'}
        </span>
      </div>
    </footer>
  );
}
