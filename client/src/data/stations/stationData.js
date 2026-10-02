/**
 * Antarctic Station Data Service Interface
 * Acts as the centralized station repository for PolarNav AI.
 * Can serve local normalized CSV records or fetch from FastAPI backend (`/api/stations`).
 */

import { ANTARCTIC_FACILITIES } from './stationDataLoader';

const USE_REMOTE_STATIONS_API = false;
const STATIONS_API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/stations` 
  : 'http://localhost:8000/api/v1/stations';

/**
 * Fetch all Antarctic facilities and research stations
 */
export async function fetchAntarcticStations() {
  if (USE_REMOTE_STATIONS_API) {
    try {
      const response = await fetch(STATIONS_API_URL);
      if (!response.ok) throw new Error(`Failed to fetch stations from API: ${response.statusText}`);
      return await response.json();
    } catch (err) {
      console.warn('Falling back to local CSV station dataset:', err);
      return ANTARCTIC_FACILITIES;
    }
  }

  // Return real parsed facilities dataset from CSV
  return Promise.resolve([...ANTARCTIC_FACILITIES]);
}

export { ANTARCTIC_FACILITIES };
