import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import {
  AlertTriangle, ArrowRight, Layers, TrendingUp,
  Navigation2, Wind, MapPin, TriangleAlert,
  Compass, Info
} from 'lucide-react';
import {
  DEMO_ICEBERGS,
  DEMO_RECOMMENDED_ROUTE,
  DEMO_ALTERNATIVE_ROUTE,
  DEMO_VESSEL,
} from '../data/antarcticDemoData';

/* ── Shared fade-in animation ── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }
  }),
};

/* ── Shared "not connected" banner ── */
function DataNotice({ label, detail }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-amber-950/20 border border-amber-500/25 rounded-sm text-xs font-tech">
      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
      <div>
        <span className="text-amber-300 font-semibold uppercase tracking-wider">{label} — </span>
        <span className="text-slate-400">{detail}</span>
      </div>
    </div>
  );
}

/* ── Shared field row ── */
function Field({ label, value, accent }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9.5px] font-tech tracking-widest text-slate-600 uppercase">{label}</span>
      <span className={`text-sm font-tech font-semibold ${accent || 'text-white'}`}>{value}</span>
    </div>
  );
}

/* ── Risk badge ── */
function RiskBadge({ level }) {
  const map = {
    EXTREME:  'bg-rose-950/50 text-rose-300 border-rose-500/40',
    CRITICAL: 'bg-rose-950/50 text-rose-300 border-rose-500/40',
    HIGH:     'bg-amber-950/50 text-amber-300 border-amber-500/40',
    MODERATE: 'bg-yellow-950/50 text-yellow-300 border-yellow-500/40',
    LOW:      'bg-emerald-950/50 text-emerald-300 border-emerald-500/40',
  };
  return (
    <span className={`text-[8px] font-tech px-2 py-0.5 rounded border uppercase tracking-widest ${map[level] || map.LOW}`}>
      {level}
    </span>
  );
}

