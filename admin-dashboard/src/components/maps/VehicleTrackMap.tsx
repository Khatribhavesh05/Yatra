import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { VehicleTrackPoint } from '../../types/api';

interface VehicleTrackMapProps {
  trackPoints: VehicleTrackPoint[];
  currentLat?: number;
  currentLng?: number;
  headingDeg?: number;
  speedKph?: number;
  vehicleCode?: string;
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

export default function VehicleTrackMap({
  trackPoints,
  currentLat,
  currentLng,
  headingDeg = 0,
  speedKph = 0,
  vehicleCode = 'EV',
}: VehicleTrackMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);
  const trailMarkersRef = useRef<maplibregl.Marker[]>([]);

  const [mapStyle, setMapStyle] = useState<'satellite' | 'dark'>('dark');

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current) return;

    if (!map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: OSM_RASTER_STYLE,
        center: [currentLng ?? 77.209, currentLat ?? 28.6139],
        zoom: 13,
        attributionControl: false,
      });

      map.current.addControl(new maplibregl.NavigationControl(), 'top-left');
      map.current.addControl(new maplibregl.AttributionControl({ compact: false }), 'bottom-right');

      const setupLayers = () => {
        if (!map.current) return;

        if (!map.current.getSource('route')) {
          map.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [],
              },
            },
          });

          // Casing layer for route contrast
          map.current.addLayer({
            id: 'route-casing',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#ffffff',
              'line-width': 7,
              'line-opacity': 0.7,
            },
          });

          // Main route polyline
          map.current.addLayer({
            id: 'route-line',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#10b981', // teal-500
              'line-width': 4.5,
              'line-opacity': 0.9,
            },
          });
        }
      };

      map.current.on('load', setupLayers);
    }
  }, [currentLat, currentLng]);

  // Handle Style Switching via canvas filter safely without CARTO API key
  useEffect(() => {
    if (!mapContainer.current) return;
    const canvas = mapContainer.current.querySelector('.maplibregl-canvas') as HTMLElement | null;
    if (!canvas) return;

    if (mapStyle === 'dark') {
      canvas.style.filter = 'invert(90%) hue-rotate(180deg) brightness(85%) contrast(110%)';
    } else {
      canvas.style.filter = 'none';
    }
  }, [mapStyle]);

  // Update track line, telemetry dots, and fit bounds
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    const coordinates = trackPoints
      .filter((pt) => pt.longitude != null && pt.latitude != null)
      .map((pt) => [pt.longitude, pt.latitude]);

    if (currentLng != null && currentLat != null) {
      coordinates.push([currentLng, currentLat]);
    }

    if (coordinates.length === 0) return;

    const source = map.current.getSource('route') as maplibregl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates,
        },
      });
    }

    // Clean up old trail dots
    trailMarkersRef.current.forEach((m) => m.remove());
    trailMarkersRef.current = [];

    // Render fading dots for the last 20 telemetry points
    const recentPoints = trackPoints.slice(-20);
    const totalRecent = recentPoints.length;

    recentPoints.forEach((pt, idx) => {
      if (pt.longitude == null || pt.latitude == null) return;

      const progress = (idx + 1) / totalRecent; // 0.05 to 1.0
      const opacity = 0.2 + progress * 0.7;
      const size = 6 + progress * 6; // 6px to 12px

      const dot = document.createElement('div');
      dot.className = 'rounded-full border border-white shadow-sm pointer-events-none transition-all';
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      dot.style.backgroundColor = `rgba(16, 185, 129, ${opacity})`;

      const m = new maplibregl.Marker({ element: dot, anchor: 'center' })
        .setLngLat([pt.longitude, pt.latitude])
        .addTo(map.current!);

      trailMarkersRef.current.push(m);
    });

    // Fit bounds to track
    if (coordinates.length > 1) {
      const bounds = new maplibregl.LngLatBounds(
        coordinates[0] as [number, number],
        coordinates[0] as [number, number]
      );

      coordinates.forEach((coord) => {
        bounds.extend(coord as [number, number]);
      });

      map.current.fitBounds(bounds, { padding: 50, maxZoom: 16 });
    } else if (coordinates.length === 1) {
      map.current.flyTo({ center: coordinates[0] as [number, number], zoom: 15 });
    }
  }, [trackPoints, currentLat, currentLng]);

  // Update current position marker with animated vehicle icon and heading pointer
  useEffect(() => {
    if (!map.current || currentLat == null || currentLng == null) return;

    if (!marker.current) {
      const el = document.createElement('div');
      el.className = 'relative flex flex-col items-center cursor-pointer';

      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="absolute -inset-2 rounded-full bg-teal-500/40 animate-ping"></div>
          <div style="
            width: 36px; height: 36px;
            background: #006a3b;
            border: 2.5px solid #ffffff;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            color: white;
          ">
            <span class="material-symbols-outlined" style="font-size: 20px; transform: rotate(${headingDeg}deg);">
              navigation
            </span>
          </div>
          <div style="
            position: absolute;
            top: -6px;
            width: 0; height: 0;
            border-left: 4px solid transparent;
            border-right: 4px solid transparent;
            border-bottom: 7px solid #006a3b;
            transform: rotate(${headingDeg}deg);
          "></div>
        </div>
        <div style="
          margin-top: 3px;
          background: rgba(15, 23, 42, 0.9);
          color: white;
          font-size: 10px;
          font-weight: 700;
          font-family: 'Work Sans', sans-serif;
          padding: 1px 6px;
          border-radius: 4px;
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">
          ${vehicleCode} • ${speedKph} km/h
        </div>
      `;

      marker.current = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([currentLng, currentLat])
        .addTo(map.current);
    } else {
      marker.current.setLngLat([currentLng, currentLat]);
      const el = marker.current.getElement();
      if (el) {
        const icon = el.querySelector('.material-symbols-outlined') as HTMLElement;
        if (icon) icon.style.transform = `rotate(${headingDeg}deg)`;
      }
    }
  }, [currentLat, currentLng, headingDeg, speedKph, vehicleCode]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-xl overflow-hidden" />

      {/* Floating Style Toggle */}
      <div className="absolute top-3 right-3 z-10 flex items-center bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 shadow-lg">
        <button
          onClick={() => setMapStyle('satellite')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
            mapStyle === 'satellite' ? 'bg-teal-600 text-white shadow' : 'text-slate-300 hover:text-white'
          }`}
        >
          Satellite
        </button>
        <button
          onClick={() => setMapStyle('dark')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
            mapStyle === 'dark' ? 'bg-teal-600 text-white shadow' : 'text-slate-300 hover:text-white'
          }`}
        >
          Dark Mode
        </button>
      </div>
    </div>
  );
}
