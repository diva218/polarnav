import React from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';

export default function IcebergMarker({ iceberg, isSelected, onSelect }) {
  if (!iceberg?.coordinates) return null;

  const isCritical = iceberg.riskScore === 'CRITICAL' || iceberg.riskScore === 'EXTREME';

  const icebergIcon = L.divIcon({
    className: 'minimal-iceberg-marker',
    html: `
      <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-150 hover:scale-125" style="width: 20px; height: 20px;">
        ${isCritical ? '<div class="absolute w-6 h-6 rounded-full border border-rose-500/30 pulse-ring pointer-events-none"></div>' : ''}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="${isCritical ? '#ef4444' : '#F2F4F5'}" stroke="${isSelected ? '#00e5ff' : 'none'}" stroke-width="${isSelected ? '2' : '0'}" class="relative z-10">
          <polygon points="12,2 22,12 12,22 2,12" />
        </svg>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  return (
    <Marker
      position={iceberg.coordinates}
      icon={icebergIcon}
      eventHandlers={{
        click: () => onSelect && onSelect(iceberg)
      }}
    >
      <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
        <div className="p-1 font-mono text-center select-none">
          <span className="font-semibold text-xs text-[#F2F4F5] tracking-wider">
            {iceberg.id}
          </span>
          <div className="text-[9px] text-[#82909B] mt-0.5">
            {iceberg.type} • {iceberg.riskScore || 'Observed'}
          </div>
        </div>
      </Tooltip>
    </Marker>
  );
}
