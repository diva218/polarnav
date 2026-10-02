import React from 'react';
import { Polyline, CircleMarker, Tooltip } from 'react-leaflet';

export default function RouteLayer({
  routes,
  showRecommended = true,
  showAlternative = true,
  selectedRouteId,
  onSelectRoute
}) {
  if (!routes) return null;

  const { recommended, alternative } = routes;

  return (
    <React.Fragment>
      {/* 1. Recommended Route (Clean animated line) */}
      {showRecommended && recommended?.waypoints && (
        <React.Fragment>
          <Polyline
            positions={recommended.waypoints}
            pathOptions={{
              color: '#00e5ff',
              weight: selectedRouteId === recommended.id ? 3.5 : 2.5,
              opacity: 0.9,
              dashArray: '8, 10',
              className: 'route-dash-active',
              lineCap: 'round',
              lineJoin: 'round'
            }}
            eventHandlers={{
              click: () => onSelectRoute && onSelectRoute(recommended)
            }}
          >
            <Tooltip sticky opacity={0.95}>
              <div className="p-1 font-mono select-none text-center">
                <span className="font-semibold text-xs text-[#F2F4F5]">RECOMMENDED ROUTE</span>
                <div className="text-[10px] text-[#00e5ff] mt-0.5">
                  {recommended.totalDistanceNM} NM • {recommended.estimatedTimeHours} H • LOW RISK
                </div>
              </div>
            </Tooltip>
          </Polyline>

          {/* Minimal Waypoints */}
          {recommended.waypoints.map((wp, idx) => (
            <CircleMarker
              key={`rec-wp-${idx}`}
              center={wp}
              radius={idx === 0 || idx === recommended.waypoints.length - 1 ? 3.5 : 2}
              pathOptions={{
                color: '#00e5ff',
                fillColor: '#071018',
                fillOpacity: 1,
                weight: 1.5
              }}
              eventHandlers={{
                click: () => onSelectRoute && onSelectRoute(recommended)
              }}
            />
          ))}
        </React.Fragment>
      )}

      {/* 2. Alternative Route (Subtle dashed line) */}
      {showAlternative && alternative?.waypoints && (
        <React.Fragment>
          <Polyline
            positions={alternative.waypoints}
            pathOptions={{
              color: '#82909B',
              weight: selectedRouteId === alternative.id ? 2 : 1.5,
              opacity: 0.45,
              dashArray: '4, 6'
            }}
            eventHandlers={{
              click: () => onSelectRoute && onSelectRoute(alternative)
            }}
          >
            <Tooltip sticky opacity={0.95}>
              <div className="p-1 font-mono select-none text-center">
                <span className="font-semibold text-xs text-[#82909B]">ALTERNATIVE ROUTE</span>
                <div className="text-[10px] text-[#82909B] mt-0.5">
                  {alternative.totalDistanceNM} NM • Direct Rhumb
                </div>
              </div>
            </Tooltip>
          </Polyline>
        </React.Fragment>
      )}
    </React.Fragment>
  );
}