/* ══════════════════════════════════════
   SEA ICE MODULE
══════════════════════════════════════ */
function SeaIceModule() {
  const navigate = useNavigate();

  const sectors = [
    { name: 'Prydz Bay Corridor', sic: '18%', class: 'Open Water / Light Ice', color: 'text-emerald-400' },
    { name: 'Ross Sea Approach',  sic: '64%', class: 'Consolidated Drift Ice', color: 'text-amber-400' },
    { name: 'Central Weddell Pack', sic: '84%', class: 'Compressive Pack Ice', color: 'text-rose-400' },
  ];

  const forecast = [
    { day: 'Day +1', change: '−2%', trend: 'Melting edge advance' },
    { day: 'Day +2', change: '+5%', trend: 'Thermal re-freeze overnight' },
    { day: 'Day +3', change: '+3%', trend: 'Consolidation expected' },
    { day: 'Day +4', change: '−1%', trend: 'Marginal lead opening' },
    { day: 'Day +5', change: '+4%', trend: 'Pack ice surge' },
  ];

  return (
    <div className="space-y-10">
      {/* Page header */}
      <div>
        <p className="text-[9.5px] font-tech tracking-[0.25em] text-cyan-500 uppercase mb-2">Module — Sea Ice</p>
        <h1 className="font-display text-3xl md:text-5xl font-black uppercase text-white tracking-tight">
          Concentration<br />Analysis
        </h1>
        <p className="text-slate-500 text-sm mt-3 max-w-2xl leading-relaxed font-body">
          Passive microwave sea-ice concentration (SIC) grids identify navigable leads, pack-ice corridors and impassable sectors across the Southern Ocean.
        </p>
      </div>

      {/* Data notice */}
      <DataNotice
        label="DEMO DATA"
        detail="NSIDC/AMSR-2 real-time SIC grid integration is not yet connected. Values shown below are illustrative demo data for evaluation purposes."
      />

      {/* Color legend */}
      <div className="p-5 bg-[#0a1825]/70 border border-white/[0.07] rounded-sm space-y-3">
        <p className="text-[9px] font-tech text-slate-500 uppercase tracking-widest">Sea Ice Concentration Scale</p>
        <div className="h-3 rounded-sm w-full bg-gradient-to-r from-sky-900 via-cyan-500 via-amber-500 to-rose-600 border border-white/[0.08]" />
        <div className="flex items-center justify-between text-[9px] font-tech text-slate-500 uppercase">
          <span>0% — Open Water</span>
          <span>25% — Light Ice</span>
          <span>50% — Pack Ice</span>
          <span>75% — Dense Pack</span>
          <span>100% — Multi-Year</span>
        </div>
      </div>

      {/* Sector breakdown */}
      <div>
        <h2 className="text-[10px] font-tech text-slate-500 uppercase tracking-widest mb-4">Sector Status — DEMO</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sectors.map((s) => (
            <div key={s.name} className="p-5 bg-[#0a1825]/70 border border-white/[0.07] rounded-sm space-y-2">
              <p className="text-[9px] font-tech text-slate-500 uppercase tracking-wider">{s.name}</p>
              <p className={`text-3xl font-tech font-bold ${s.color}`}>{s.sic}</p>
              <p className="text-[11px] text-slate-500 font-body">{s.class}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5-day forecast table */}
      <div>
        <h2 className="text-[10px] font-tech text-slate-500 uppercase tracking-widest mb-4">5-Day Forecast Trend — DEMO</h2>
        <div className="border border-white/[0.07] rounded-sm overflow-hidden">
          <table className="w-full text-left font-tech text-xs">
            <thead className="bg-[#0a1825]/90 border-b border-white/[0.07]">
              <tr>
                <th className="px-5 py-3 text-[9px] text-slate-500 uppercase tracking-widest">Period</th>
                <th className="px-5 py-3 text-[9px] text-slate-500 uppercase tracking-widest">Avg SIC Change</th>
                <th className="px-5 py-3 text-[9px] text-slate-500 uppercase tracking-widest">Condition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {forecast.map((f) => (
                <tr key={f.day} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-5 py-3 text-slate-300 font-semibold">{f.day}</td>
                  <td className="px-5 py-3">
                    <span className={f.change.startsWith('+') ? 'text-rose-400' : 'text-emerald-400'}>{f.change}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{f.trend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[9px] font-tech text-slate-700 mt-2">Model not connected — illustrative values only</p>
      </div>

      {/* CTA */}
      <button
        onClick={() => navigate('/map')}
        className="group flex items-center gap-2 px-5 py-2.5 border border-cyan-500/40 text-cyan-400 text-xs font-tech tracking-[0.15em] uppercase rounded-sm hover:bg-cyan-950/40 transition-all cursor-pointer"
      >
        View Sea Ice Layer on Map
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}

/* ══════════════════════════════════════
   ICEBERGS MODULE
══════════════════════════════════════ */
function IcebergsModule() {
  const navigate = useNavigate();
  const [horizon, setHorizon] = useState('Current');

  return (
    <div className="space-y-10">
      {/* Page header */}
      <div>
        <p className="text-[9.5px] font-tech tracking-[0.25em] text-cyan-500 uppercase mb-2">Module — Icebergs</p>
        <h1 className="font-display text-3xl md:text-5xl font-black uppercase text-white tracking-tight">
          Detection &<br />Drift Tracking
        </h1>
        <p className="text-slate-500 text-sm mt-3 max-w-2xl leading-relaxed font-body">
          Tabular icebergs and bergy bits detected from Sentinel-1 C-band SAR imagery. Drift vectors are computed from observed AIS/SAR displacements.
        </p>
      </div>

      <DataNotice
        label="DEMO DATA"
        detail="Sentinel-1 SAR live detection pipeline and trajectory prediction model are not yet connected. Catalogue below is illustrative demo data."
      />

      {/* Horizon selector */}
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-tech text-slate-600 uppercase tracking-widest mr-2">Forecast Horizon:</span>
        {['Current', '+24 h', '+48 h', '+72 h'].map((h) => (
          <button
            key={h}
            onClick={() => setHorizon(h)}
            className={`px-3 py-1.5 text-[9px] font-tech tracking-wider rounded-sm border uppercase transition-colors cursor-pointer ${
              horizon === h
                ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300 font-semibold'
                : 'border-white/[0.08] text-slate-600 hover:text-slate-300'
            }`}
          >
            {h}
          </button>
        ))}
        {horizon !== 'Current' && (
          <span className="ml-2 text-[8px] font-tech text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded-sm uppercase">
            Model not connected
          </span>
        )}
      </div>

      {/* Iceberg catalogue table */}
      <div>
        <h2 className="text-[10px] font-tech text-slate-500 uppercase tracking-widest mb-4">
          Iceberg Catalogue — {DEMO_ICEBERGS.length} Targets — DEMO
        </h2>
        <div className="border border-white/[0.07] rounded-sm overflow-x-auto">
          <table className="w-full text-left font-tech text-xs min-w-[680px]">
            <thead className="bg-[#0a1825]/90 border-b border-white/[0.07]">
              <tr>
                {['ID', 'Type', 'Position', 'Size (km)', 'Drift', 'Risk'].map((h) => (
                  <th key={h} className="px-4 py-3 text-[9px] text-slate-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {DEMO_ICEBERGS.map((ib) => (
                <tr key={ib.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-4 py-3 text-white font-semibold">{ib.id}</td>
                  <td className="px-4 py-3 text-slate-400">{ib.type}</td>
                  <td className="px-4 py-3 text-slate-300 tabular-nums">
                    {Math.abs(ib.latitude).toFixed(2)}°S {ib.longitude.toFixed(2)}°E
                  </td>
                  <td className="px-4 py-3 text-slate-300">{ib.lengthKm} × {ib.widthKm}</td>
                  <td className="px-4 py-3 text-cyan-400">{ib.driftSpeedKnots} kt · {ib.driftHeading}°</td>
                  <td className="px-4 py-3"><RiskBadge level={ib.riskScore} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 text-[9px] font-tech text-slate-600 uppercase">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-900/60 border border-emerald-500/30" /> Observed drift</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-cyan-900/60 border border-cyan-500/30 opacity-50" /> Predicted (model required)</span>
        </div>
      </div>

      <button
        onClick={() => navigate('/map')}
        className="group flex items-center gap-2 px-5 py-2.5 border border-cyan-500/40 text-cyan-400 text-xs font-tech tracking-[0.15em] uppercase rounded-sm hover:bg-cyan-950/40 transition-all cursor-pointer"
      >
        Inspect Icebergs on Map
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}

/* ══════════════════════════════════════
   ROUTES MODULE
══════════════════════════════════════ */
function RoutesModule() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState('balanced');
  const [destination, setDestination] = useState('bharati');

  const rec = DEMO_RECOMMENDED_ROUTE;
  const alt = DEMO_ALTERNATIVE_ROUTE;

  return (
    <div className="space-y-10">
      {/* Page header */}
      <div>
        <p className="text-[9.5px] font-tech tracking-[0.25em] text-cyan-500 uppercase mb-2">Module — Routes</p>
        <h1 className="font-display text-3xl md:text-5xl font-black uppercase text-white tracking-tight">
          Route<br />Intelligence
        </h1>
        <p className="text-slate-500 text-sm mt-3 max-w-2xl leading-relaxed font-body">
          Compare navigation route options balancing distance, fuel efficiency, sea-ice resistance, and standoff distance from active iceberg hazards.
        </p>
      </div>

      <DataNotice
        label="ROUTE SOLVER NOT CONNECTED"
        detail="A* / multi-objective route optimization engine is not yet deployed. Routes displayed are illustrative demo waypoint corridors."
      />

      {/* Planning inputs */}
      <div className="p-6 bg-[#0a1825]/70 border border-white/[0.07] rounded-sm space-y-5">
        <h2 className="text-[10px] font-tech text-slate-500 uppercase tracking-widest">Route Parameters</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-tech text-xs">
          {/* Origin */}
          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-600 uppercase tracking-widest block">Origin</label>
            <div className="px-3 py-2.5 bg-[#050d17] border border-white/[0.08] text-slate-300 rounded-sm text-[11px]">
              ORV Sagar Nidhi — Prydz Bay
            </div>
          </div>

          {/* Destination */}
          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-600 uppercase tracking-widest block">Destination</label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#050d17] border border-white/[0.08] text-slate-300 rounded-sm focus:outline-none focus:border-cyan-500/50 text-[11px] cursor-pointer"
            >
              <option value="bharati">Bharati Station (Larsemann Hills)</option>
              <option value="maitri">Maitri Station (Schirmacher Oasis)</option>
              <option value="mcmurdo">McMurdo Station (Ross Island)</option>
            </select>
          </div>

          {/* Optimization profile */}
          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-600 uppercase tracking-widest block">Optimization Profile</label>
            <div className="grid grid-cols-3 gap-1">
              {['safety', 'balanced', 'fuel'].map((p) => (
                <button
                  key={p}
                  onClick={() => setProfile(p)}
                  className={`py-2.5 text-[9px] uppercase rounded-sm border transition-colors cursor-pointer tracking-wider ${
                    profile === p
                      ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300 font-semibold'
                      : 'border-white/[0.08] text-slate-600 hover:text-slate-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Route comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Recommended */}
        <div className="p-6 bg-[#0a1825]/70 border border-cyan-500/30 rounded-sm space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-tech text-cyan-400 uppercase tracking-widest font-semibold">
              Low-Ice Corridor
            </span>
            <span className="text-[8px] font-tech px-2 py-0.5 border border-cyan-500/30 text-cyan-400 bg-cyan-950/40 uppercase rounded-sm">
              Recommended
            </span>
          </div>

          <p className="text-[11px] text-slate-400 font-body leading-relaxed border-l-2 border-cyan-500/30 pl-3">
            {rec.decisionRationale}
          </p>

          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/[0.06]">
            <Field label="Distance" value={`${rec.totalDistanceNM} NM`} />
            <Field label="Est. Time" value={`${rec.estimatedTimeHours} h`} accent="text-cyan-400" />
            <Field label="Fuel Est." value={`${rec.estimatedFuelMT} MT`} />
          </div>
          <p className="text-[8.5px] font-tech text-slate-700">DEMO — values not from a live solver</p>
        </div>

        {/* Alternative */}
        <div className="p-6 bg-[#0a1825]/40 border border-white/[0.07] rounded-sm space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-tech text-amber-400 uppercase tracking-widest font-semibold">
              Direct Rhumb Line
            </span>
            <span className="text-[8px] font-tech px-2 py-0.5 border border-amber-500/30 text-amber-400 bg-amber-950/40 uppercase rounded-sm">
              High Risk
            </span>
          </div>

          <p className="text-[11px] text-slate-500 font-body leading-relaxed border-l-2 border-amber-500/20 pl-3">
            {alt.decisionRationale}
          </p>

          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/[0.06]">
            <Field label="Distance" value={`${alt.totalDistanceNM} NM`} />
            <Field label="Est. Time" value={`${alt.estimatedTimeHours} h`} accent="text-amber-400" />
            <Field label="Fuel Est." value={`${alt.estimatedFuelMT} MT`} />
          </div>
          <p className="text-[8.5px] font-tech text-slate-700">DEMO — values not from a live solver</p>
        </div>
      </div>

      {/* Solver integration note */}
      <div className="p-5 bg-[#0a1825]/50 border border-white/[0.06] rounded-sm">
        <p className="text-[9.5px] font-tech text-slate-500 uppercase tracking-wider mb-2">Future Integration</p>
        <p className="text-[11px] text-slate-600 font-body">
          This interface is architected to accept output from an A* / genetic-algorithm multi-objective route solver via <code className="text-cyan-700 bg-cyan-950/30 px-1 rounded">POST /api/v1/routes/optimize</code>. Once the backend is deployed, the inputs above will drive live route computation.
        </p>
      </div>

      <button
        onClick={() => navigate('/map')}
        className="group flex items-center gap-2 px-5 py-2.5 border border-cyan-500/40 text-cyan-400 text-xs font-tech tracking-[0.15em] uppercase rounded-sm hover:bg-cyan-950/40 transition-all cursor-pointer"
      >
        Visualize Routes on Map
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}

/* ══════════════════════════════════════
   WEATHER MODULE
══════════════════════════════════════ */
function WeatherModule() {
  const navigate = useNavigate();

  const params = [
    { label: '10 m Wind',       value: '—',      unit: '',   note: 'ERA5 / CMEMS not connected', color: 'text-slate-600' },
    { label: 'Wave Height',     value: '—',      unit: '',   note: 'ERA5 not connected',          color: 'text-slate-600' },
    { label: 'Air Temperature', value: '—',      unit: '',   note: 'ERA5 not connected',          color: 'text-slate-600' },
    { label: 'Surface Current', value: '—',      unit: '',   note: 'CMEMS not connected',         color: 'text-slate-600' },
  ];

  return (
    <div className="space-y-10">
      {/* Page header */}
      <div>
        <p className="text-[9.5px] font-tech tracking-[0.25em] text-cyan-500 uppercase mb-2">Module — Weather</p>
        <h1 className="font-display text-3xl md:text-5xl font-black uppercase text-white tracking-tight">
          Environmental<br />Conditions
        </h1>
        <p className="text-slate-500 text-sm mt-3 max-w-2xl leading-relaxed font-body">
          Wind, wave, temperature and ocean current conditions across active Southern Ocean corridors — drawn from ERA5 reanalysis and Copernicus Marine Service when connected.
        </p>
      </div>

      {/* Status — data not connected */}
      <div className="flex items-start gap-3 p-5 bg-slate-900/50 border border-slate-700/40 rounded-sm text-xs font-tech">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <span className="text-slate-400 font-semibold uppercase tracking-wider">Weather API Not Connected — </span>
          <span className="text-slate-600">
            Copernicus Marine Service (CMEMS) and ECMWF ERA5 APIs have not been configured. Add your API credentials to <code className="text-cyan-800 bg-cyan-950/30 px-1 rounded">.env</code> to enable live environmental data.
          </span>
        </div>
      </div>

      {/* Parameter grid — empty state */}
      <div>
        <h2 className="text-[10px] font-tech text-slate-500 uppercase tracking-widest mb-4">
          Environmental Parameters — not connected
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {params.map((p) => (
            <div key={p.label} className="p-5 bg-[#0a1825]/40 border border-white/[0.06] rounded-sm space-y-2 opacity-60">
              <p className="text-[9px] font-tech text-slate-600 uppercase tracking-wider">{p.label}</p>
              <p className="text-2xl font-tech font-bold text-slate-700">{p.value}</p>
              <p className="text-[9px] font-tech text-slate-700">{p.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* What will appear when connected */}
      <div className="p-6 bg-[#0a1825]/60 border border-white/[0.07] rounded-sm space-y-3">
        <p className="text-[10px] font-tech text-slate-500 uppercase tracking-widest">When Data is Connected</p>
        <ul className="space-y-1.5 text-[11px] text-slate-600 font-body list-none">
          {[
            '10 m wind speed and direction vectors',
            'Significant wave height and period',
            'Air temperature and sea-surface temperature (SST)',
            'Surface current speed and heading',
            'Atmospheric pressure',
            '5-day forecast from ECMWF IFS',
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-slate-700 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <p className="text-[9.5px] font-tech text-slate-700 mt-4">
          Required: <code className="text-cyan-800 bg-cyan-950/30 px-1 rounded">VITE_CMEMS_API_KEY</code> and <code className="text-cyan-800 bg-cyan-950/30 px-1 rounded">VITE_ERA5_API_KEY</code> in <code className="text-cyan-800 bg-cyan-950/30 px-1 rounded">.env</code>
        </p>
      </div>

      <button
        onClick={() => navigate('/map')}
        className="group flex items-center gap-2 px-5 py-2.5 border border-white/[0.08] text-slate-500 text-xs font-tech tracking-[0.15em] uppercase rounded-sm hover:text-white hover:border-white/20 transition-all cursor-pointer"
      >
        Return to Map
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}

/* ══════════════════════════════════════
   MISSION / VESSEL MODULE (legacy route)
══════════════════════════════════════ */
function MissionModule() {
  const navigate = useNavigate();
  const v = DEMO_VESSEL;

  return (
    <div className="space-y-10">
      <div>
        <p className="text-[9.5px] font-tech tracking-[0.25em] text-cyan-500 uppercase mb-2">Module — Vessel</p>
        <h1 className="font-display text-3xl md:text-5xl font-black uppercase text-white tracking-tight">
          Vessel<br />Telemetry
        </h1>
        <p className="text-slate-500 text-sm mt-3 max-w-2xl leading-relaxed font-body">
          Active research vessel position, heading, speed and destination. In production, this connects to AIS or vessel telemetry API.
        </p>
      </div>

      <DataNotice label="DEMO DATA" detail="AIS or vessel telemetry API is not connected. Values below are static demonstration data." />

      <div className="p-6 bg-[#0a1825]/70 border border-white/[0.07] rounded-sm grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <p className="text-[9px] font-tech text-slate-600 uppercase tracking-wider">Research Vessel</p>
          <p className="text-xl font-display font-bold text-white">{v.name}</p>
          <p className="text-[11px] font-tech text-cyan-500">{v.vesselType} · {v.iceClass}</p>
          <p className="text-[10px] font-tech text-slate-600 mt-1">IMO {v.imo} · {v.callSign}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t md:border-t-0 md:border-l border-white/[0.06] pt-4 md:pt-0 md:pl-6">
          <Field label="Position" value={`${Math.abs(v.latitude)}°S ${v.longitude}°E`} />
          <Field label="Speed" value={`${v.speedKnots} kt`} accent="text-cyan-400" />
          <Field label="Heading" value={`${v.heading}°`} />
          <Field label="ETA" value={v.eta.split(' ')[0]} accent="text-emerald-400" />
          <Field label="Destination" value={v.destination.split(' (')[0]} />
          <Field label="Draft" value={v.draft} />
        </div>
      </div>

      <button
        onClick={() => navigate('/map')}
        className="group flex items-center gap-2 px-5 py-2.5 border border-cyan-500/40 text-cyan-400 text-xs font-tech tracking-[0.15em] uppercase rounded-sm hover:bg-cyan-950/40 transition-all cursor-pointer"
      >
        Focus Vessel on Map
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}

/* ══════════════════════════════════════
   ROOT MODULE PAGE COMPONENT
══════════════════════════════════════ */
export default function ModulePage({ type = 'sea-ice' }) {
  useEffect(() => { window.scrollTo(0, 0); }, [type]);

  const renderModule = () => {
    switch (type) {
      case 'sea-ice':  return <SeaIceModule />;
      case 'icebergs': return <IcebergsModule />;
      case 'routes':   return <RoutesModule />;
      case 'weather':
      case 'ocean':    return <WeatherModule />;
      case 'mission':  return <MissionModule />;
      default:         return <SeaIceModule />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050d17] text-[#F2F4F5] flex flex-col">
      {/* Persistent navigation */}
      <Header />

      {/* Module content */}
      <main className="flex-1 px-6 md:px-14 py-12 max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {renderModule()}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="px-6 md:px-14 py-6 border-t border-white/[0.06] text-[9px] font-tech text-slate-700 tracking-widest flex items-center justify-between">
        <span>POLARNAV AI · NCPOR / MOES · SIH 2026</span>
        <span className="hidden sm:block">BHARATI STATION · MAITRI STATION</span>
      </footer>
    </div>
  );
}
