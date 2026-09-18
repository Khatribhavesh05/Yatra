import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { VehiclePublic } from '../../types';
import { interpolateLatLng } from '../../utils/polylineUtils';

export interface VehicleMarkerProps {
  map: maplibregl.Map | null;
  vehicle: VehiclePublic;
  isSelected?: boolean;
  onClick?: (vehicle: VehiclePublic) => void;
}

const getVehicleIcon = (type: string) => {
  switch (type) {
    case 'electric_bus': return 'directions_bus';
    case 'fire_ev': return 'local_fire_department';
    case 'ambulance_ev': return 'emergency';
    case 'utility_ev': return 'electric_bolt';
    default: return 'navigation';
  }
};

export const VehicleMarker: React.FC<VehicleMarkerProps> = ({
  map,
  vehicle,
  isSelected,
  onClick,
}) => {
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const elRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const posRef = useRef<[number, number] | null>(null);

  useEffect(() => {
    if (!map || vehicle.latitude === undefined || vehicle.longitude === undefined || vehicle.latitude === null || vehicle.longitude === null) return;

    if (!elRef.current) {
      elRef.current = document.createElement('div');
      markerRef.current = new maplibregl.Marker({ element: elRef.current })
        .setLngLat([vehicle.longitude, vehicle.latitude])
        .addTo(map);
      posRef.current = [vehicle.longitude, vehicle.latitude];
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (markerRef.current) markerRef.current.remove();
      markerRef.current = null;
      elRef.current = null;
    };
  }, [map]); // Init and destroy with map

  useEffect(() => {
    if (!elRef.current) return;
    
    elRef.current.onclick = (e) => {
      e.stopPropagation();
      if (onClick) onClick(vehicle);
    };

    const isLive = vehicle.status === 'online';
    const heading = vehicle.heading_deg || 0;
    const isLowBattery = (vehicle.soc_pct ?? 100) < 20;
    const icon = getVehicleIcon(vehicle.vehicle_type);
    const speed = vehicle.speed_kph || 0;
    
    let borderClass = 'border-white';
    let pulseClass = 'pulse-marker';
    let bgClass = isLive ? 'bg-primary' : 'bg-gray-700';
    
    if (isLowBattery) {
      borderClass = 'border-error';
      pulseClass = 'pulse-error-marker';
      if (isLive) bgClass = 'bg-error';
    } else if (isSelected) {
      borderClass = 'border-amber-400 ring-2 ring-primary';
    }

    elRef.current.className = `flex flex-col items-center cursor-pointer transition-transform duration-300 z-20 ${
      isSelected ? 'scale-125 z-30' : 'hover:scale-110'
    }`;

    elRef.current.innerHTML = `
      <div class="relative flex items-center justify-center">
        ${isLive ? `<div class="absolute -inset-1 rounded-full ${isLowBattery ? 'bg-error/30' : 'bg-primary/30'} ${pulseClass}"></div>` : ''}
        <div class="w-9 h-9 rounded-full ${bgClass} text-white flex items-center justify-center shadow-lg border-2 ${borderClass}">
          <span class="material-symbols-outlined text-xl" style="transform: rotate(${heading}deg);">
            ${icon}
          </span>
        </div>
      </div>
      <div class="mt-1 bg-on-background text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap">
        ${vehicle.vehicle_code || 'Bus'}
      </div>
      ${isLive && speed > 0 ? `
      <div class="mt-0.5 bg-primary/90 text-white text-[8px] font-bold px-1 rounded shadow whitespace-nowrap">
        ${speed} km/h
      </div>
      ` : ''}
    `;
  }, [vehicle, isSelected, onClick]);

  useEffect(() => {
    if (!markerRef.current || vehicle.latitude === undefined || vehicle.longitude === undefined || vehicle.latitude === null || vehicle.longitude === null) return;
    
    const targetPos: [number, number] = [vehicle.longitude, vehicle.latitude];
    
    if (!posRef.current) {
      posRef.current = targetPos;
      markerRef.current.setLngLat(targetPos);
      return;
    }

    const startPos = [...posRef.current] as [number, number];
    // if target is the same as start, do nothing
    if (startPos[0] === targetPos[0] && startPos[1] === targetPos[1]) return;

    const duration = 3000;
    const startTime = performance.now();

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const t = Math.min(elapsed / duration, 1);
      
      const currentPos = interpolateLatLng(startPos, targetPos, t);
      if (markerRef.current) {
        markerRef.current.setLngLat(currentPos);
      }
      posRef.current = currentPos;

      if (t < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [vehicle.latitude, vehicle.longitude]);

  return null;
};
