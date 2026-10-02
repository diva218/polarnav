import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Crosshair, Navigation } from 'lucide-react';
import { formatCoordinates } from '../../utils/formatters';

export default function LocationInfoPanel({
  selectedObject,
  onClose,
  onZoomTo,
  onSetDestination
}) {
  if (!selectedObject) return null;

  const { type, data } = selectedObject;

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="absolute top-0 right-0 bottom-0 z-[1001] w-80 max-w-[320px] bg-[#0B1520]/95 backdrop-blur-md border-l border-white/[0.08] p-6 flex flex-col justify-between select-none font-sans shadow-2xl overflow-y-auto"
      >
        <div className="space-y-6">
          {/* Header Tag + Close Icon */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-[0.25em] uppercase font-mono text-[#82909B]">
              {type === 'station'
                ? 'ANTARCTIC FACILITY'
                : type === 'vessel'
                ? 'RESEARCH VESSEL'
                : type === 'iceberg'
                ? 'ICE HAZARD'
                : type === 'route'
                ? 'NAVIGATION ROUTE'
                : 'COORDINATE'}
            </span>
            <button
              onClick={onClose}
              className="text-xs text-[#82909B] hover:text-[#F2F4F5] transition-colors p-1 leading-none"
              title="Close Panel"
            >
              ✕
            </button>
          </div>

          <div className="h-[1px] bg-white/[0.08]" />

          {/* 1. STATION / FACILITY INTELLIGENCE */}
          {type === 'station' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold font-display text-[#F2F4F5] tracking-tight">
                  {data.name}
                </h2>
                {data.officialName && data.officialName !== data.name && (
                  <p className="text-xs text-[#82909B] mt-0.5 font-sans italic">
                    {data.officialName}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-mono text-[#38bdf8] uppercase tracking-wider font-semibold">
                    {data.country || data.operatorPrimary}
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="text-xs font-mono text-[#82909B]">
                    {data.type || 'Station'}
                  </span>
                </div>
              </div>

              {/* Status & Seasonality Badges */}
              <div className="flex items-center gap-2 font-mono text-[10px]">
                {data.seasonality && (
                  <span className="px-2 py-0.5 rounded-sm bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/30 uppercase">
                    {data.seasonality}
                  </span>
                )}
                {data.status && (
                  <span
                    className={`px-2 py-0.5 rounded-sm border uppercase ${
                      data.status.toLowerCase().includes('open')
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-950/40 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {data.status}
                  </span>
                )}
              </div>

              {/* Coordinates */}
              <div>
                <div className="text-[10px] uppercase tracking-widest text-[#82909B] font-mono">
                  Location
                </div>
                <div className="text-sm font-mono text-[#F2F4F5] mt-1 space-y-0.5">
                  <div>
                    {formatCoordinates(data.coordinates?.[0] || data.latitude, data.coordinates?.[1] || data.longitude)}
                  </div>
                  {(data.latitudeDDM || data.longitudeDDM) && (
                    <div className="text-[10px] text-[#82909B]">
                      {data.latitudeDDM} {data.longitudeDDM}
                    </div>
                  )}
                  {data.region && (
                    <div className="text-[10px] text-[#38bdf8]">
                      Region: {data.region}
                    </div>
                  )}
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="grid grid-cols-2 gap-3 font-mono text-xs pt-1 border-t border-white/[0.06]">
                {data.elevation !== null && data.elevation !== undefined && (
                  <div>
                    <div className="text-[9px] uppercase tracking-widest text-[#82909B]">Elevation</div>
                    <div className="text-xs font-medium text-[#F2F4F5] mt-0.5">
                      {data.elevation} m {data.elevationDatum ? `(${data.elevationDatum})` : ''}
                    </div>
                  </div>
                )}
                {data.peakPopulation !== null && data.peakPopulation !== undefined && (
                  <div>
                    <div className="text-[9px] uppercase tracking-widest text-[#82909B]">Peak Population</div>
                    <div className="text-xs font-medium text-[#F2F4F5] mt-0.5">
                      {data.peakPopulation} persons
                    </div>
                  </div>
                )}
                {data.yearEstablished && (
                  <div>
                    <div className="text-[9px] uppercase tracking-widest text-[#82909B]">Established</div>
                    <div className="text-xs font-medium text-[#F2F4F5] mt-0.5">
                      {data.yearEstablished}
                    </div>
                  </div>
                )}
                {data.powerSupply && (
                  <div>
                    <div className="text-[9px] uppercase tracking-widest text-[#82909B]">Power Supply</div>
                    <div className="text-xs font-medium text-[#F2F4F5] mt-0.5 truncate" title={data.powerSupply}>
                      {data.powerSupply}
                    </div>
                  </div>
                )}
              </div>

              {/* Photo / Webcam External Links if present */}
              {(data.photoUrl || data.webcamUrl) && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {data.photoUrl && (
                    <a
                      href={data.photoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-mono text-[#38bdf8] hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" /> Photo Source
                    </a>
                  )}
                  {data.webcamUrl && (
                    <a
                      href={data.webcamUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" /> Live Webcam
                    </a>
                  )}
                </div>
              )}

              {/* Actions: Zoom to Station */}
              <div className="pt-2 space-y-2">
                {onZoomTo && (
                  <button
                    onClick={() => onZoomTo(data.coordinates || [data.latitude, data.longitude])}
                    className="w-full flex items-center justify-center gap-2 py-1.5 bg-[#122234] hover:bg-[#182e46] text-[#38bdf8] border border-[#38bdf8]/30 rounded-sm text-xs font-mono uppercase tracking-wider transition-colors"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    Zoom To Facility
                  </button>
                )}
                {onSetDestination && (
                  <button
                    onClick={() => onSetDestination(data)}
                    className="w-full flex items-center justify-center gap-2 py-1.5 bg-transparent hover:bg-white/5 text-[#82909B] hover:text-[#F2F4F5] border border-white/10 rounded-sm text-[11px] font-mono uppercase tracking-wider transition-colors"
                  >
                    <Navigation className="w-3 h-3 text-[#38bdf8]" />
                    Set Nav Target
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 2. VESSEL */}
          {type === 'vessel' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold font-display text-[#F2F4F5] tracking-tight">
                  {data.name}
                </h2>
                <p className="text-xs text-[#82909B] mt-1 font-mono">
                  {data.iceClass || 'Research vessel'}
                </p>
              </div>

              <div className="space-y-1 font-mono text-sm">
                <div className="text-[#F2F4F5]">
                  {formatCoordinates(data.coordinates?.[0] || data.latitude, data.coordinates?.[1] || data.longitude)}
                </div>
                <div className="text-[#38bdf8] font-medium">
                  {data.speedKnots} KT • HDG {data.heading}°
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-[#82909B] font-mono">
                  Destination
                </div>
                <div className="text-sm font-medium text-[#F2F4F5] mt-1">
                  {data.destination || 'BHARATI STATION'}
                </div>
              </div>
            </div>
          )}

          {/* 3. ICEBERG */}
          {type === 'iceberg' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold font-display text-[#F2F4F5] tracking-tight">
                  {data.id}
                </h2>
                <p className="text-xs text-[#82909B] mt-1 font-mono">
                  {data.type || 'Tabular Iceberg'}
                </p>
              </div>

              <div className="space-y-1 font-mono text-sm text-[#F2F4F5]">
                <div>{formatCoordinates(data.latitude || data.coordinates?.[0], data.longitude || data.coordinates?.[1])}</div>
                <div className="text-xs text-[#82909B]">
                  Observed {data.lastObserved || '2h ago'}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-[#82909B] font-mono">
                  Risk Assessment
                </div>
                <div className="text-sm font-medium text-[#F2F4F5] mt-1 flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      data.riskScore === 'CRITICAL' || data.riskScore === 'EXTREME'
                        ? 'bg-rose-500'
                        : data.riskScore === 'HIGH'
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                  <span>{data.riskScore || 'Moderate'} Risk</span>
                </div>
              </div>

              {data.lengthKm && (
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[#82909B] font-mono">
                    Dimensions
                  </div>
                  <div className="text-xs font-mono text-[#F2F4F5] mt-1">
                    {data.lengthKm} × {data.widthKm} km
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. ROUTE */}
          {type === 'route' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold font-display text-[#F2F4F5] tracking-tight">
                  {data.name || 'RECOMMENDED ROUTE'}
                </h2>
                <p className="text-xs text-[#82909B] mt-1 font-mono">
                  {data.isRecommended ? 'AI Optimal Polar Path' : 'Direct Corridor'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 font-mono">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[#82909B]">Distance</div>
                  <div className="text-sm font-medium text-[#F2F4F5] mt-0.5">{data.totalDistanceNM} NM</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[#82909B]">Est. Time</div>
                  <div className="text-sm font-medium text-[#38bdf8] mt-0.5">{data.estimatedTimeHours} H</div>
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-[#82909B] font-mono">
                  Ice Risk Level
                </div>
                <div className="text-sm font-medium text-[#F2F4F5] mt-1">
                  {data.riskCategory ? data.riskCategory.toUpperCase() : 'LOW RISK'}
                </div>
              </div>

              {data.estimatedFuelMT && (
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[#82909B] font-mono">
                    Fuel Consumption
                  </div>
                  <div className="text-xs font-mono text-[#82909B] mt-1">
                    {data.estimatedFuelMT} MT
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. COORDINATE PROBE */}
          {type === 'coordinate' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold font-display text-[#F2F4F5] tracking-tight">
                  PROBED SECTOR
                </h2>
                <p className="text-xs text-[#82909B] mt-1 font-mono">
                  {data.name || 'Antarctic Waters'}
                </p>
              </div>

              <div className="font-mono text-sm text-[#F2F4F5]">
                {formatCoordinates(data.coordinates?.[0] || data.latitude, data.coordinates?.[1] || data.longitude)}
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between text-[#82909B]">
                  <span>Sea Ice:</span>
                  <span className="text-[#F2F4F5]">{data.seaIceConcentration || 0}%</span>
                </div>
                <div className="flex justify-between text-[#82909B]">
                  <span>Temperature:</span>
                  <span className="text-[#F2F4F5]">{data.temperature || -10}°C</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Minimal Clean Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 mt-6 bg-transparent hover:bg-white/5 border border-white/10 text-xs font-mono uppercase tracking-[0.16em] text-[#82909B] hover:text-[#F2F4F5] rounded-sm transition-colors"
        >
          Close
        </button>
      </motion.aside>
    </AnimatePresence>
  );
}
