import React, { useState, useMemo } from 'react';
import Header from '../components/layout/Header';
import BottomSummary from '../components/layout/BottomSummary';
import AntarcticMap from '../components/map/AntarcticMap';
import LocationInfoPanel from '../components/panels/LocationInfoPanel';
import { useNavigationState } from '../hooks/useNavigationState';
import { filterStations, calculateStationStats } from '../data/stations/stationUtils';

export default function MapPage() {
  const {
    layers,
    toggleLayer,
    baseLayer,
    setBaseLayer,
    vessel,
    icebergs,
    routes,
    riskZones,
    stations,
    loading,
    selectedObject,
    setSelectedObject,
    selectVessel,
    selectIceberg,
    selectStation,
    selectRoute,
    selectCustomCoordinate,
    mapCenter,
    mapZoom,
    resetAntarcticOverview,
    zoomTo
  } = useNavigationState();

  const [activeRouteType, setActiveRouteType] = useState('recommended');

  // Station filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedSeasonality, setSelectedSeasonality] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  const filteredStations = useMemo(() => {
    return filterStations(stations, {
      searchQuery,
      country: selectedCountry,
      seasonality: selectedSeasonality,
      facilityType: selectedType
    });
  }, [stations, searchQuery, selectedCountry, selectedSeasonality, selectedType]);

  const stationStats = useMemo(() => calculateStationStats(stations), [stations]);

  const handleSelectRoute = (route) => {
    selectRoute(route);
    setActiveRouteType(route.isRecommended ? 'recommended' : 'alternative');
  };

  const handleSetDestination = (station) => {
    if (vessel) vessel.destination = station.name;
    setSelectedObject({ type: 'station', data: station });
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#050d17] flex flex-col items-center justify-center text-white font-tech select-none">
        <div className="w-7 h-7 rounded-full border border-cyan-500/20 border-t-cyan-400 animate-spin mb-4" />
        <span className="text-[10px] tracking-[0.22em] text-slate-500 uppercase">
          Loading geospatial data
        </span>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#050d17] text-white overflow-hidden select-none">

      {/* ① Global navigation — HOME + all modules accessible from map */}
      <Header />

      {/* ② Full-viewport map */}
      <main className="flex-1 relative overflow-hidden">
        <AntarcticMap
          layers={layers}
          onToggleLayer={toggleLayer}
          baseLayer={baseLayer}
          setBaseLayer={setBaseLayer}
          vessel={vessel}
          icebergs={icebergs}
          routes={routes}
          riskZones={riskZones}
          stations={stations}
          filteredStations={filteredStations}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
          selectedSeasonality={selectedSeasonality}
          setSelectedSeasonality={setSelectedSeasonality}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedObject={selectedObject}
          onSelectVessel={selectVessel}
          onSelectIceberg={selectIceberg}
          onSelectStation={selectStation}
          onSelectRoute={handleSelectRoute}
          onSelectCoordinate={selectCustomCoordinate}
          mapCenter={mapCenter}
          mapZoom={mapZoom}
          onResetOverview={resetAntarcticOverview}
          stats={stationStats}
        />

        {/* ③ Right info panel — opens on selection */}
        <LocationInfoPanel
          selectedObject={selectedObject}
          onClose={() => setSelectedObject(null)}
          onZoomTo={(coords) => zoomTo(coords, 7)}
          onSetDestination={handleSetDestination}
        />
      </main>

      {/* ④ Bottom route summary bar */}
      <BottomSummary
        vessel={vessel}
        routes={routes}
        selectedRouteType={activeRouteType}
        onSelectRoute={handleSelectRoute}
      />
    </div>
  );
}
