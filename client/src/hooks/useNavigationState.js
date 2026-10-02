import { useState, useEffect, useCallback } from 'react';
import { navigationService } from '../services/navigationService';

export function useNavigationState() {
  // Layer visibility state
  const [layers, setLayers] = useState({
    vessel: true,
    icebergs: true,
    recommendedRoute: true,
    alternativeRoute: true,
    riskZones: true,
    stations: true,
    seaIceConcentration: true,
    icebergProbability: false,
    temperatureLayer: false,
    weatherVectors: false,
  });

  // Base Map Layer ('satellite', 'ocean', 'topo')
  const [baseLayer, setBaseLayer] = useState('satellite');

  // Loaded Data
  const [vessel, setVessel] = useState(null);
  const [icebergs, setIcebergs] = useState([]);
  const [routes, setRoutes] = useState({ recommended: null, alternative: null });
  const [riskZones, setRiskZones] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected map entity for detailed right telemetry panel
  const [selectedObject, setSelectedObject] = useState(null);

  // Map viewport control
  const [mapCenter, setMapCenter] = useState([-68.2000, 72.0000]);
  const [mapZoom, setMapZoom] = useState(5);

  // Initial data loading
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [vesselData, icebergData, routeData, zoneData, stationData] = await Promise.all([
          navigationService.getVesselTelemetry(),
          navigationService.getIcebergDetections(),
          navigationService.getNavigationRoutes(),
          navigationService.getRiskZones(),
          navigationService.getAntarcticStations()
        ]);

        setVessel(vesselData);
        setIcebergs(icebergData);
        setRoutes(routeData);
        setRiskZones(zoneData);
        setStations(stationData);

        // Default selection: none (panel only opens on user selection)
        setSelectedObject(null);
      } catch (err) {
        console.error('Error loading PolarNav data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const toggleLayer = useCallback((layerKey) => {
    setLayers((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey]
    }));
  }, []);

  const selectVessel = useCallback((vesselData) => {
    setSelectedObject({
      type: 'vessel',
      data: vesselData || vessel
    });
  }, [vessel]);

  const selectIceberg = useCallback((icebergData) => {
    setSelectedObject({
      type: 'iceberg',
      data: icebergData
    });
  }, []);

  const selectStation = useCallback((stationData) => {
    setSelectedObject({
      type: 'station',
      data: stationData
    });
    setMapCenter(stationData.coordinates);
    setMapZoom(6);
  }, []);

  const selectRoute = useCallback((routeData) => {
    setSelectedObject({
      type: 'route',
      data: routeData
    });
  }, []);

  const selectCustomCoordinate = useCallback(async (lat, lng) => {
    const telemetry = await navigationService.queryCoordinateTelemetry(lat, lng);
    setSelectedObject({
      type: 'coordinate',
      data: telemetry
    });
  }, []);

  const focusVessel = useCallback(() => {
    if (vessel?.coordinates) {
      setMapCenter(vessel.coordinates);
      setMapZoom(6);
      selectVessel(vessel);
    }
  }, [vessel, selectVessel]);

  const zoomTo = useCallback((coordinates, zoom = 7) => {
    if (coordinates && coordinates.length === 2) {
      setMapCenter(coordinates);
      setMapZoom(zoom);
    }
  }, []);

  const resetAntarcticOverview = useCallback(() => {
    setMapCenter([-68.2000, 72.0000]);
    setMapZoom(5);
    setSelectedObject(null);
  }, []);

  return {
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
    setMapCenter,
    setMapZoom,
    focusVessel,
    resetAntarcticOverview,
    zoomTo
  };
}

