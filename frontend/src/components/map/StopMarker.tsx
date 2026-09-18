import { useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import { Stop } from '../../types';

export interface StopMarkerProps {
  map: maplibregl.Map | null;
  stop: Stop;
  sequence?: number;
  isSelected?: boolean;
  onClick?: (stop: Stop) => void;
}

export const StopMarker: React.FC<StopMarkerProps> = ({
  map,
  stop,
  sequence,
  isSelected,
  onClick,
}) => {
  useEffect(() => {
    if (!map || stop.latitude === undefined || stop.longitude === undefined) return;

    const el = document.createElement('div');
    el.className = `flex flex-col items-center cursor-pointer transition-transform duration-300 z-10 ${
      isSelected ? 'scale-125 z-30' : 'hover:scale-110'
    }`;

    el.innerHTML = `
      <div class="w-6 h-6 rounded-full bg-white text-primary flex items-center justify-center shadow-md border-2 ${
        isSelected ? 'border-primary bg-primary text-white font-bold' : 'border-primary'
      } text-[10px] font-bold">
        ${sequence !== undefined ? sequence : '•'}
      </div>
    `;

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (onClick) onClick(stop);
    });

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([stop.longitude, stop.latitude])
      .addTo(map);

    return () => {
      marker.remove();
    };
  }, [map, stop.id, stop.latitude, stop.longitude, sequence, isSelected]);

  return null;
};
