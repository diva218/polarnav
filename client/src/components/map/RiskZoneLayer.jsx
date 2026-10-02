import React from 'react';
import { Polygon, Tooltip } from 'react-leaflet';

export default function RiskZoneLayer({ riskZones, showZones = true, onSelectZone }) {
  if (!showZones || !riskZones?.length) return null;

  return (
    <React.Fragment>
      {riskZones.map((zone) => (
        <Polygon
          key={zone.id}
          positions={zone.coordinates}
          pathOptions={{
            color: '#38bdf8',
            weight: 1,
            opacity: 0.25,
            dashArray: '3, 4',
            fillColor: '#38bdf8',
            fillOpacity: 0.06
          }}
          eventHandlers={{
            click: () => onSelectZone && onSelectZone({
              type: 'coordinate',
              data: {
                coordinates: zone.coordinates[0],
                name: zone.name,
                temperature: -14.2,
                seaIceConcentration: 75,
                icebergProbability: 60,
                riskLevel: zone.riskLevel || 'Moderate',
                description: zone.description
              }
            })
          }}
        >
          <Tooltip sticky opacity={0.95}>
            <div className="p-1 font-mono text-center select-none">
              <span className="font-semibold text-xs text-[#F2F4F5]">{zone.name}</span>
              <div className="text-[9px] text-[#82909B] mt-0.5">
                Ice Concentration: {zone.avgIceConcentration}
              </div>
            </div>
          </Tooltip>
        </Polygon>
      ))}
    </React.Fragment>
  );
}
