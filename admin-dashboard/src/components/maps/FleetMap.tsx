import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { VehicleWithTelemetryResponse } from '../../types/api';
import { getVehicleStatus } from '../../utils/formatters';

interface FleetMapProps {
  vehicles: VehicleWithTelemetryResponse[];
  selectedVehicleId: string | null;
  onSelectVehicle: (id: string | null) => void;
}

const OSM_RASTER_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'osm-tiles': {
      type: 'raster',
      tiles: [
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>',
    },
  },
  layers: [
    {
      id: 'osm-layer',
      type: 'raster',
      source: 'osm-tiles',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

const getVehicleIcon = (type: string) => {
  switch (type) {
    case 'electric_bus':
      return 'directions_bus';
    case 'fire_ev':
      return 'local_fire_department';
    case 'ambulance_ev':
      return 'emergency';
    case 'utility_ev':
      return 'electric_bolt';
    default:
      return 'navigation';
  }
};

function lerpLngLat(
  start: [number, number],
  end: [number, number],
  t: number
): [number, number] {
  return [
    start[0] + (end[0] - start[0]) * t,
    start[1] + (end[1] - start[1]) * t,
  ];
}

export default function FleetMap({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
}: FleetMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<{ [id: string]: maplibregl.Marker }>({});
  const markerElements = useRef<{ [id: string]: HTMLDivElement }>({});
  const markerPositions = useRef<{ [id: string]: [number, number] }>({});
  const animFrames = useRef<{ [id: string]: number }>({});
  const hasInitialFitted = useRef(false);
  const activeStyle = useRef<'dark' | 'satellite'>('dark');

  const [mapStyle, setMapStyle] = useState<'satellite' | 'dark'>('dark');
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize Map instance once
  useEffect(() => {
    if (!mapContainer.current) return;

    if (!map.current) {
      const mapInstance = new maplibregl.Map({
        container: mapContainer.current,
        style: OSM_RASTER_STYLE,
        center: [77.2090, 28.6139],
        zoom: 10,
        attributionControl: false,
      });

      mapInstance.addControl(new maplibregl.NavigationControl(), 'top-left');
      mapInstance.addControl(new maplibregl.AttributionControl({ compact: false }), 'bottom-right');

      mapInstance.on('load', () => {
        setIsLoaded(true);
        mapInstance.resize();
      });

      mapInstance.on('click', (e: maplibregl.MapMouseEvent) => {
        if (e.originalEvent.target instanceof HTMLCanvasElement) {
          onSelectVehicle(null);
        }
      });

      map.current = mapInstance;
    }

    const resizeTimer = setTimeout(() => {
      if (map.current) {
        map.current.resize();
      }
    }, 250);

    return () => clearTimeout(resizeTimer);
  }, [onSelectVehicle]);

  // Handle Dark / Street Map canvas filter safely without requiring CARTO API key
  useEffect(() => {
    if (!mapContainer.current || !isLoaded) return;
    const canvas = mapContainer.current.querySelector('.maplibregl-canvas') as HTMLElement | null;
    if (!canvas) return;

    activeStyle.current = mapStyle;
    if (mapStyle === 'dark') {
      canvas.style.filter = 'invert(90%) hue-rotate(180deg) brightness(85%) contrast(110%)';
    } else {
      canvas.style.filter = 'none';
    }
  }, [mapStyle, isLoaded]);

  // Update Markers & Fit Bounds safely when map is loaded
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    const currentIds = new Set(vehicles.map((v) => v.id));

    // Remove obsolete markers
    Object.keys(markers.current).forEach((id) => {
      if (!currentIds.has(id)) {
        if (animFrames.current[id]) {
          cancelAnimationFrame(animFrames.current[id]);
          delete animFrames.current[id];
        }
        markers.current[id]?.remove();
        delete markers.current[id];
        delete markerElements.current[id];
        delete markerPositions.current[id];
      }
    });

    // Auto-fit bounds on initial load if valid vehicle coordinates exist
    const validVehicles = vehicles.filter(
      (v) =>
        v.latitude != null &&
        v.longitude != null &&
        !isNaN(v.latitude) &&
        !isNaN(v.longitude) &&
        v.latitude !== 0 &&
        v.longitude !== 0
    );

    if (validVehicles.length > 0 && !hasInitialFitted.current) {
      const bounds = new maplibregl.LngLatBounds();
      validVehicles.forEach((v) => {
        bounds.extend([v.longitude!, v.latitude!]);
      });
      map.current.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 800 });
      hasInitialFitted.current = true;
    }

    // Add or update markers
    vehicles.forEach((vehicle) => {
      if (
        vehicle.latitude == null ||
        vehicle.longitude == null ||
        isNaN(vehicle.latitude) ||
        isNaN(vehicle.longitude)
      ) {
        return;
      }

      const targetLngLat: [number, number] = [vehicle.longitude, vehicle.latitude];
      const status = getVehicleStatus(vehicle);
      const isSelected = vehicle.id === selectedVehicleId;
      const isOnline = status === 'active';
      const isCharging = status === 'charging';
      const heading = vehicle.heading_deg || 0;
      const icon = getVehicleIcon(vehicle.vehicle_type);

      let bgColor = '#eab308'; // idle / warning
      let ringColor = 'rgba(234, 179, 8, 0.4)';
      if (isOnline) {
        bgColor = '#0d9488'; // teal
        ringColor = 'rgba(13, 148, 136, 0.5)';
      } else if (isCharging) {
        bgColor = '#3b82f6'; // blue
        ringColor = 'rgba(59, 130, 246, 0.5)';
      } else if (status === 'offline') {
        bgColor = '#64748b'; // slate
        ringColor = 'transparent';
      }

      if (isSelected) {
        bgColor = '#dc2626'; // selected red
        ringColor = 'rgba(220, 38, 38, 0.6)';
      }

      if (!markers.current[vehicle.id]) {
        const el = document.createElement('div');
        el.className = 'group relative flex flex-col items-center cursor-pointer transition-transform duration-300';
        el.style.zIndex = isSelected ? '30' : '10';

        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            ${
              isOnline || isCharging || isSelected
                ? `<div class="absolute -inset-1.5 rounded-full animate-ping pointer-events-none" style="background: ${ringColor}; animation-duration: ${
                    isCharging ? '3s' : '2s'
                  };"></div>`
                : ''
            }
            <div style="
              width: 32px; height: 32px;
              background: ${bgColor};
              border: 2px solid ${isSelected ? '#ffffff' : 'rgba(255,255,255,0.9)'};
              border-radius: 50%;
              display: flex; align-items: center; justify-content: center;
              box-shadow: 0 4px 12px rgba(0,0,0,0.4);
              color: white;
            ">
              <span class="material-symbols-outlined" style="font-size: 18px; transform: rotate(${heading}deg);">
                ${icon}
              </span>
            </div>
            <div style="
              position: absolute;
              top: -6px;
              width: 0; height: 0;
              border-left: 4px solid transparent;
              border-right: 4px solid transparent;
              border-bottom: 6px solid ${bgColor};
              transform-origin: center 22px;
              transform: rotate(${heading}deg);
            "></div>
          </div>
          <div style="
            margin-top: 3px;
            background: rgba(15, 23, 42, 0.9);
            color: #ffffff;
            font-size: 9.5px;
            font-weight: 700;
            font-family: 'Plus Jakarta Sans', sans-serif;
            padding: 2px 6px;
            border-radius: 4px;
            white-space: nowrap;
            letter-spacing: 0.3px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          ">
            ${vehicle.vehicle_code}
          </div>
        `;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelectVehicle(vehicle.id);
        });

        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat(targetLngLat)
          .addTo(map.current!);

        markers.current[vehicle.id] = marker;
        markerElements.current[vehicle.id] = el;
        markerPositions.current[vehicle.id] = targetLngLat;
      } else {
        const el = markerElements.current[vehicle.id];
        if (el) {
          el.style.zIndex = isSelected ? '30' : '10';
        }

        const currentPos = markerPositions.current[vehicle.id] || targetLngLat;
        if (
          currentPos[0] !== targetLngLat[0] ||
          currentPos[1] !== targetLngLat[1]
        ) {
          if (animFrames.current[vehicle.id]) {
            cancelAnimationFrame(animFrames.current[vehicle.id]);
          }

          const startPos = [...currentPos] as [number, number];
          const startTime = performance.now();
          const duration = 2000;

          const animate = (time: number) => {
            const elapsed = time - startTime;
            const t = Math.min(elapsed / duration, 1);
            const interpolated = lerpLngLat(startPos, targetLngLat, t);

            markers.current[vehicle.id]?.setLngLat(interpolated);
            markerPositions.current[vehicle.id] = interpolated;

            if (t < 1) {
              animFrames.current[vehicle.id] = requestAnimationFrame(animate);
            } else {
              delete animFrames.current[vehicle.id];
            }
          };

          animFrames.current[vehicle.id] = requestAnimationFrame(animate);
        }
      }
    });

    // Fly to selected vehicle
    if (selectedVehicleId && markers.current[selectedVehicleId]) {
      const selected = vehicles.find((v) => v.id === selectedVehicleId);
      if (selected?.longitude && selected?.latitude) {
        map.current.flyTo({
          center: [selected.longitude, selected.latitude],
          zoom: 14,
          speed: 1.2,
        });
      }
    }
  }, [vehicles, selectedVehicleId, onSelectVehicle, isLoaded]);

  return (
    <div className="relative w-full h-full min-h-[450px]">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full min-h-[450px]" />

      {/* Floating Map Style Switcher */}
      <div className="absolute top-4 right-4 z-20 flex items-center bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 shadow-2xl">
        <button
          onClick={() => setMapStyle('satellite')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            mapStyle === 'satellite'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-sm">map</span>
          Street Map
        </button>
        <button
          onClick={() => setMapStyle('dark')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            mapStyle === 'dark'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-sm">dark_mode</span>
          Dark Mode
        </button>
      </div>
    </div>
  );
}

