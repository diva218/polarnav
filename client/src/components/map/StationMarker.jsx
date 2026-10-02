import React from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';

export default function StationMarker({ station, isSelected, onSelect }) {
  if (!station?.coordinates) return null;

  const isIndian = station.operatorPrimary === 'India';
  const isYearRound = station.isYearRound;
  const isStation = station.isResearchStation;

  // Scientific GIS symbology:
  // Year-Round Station: Solid core marker
  // Seasonal Station: Outlined ring marker
  // Secondary Facility (Camp/Refuge/Depot): Subtle smaller dot
  let markerHtml = '';

  if (isStation) {
    if (isYearRound) {
      // Solid marker
      markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="width: 24px; height: 24px;">
          <div class="w-3.5 h-3.5 rounded-sm ${
            isSelected 
              ? 'bg-[#38bdf8] ring-2 ring-white shadow-[0_0_8px_#38bdf8]' 
              : isIndian
              ? 'bg-[#38bdf8] border border-white/80 shadow'
              : 'bg-[#F2F4F5] border border-black/40 shadow'
          } flex items-center justify-center transition-transform group-hover:scale-125">
            <div class="w-1 h-1 bg-[#071018] rounded-full"></div>
          </div>
        </div>
      `;
    } else {
      // Seasonal outlined marker
      markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="width: 24px; height: 24px;">
          <div class="w-3.5 h-3.5 rounded-sm bg-[#0B1520] ${
            isSelected 
              ? 'border-2 border-[#38bdf8] ring-1 ring-white shadow-[0_0_8px_#38bdf8]' 
              : isIndian
              ? 'border-2 border-[#38bdf8]'
              : 'border border-[#82909B]'
          } flex items-center justify-center transition-transform group-hover:scale-125">
            <div class="w-1 h-1 ${isIndian ? 'bg-[#38bdf8]' : 'bg-[#82909B]'} rounded-full"></div>
          </div>
        </div>
      `;
    }
  } else {
    // Secondary facility (Camp / Refuge / Depot / Laboratory)
    markerHtml = `
      <div class="relative flex items-center justify-center cursor-pointer group" style="width: 20px; height: 20px;">
        <div class="w-2.5 h-2.5 rotate-45 ${
          isSelected 
            ? 'bg-[#38bdf8] ring-2 ring-white' 
            : 'bg-[#0B1520] border border-[#82909B]/70'
        } transition-transform group-hover:scale-125"></div>
      </div>
    `;
  }

  const stationIcon = L.divIcon({
    className: 'scientific-station-marker',
    html: markerHtml,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  return (
    <Marker
      position={station.coordinates}
      icon={stationIcon}
      eventHandlers={{
        click: () => onSelect && onSelect(station)
      }}
    >
      <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
        <div className="p-1 font-mono select-none text-center max-w-[200px]">
          <div className="font-semibold text-xs text-[#F2F4F5] truncate">
            {station.name}
          </div>
          <div className="text-[10px] text-[#82909B] mt-0.5 truncate">
            {station.operatorPrimary || station.country}
            {station.type ? ` • ${station.type}` : ''}
          </div>
          {station.seasonality && (
            <div className="text-[9px] text-[#38bdf8] mt-0.5 uppercase tracking-wider">
              {station.seasonality} {station.status ? `(${station.status})` : ''}
            </div>
          )}
        </div>
      </Tooltip>
    </Marker>
  );
}
