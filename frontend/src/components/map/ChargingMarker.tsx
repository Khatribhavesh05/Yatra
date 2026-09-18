import { useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import { ChargingCenter } from '../../types';

export interface ChargingMarkerProps {
  map: maplibregl.Map | null;
  station: ChargingCenter;
  isSelected?: boolean;
  onClick?: (station: ChargingCenter) => void;
}

export const ChargingMarker: React.FC<ChargingMarkerProps> = ({
  map,
  station,
  isSelected,
  onClick,
}) => {
  useEffect(() => {
    if (!map || station.latitude === undefined || station.longitude === undefined) return;

    const el = document.createElement('div');
    el.className = `flex flex-col items-center cursor-pointer transition-transform duration-300 z-10 ${
      isSelected ? 'scale-125 z-30' : 'hover:scale-110'
    }`;

    const isFast = (station.power_kw || 0) >= 50;

    el.innerHTML = `
      <div class="w-8 h-8 rounded-full ${
        isFast ? 'bg-secondary text-white' : 'bg-primary text-white'
      } flex items-center justify-center shadow-lg border-2 ${
        isSelected ? 'border-amber-400 ring-2 ring-secondary' : 'border-white'
      }">
        <span class="material-symbols-outlined text-base">
          ev_station
        </span>
      </div>
      <div class="mt-1 bg-white text-on-surface border border-outline-variant text-[9px] font-bold px-1.5 py-0.2 rounded shadow max-w-[100px] truncate">
        ${station.power_kw ? `${station.power_kw}kW` : 'EV'}
      </div>
    `;

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (onClick) onClick(station);
    });

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([station.longitude, station.latitude])
      .addTo(map);

    return () => {
      marker.remove();
    };
  }, [map, station.id, station.latitude, station.longitude, station.power_kw, isSelected]);

  return null;
};
