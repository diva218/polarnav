import React from 'react';
import { TileLayer } from 'react-leaflet';

export default function MapBaseLayer({ mapType = 'satellite' }) {
  const apiKey = import.meta.env.VITE_MAPTILER_API_KEY || '';
  const hasValidApiKey = apiKey && apiKey.trim() !== '' && apiKey !== 'your_maptiler_key_here';

  // MapTiler vs Fallback Basemap URL configurations
  const getTileConfig = () => {
    if (hasValidApiKey) {
      switch (mapType) {
        case 'ocean':
          return {
            url: `https://api.maptiler.com/maps/ocean/{z}/{x}/{y}.jpg?key=${apiKey}`,
            attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            tileSize: 512,
            zoomOffset: -1
          };
        case 'topo':
          return {
            url: `https://api.maptiler.com/maps/topo-v2/{z}/{x}/{y}.png?key=${apiKey}`,
            attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            tileSize: 512,
            zoomOffset: -1
          };
        case 'satellite':
        default:
          return {
            url: `https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=${apiKey}`,
            attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            tileSize: 512,
            zoomOffset: -1
          };
      }
    }

    // High-resolution public fallback layers when MapTiler key is missing or unconfigured
    switch (mapType) {
      case 'ocean':
        return {
          url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          tileSize: 256,
          zoomOffset: 0,
          subdomains: 'abcd'
        };
      case 'topo':
        return {
          url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
          tileSize: 256,
          zoomOffset: 0,
          subdomains: 'abc'
        };
      case 'satellite':
      default:
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          tileSize: 256,
          zoomOffset: 0
        };
    }
  };

  const config = getTileConfig();

  return (
    <TileLayer
      key={`${mapType}-${hasValidApiKey ? 'maptiler' : 'fallback'}`}
      url={config.url}
      attribution={config.attribution}
      maxZoom={19}
      tileSize={config.tileSize}
      zoomOffset={config.zoomOffset}
      subdomains={config.subdomains || 'abc'}
      crossOrigin="anonymous"
    />
  );
}
