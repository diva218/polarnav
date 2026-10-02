/**
 * PolarNav Navigation Service Abstraction
 * 
 * Provides an asynchronous data layer interface.
 * Currently serves calibrated mock demonstration datasets.
 * In production / future phases, this connects directly to the FastAPI backend
 * endpoints (e.g., /api/v1/telemetry, /api/v1/routes/predict, /api/v1/icebergs/detect).
 */

import {
  DEMO_VESSEL as MOCK_VESSEL,
  DEMO_ICEBERGS as MOCK_ICEBERGS,
  DEMO_RECOMMENDED_ROUTE as MOCK_RECOMMENDED_ROUTE,
  DEMO_ALTERNATIVE_ROUTE as MOCK_ALTERNATIVE_ROUTE,
  DEMO_RISK_ZONES as MOCK_RISK_ZONES
} from '../data/antarcticDemoData';
import { fetchAntarcticStations } from '../data/stations/stationData';

const USE_REMOTE_API = false; // Toggle to true when FastAPI backend is live
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const navigationService = {
  /**
   * Fetch current active vessel status & telemetry
   */
  async getVesselTelemetry(vesselId = 'default') {
    if (USE_REMOTE_API) {
      const response = await fetch(`${API_BASE_URL}/vessel/${vesselId}`);
      if (!response.ok) throw new Error(`Failed to fetch vessel data: ${response.statusText}`);
      return await response.json();
    }
    // Return mock with simulated network latency
    return Promise.resolve({ ...MOCK_VESSEL });
  },

  /**
   * Fetch detected icebergs and predicted positions
   */
  async getIcebergDetections() {
    if (USE_REMOTE_API) {
      const response = await fetch(`${API_BASE_URL}/icebergs`);
      if (!response.ok) throw new Error(`Failed to fetch icebergs: ${response.statusText}`);
      return await response.json();
    }
    return Promise.resolve([...MOCK_ICEBERGS]);
  },

  /**
   * Fetch AI recommended & alternative navigation routes
   */
  async getNavigationRoutes(destinationId = 'bharati') {
    if (USE_REMOTE_API) {
      const response = await fetch(`${API_BASE_URL}/routes?destination=${destinationId}`);
      if (!response.ok) throw new Error(`Failed to fetch routes: ${response.statusText}`);
      return await response.json();
    }
    return Promise.resolve({
      recommended: { ...MOCK_RECOMMENDED_ROUTE },
      alternative: { ...MOCK_ALTERNATIVE_ROUTE }
    });
  },

  /**
   * Fetch active polar ice hazard risk zones
   */
  async getRiskZones() {
    if (USE_REMOTE_API) {
      const response = await fetch(`${API_BASE_URL}/risk-zones`);
      if (!response.ok) throw new Error(`Failed to fetch risk zones: ${response.statusText}`);
      return await response.json();
    }
    return Promise.resolve([...MOCK_RISK_ZONES]);
  },

  /**
   * Fetch Antarctic research stations & facilities (COMNAP dataset)
   */
  async getAntarcticStations() {
    return await fetchAntarcticStations();
  },

  /**
   * Sample environment query for any arbitrary clicked coordinate [lat, lng]
   * (Simulates querying gridded climate/SAR raster model)
   */
  async queryCoordinateTelemetry(lat, lng) {
    if (USE_REMOTE_API) {
      const response = await fetch(`${API_BASE_URL}/query-point?lat=${lat}&lng=${lng}`);
      if (!response.ok) throw new Error(`Point query failed: ${response.statusText}`);
      return await response.json();
    }

    // Synthesize realistic polar coordinate telemetry for demo inspection
    const absLat = Math.abs(lat);
    const estimatedTemp = -(absLat * 0.35 + Math.sin(lng * 0.05) * 4).toFixed(1);
    const estimatedSIC = Math.min(95, Math.max(5, Math.round((absLat - 60) * 8 + Math.cos(lng * 0.1) * 15)));
    const icebergProb = Math.min(98, Math.max(2, Math.round(estimatedSIC * 0.85 + (Math.abs(lng % 30) < 10 ? 25 : 0))));
    
    let riskLevel = 'LOW';
    if (estimatedSIC > 70 || icebergProb > 75) riskLevel = 'CRITICAL';
    else if (estimatedSIC > 40 || icebergProb > 50) riskLevel = 'HIGH';
    else if (estimatedSIC > 20 || icebergProb > 25) riskLevel = 'MODERATE';

    return Promise.resolve({
      coordinates: [Number(lat.toFixed(4)), Number(lng.toFixed(4))],
      temperature: Number(estimatedTemp),
      seaIceConcentration: estimatedSIC,
      icebergProbability: icebergProb,
      windSpeedKnots: Math.round(15 + (absLat % 10) * 2.2),
      windDirection: `${Math.round((lng + 360) % 360)}°`,
      visibilityNM: (Math.max(1.2, 10 - (estimatedSIC / 15))).toFixed(1),
      waveHeightM: (Math.max(0.5, 4.2 - (estimatedSIC / 25))).toFixed(1),
      riskLevel,
      polarCodeRecommendation: riskLevel === 'CRITICAL' 
        ? 'Restricted Zone: Mandatory Icebreaker Escort Required'
        : riskLevel === 'HIGH'
        ? 'Caution: Reduce Speed to <8 kts and Activate Searchlights'
        : 'Open Nav Corridor: Follow Approved Low-Ice Waypoints'
    });
  }
};
