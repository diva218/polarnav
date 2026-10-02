import React, { useState, useRef, useEffect } from 'react';
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUniqueCountries, getUniqueSeasonalities, getUniqueFacilityTypes } from '../../data/stations/stationUtils';

export default function StationSearchFilter({
  stations = [],
  filteredStations = [],
  searchQuery,
  setSearchQuery,
  selectedCountry,
  setSelectedCountry,
  selectedSeasonality,
  setSelectedSeasonality,
  selectedType,
  setSelectedType,
  onSelectStation,
  stats
}) {
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef(null);

  const countries = getUniqueCountries(stations);
  const seasonalities = getUniqueSeasonalities(stations);
  const facilityTypes = getUniqueFacilityTypes(stations);

  // Suggestions for autocomplete when searching
  const searchResults = searchQuery.trim()
    ? filteredStations.slice(0, 6)
    : [];

  const handleSelectResult = (station) => {
    onSelectStation(station);
    setIsFocused(false);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCountry('All');
    setSelectedSeasonality('All');
    setSelectedType('All');
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCountry !== 'All' ||
    selectedSeasonality !== 'All' ||
    selectedType !== 'All';

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className="relative select-none font-tech text-xs">
      <div className="flex items-center gap-2.5">
        {/* Search Bar */}
        <div className="relative flex items-center h-9 bg-[#0B1520]/95 backdrop-blur-md border border-white/10 hover:border-[#38bdf8]/40 rounded-sm shadow-xl px-3 w-64 sm:w-72 md:w-80 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-within:border-[#38bdf8]/70 focus-within:w-84 md:focus-within:w-96">
          <Search className="w-3.5 h-3.5 text-[#82909B] shrink-0 mr-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Search stations, countries..."
            className="bg-transparent border-none outline-none text-[#F2F4F5] placeholder-[#82909B]/70 text-xs w-full font-tech"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[#82909B] hover:text-[#F2F4F5] p-0.5 ml-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setIsOpenFilter(!isOpenFilter)}
          className={`flex items-center gap-1.5 h-9 px-3 rounded-sm border backdrop-blur-md shadow-xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
            hasActiveFilters
              ? 'bg-[#0B1520] border-[#38bdf8] text-[#38bdf8]'
              : 'bg-[#0B1520]/95 border-white/10 text-[#82909B] hover:text-[#F2F4F5] hover:border-[#38bdf8]/40'
          }`}
          title="Filter Antarctic Stations"
        >
          <SlidersHorizontal className="w-3 h-3" />
          <span className="text-[10px] tracking-widest uppercase hidden sm:inline font-medium">
            FILTER
          </span>
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
          )}
        </button>

        {/* Subtle Facility Count Tag */}
        <div className="hidden lg:flex items-center h-9 px-3 bg-[#0B1520]/85 backdrop-blur-md border border-white/[0.08] rounded-sm text-[10px] text-[#82909B] tracking-wider uppercase">
          <span className="text-[#F2F4F5] font-semibold mr-1">
            {filteredStations.length}
          </span>
          <span>/ {stations.length} FACILITIES</span>
        </div>
      </div>

      {/* Autocomplete Search Dropdown */}
      <AnimatePresence>
        {isFocused && searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute top-full left-0 mt-1.5 w-80 bg-[#0B1520]/95 backdrop-blur-md border border-white/10 rounded-sm shadow-2xl overflow-hidden py-1 z-50"
          >
            <div className="px-3 py-1.5 border-b border-white/[0.08] text-[9px] tracking-[0.2em] text-[#82909B] uppercase font-semibold flex justify-between">
              <span>MATCHING STATIONS</span>
              <span>{searchResults.length} RESULTS</span>
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-white/[0.04]">
              {searchResults.map((station) => (
                <button
                  key={station.id}
                  onClick={() => handleSelectResult(station)}
                  className="w-full text-left px-3 py-2 hover:bg-[#122234] transition-colors flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs text-[#F2F4F5] font-medium truncate group-hover:text-[#38bdf8]">
                      {station.name}
                    </div>
                    <div className="text-[10px] text-[#82909B] truncate">
                      {station.operatorPrimary || station.country} • {station.type}
                    </div>
                  </div>
                  <span className="text-[9px] text-[#38bdf8] uppercase px-1 py-0.5 rounded bg-[#38bdf8]/10 shrink-0">
                    {station.seasonality}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Popover Panel */}
      <AnimatePresence>
        {isOpenFilter && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-0 mt-2 w-72 md:w-80 bg-[#071320]/96 backdrop-blur-md border border-white/10 rounded-sm p-4 shadow-2xl z-50 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <span className="text-[10px] tracking-[0.2em] uppercase text-[#82909B] font-medium">
                FACILITY FILTERS
              </span>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-[10px] text-[#38bdf8] hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Seasonality */}
            <div>
              <label className="text-[9px] uppercase tracking-widest text-[#82909B] block mb-1.5">
                Seasonality
              </label>
              <div className="grid grid-cols-3 gap-1">
                {seasonalities.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSeasonality(s)}
                    className={`py-1 text-[10px] rounded-sm transition-colors border ${
                      selectedSeasonality === s
                        ? 'bg-[#38bdf8]/20 border-[#38bdf8] text-[#F2F4F5] font-semibold'
                        : 'border-white/[0.06] text-[#82909B] hover:text-[#F2F4F5]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Facility Type */}
            <div>
              <label className="text-[9px] uppercase tracking-widest text-[#82909B] block mb-1.5">
                Facility Type
              </label>
              <div className="grid grid-cols-2 gap-1 max-h-28 overflow-y-auto">
                {facilityTypes.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`py-1 px-2 text-[10px] text-left truncate rounded-sm transition-colors border ${
                      selectedType === t
                        ? 'bg-[#38bdf8]/20 border-[#38bdf8] text-[#F2F4F5] font-semibold'
                        : 'border-white/[0.06] text-[#82909B] hover:text-[#F2F4F5]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Country / Operator Dropdown */}
            <div>
              <label className="text-[9px] uppercase tracking-widest text-[#82909B] block mb-1.5">
                Country / National Program
              </label>
              <div className="relative">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full bg-[#071018] border border-white/10 rounded-sm py-1.5 px-2 text-[11px] text-[#F2F4F5] outline-none font-mono cursor-pointer appearance-none pr-6"
                >
                  {countries.map((c) => (
                    <option key={c} value={c} className="bg-[#0B1520] text-[#F2F4F5]">
                      {c === 'All' ? 'All Countries / Operators' : c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-[#82909B] absolute right-2 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Statistical summary inside panel */}
            <div className="pt-2 border-t border-white/[0.08] flex justify-between text-[9px] text-[#82909B]">
              <span>Matching: {filteredStations.length} of {stations.length}</span>
              <span>Year-round: {stats?.yearRound || 0}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
