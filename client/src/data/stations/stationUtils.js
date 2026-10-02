/**
 * Antarctic Station Utilities: Filtering, Search, Analytics & Geodesics
 */

/**
 * Filter stations by query string, country, seasonality, and facility type
 */
export function filterStations(stations = [], {
  searchQuery = '',
  country = 'All',
  seasonality = 'All',
  facilityType = 'All'
} = {}) {
  const query = searchQuery.trim().toLowerCase();

  return stations.filter((st) => {
    // 1. Text Search Filter
    if (query) {
      const matchName = st.name.toLowerCase().includes(query);
      const matchOfficial = st.officialName && st.officialName.toLowerCase().includes(query);
      const matchCountry = st.country && st.country.toLowerCase().includes(query);
      const matchOperator = st.operator && st.operator.toLowerCase().includes(query);
      const matchRegion = st.region && st.region.toLowerCase().includes(query);
      if (!matchName && !matchOfficial && !matchCountry && !matchOperator && !matchRegion) {
        return false;
      }
    }

    // 2. Country / Operator Filter
    if (country !== 'All') {
      if (st.operatorPrimary !== country && st.country !== country) {
        return false;
      }
    }

    // 3. Seasonality Filter
    if (seasonality !== 'All') {
      if (st.seasonality.toLowerCase() !== seasonality.toLowerCase()) {
        return false;
      }
    }

    // 4. Facility Type Filter
    if (facilityType !== 'All') {
      if (st.type.toLowerCase() !== facilityType.toLowerCase()) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Calculate statistical breakdown dynamically from actual station records
 */
export function calculateStationStats(stations = []) {
  let total = stations.length;
  let yearRound = 0;
  let seasonal = 0;
  let researchStations = 0;
  let otherFacilities = 0;
  let openCount = 0;

  stations.forEach((s) => {
    if (s.isYearRound) yearRound++;
    if (s.isSeasonal) seasonal++;
    if (s.isResearchStation) researchStations++;
    else otherFacilities++;
    if (s.isOpen) openCount++;
  });

  return {
    total,
    yearRound,
    seasonal,
    researchStations,
    otherFacilities,
    openCount
  };
}

/**
 * Dynamically extract unique sorted primary countries/operators
 */
export function getUniqueCountries(stations = []) {
  const set = new Set();
  stations.forEach((s) => {
    if (s.operatorPrimary) set.add(s.operatorPrimary);
  });
  return ['All', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
}

/**
 * Dynamically extract unique facility types
 */
export function getUniqueFacilityTypes(stations = []) {
  const set = new Set();
  stations.forEach((s) => {
    if (s.type) set.add(s.type);
  });
  return ['All', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
}

/**
 * Dynamically extract unique seasonalities
 */
export function getUniqueSeasonalities(stations = []) {
  const set = new Set();
  stations.forEach((s) => {
    if (s.seasonality) set.add(s.seasonality);
  });
  return ['All', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
}

/**
 * Calculate great-circle distance between two geographic coordinates in Nautical Miles (NM)
 */
export function calculateDistanceNM(lat1, lon1, lat2, lon2) {
  const R = 3440.065; // Earth radius in nautical miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}
