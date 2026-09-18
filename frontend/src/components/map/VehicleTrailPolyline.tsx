import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { VehiclePublic, Route } from '../../types';

export interface VehicleTrailPolylineProps {
  map: maplibregl.Map | null;
  vehicle: VehiclePublic;
  route: Route | null;
}

export const VehicleTrailPolyline: React.FC<VehicleTrailPolylineProps> = ({ map, vehicle, route }) => {
  const animationRef = useRef<number | null>(null);
  const originMarkerRef = useRef<maplibregl.Marker | null>(null);
  const destMarkerRef = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    if (!map || !route || !route.geometry) return;

    let coordinates = (route.geometry as any).coordinates;
    if (!coordinates && Array.isArray(route.geometry)) {
      coordinates = route.geometry;
    }

    if (!coordinates || coordinates.length < 2) return;

    const sourceId = `vehicle-trail-source-${vehicle.id}`;
    const layerId = `vehicle-trail-layer-${vehicle.id}`;
    const casingLayerId = `vehicle-trail-casing-${vehicle.id}`;

    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates,
          },
        },
      });

      map.addLayer({
        id: casingLayerId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#FFFFFF',
          'line-width': 8,
          'line-opacity': 0.6,
        },
      });

      map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#006a3b',
          'line-width': 5,
          'line-opacity': 0.9,
          'line-dasharray': [0, 2, 2],
        },
      });
    }

    let step = 0;
    const animateDashArray = () => {
      const newStep = (step + 1) % 4;
      step = newStep;
      
      if (map.getLayer(layerId)) {
        map.setPaintProperty(layerId, 'line-dasharray', [0, 2, 2]); // Will update correctly next step
        // We can create a flowing effect by changing the dasharray
        const dashArray = [2, 2];
        // However, mapbox/maplibre doesn't have dash-offset, so we fake it by changing array pattern
        const pattern = step === 0 ? [0, 2, 2] : step === 1 ? [0, 1, 3] : step === 2 ? [1, 2, 1] : [2, 2, 0];
        map.setPaintProperty(layerId, 'line-dasharray', pattern);
      }
      animationRef.current = requestAnimationFrame(() => {
        setTimeout(animateDashArray, 100);
      });
    };
    
    animateDashArray();

    // Add origin and destination markers
    const originCoords = coordinates[0];
    const destCoords = coordinates[coordinates.length - 1];

    const originEl = document.createElement('div');
    originEl.className = 'w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white border-2 border-white shadow-md';
    originEl.innerHTML = '<span class="material-symbols-outlined text-[12px]">trip_origin</span>';
    originMarkerRef.current = new maplibregl.Marker({ element: originEl })
      .setLngLat(originCoords)
      .addTo(map);

    const destEl = document.createElement('div');
    destEl.className = 'w-6 h-6 rounded-full bg-error flex items-center justify-center text-white border-2 border-white shadow-md';
    destEl.innerHTML = '<span class="material-symbols-outlined text-[12px]">flag</span>';
    destMarkerRef.current = new maplibregl.Marker({ element: destEl })
      .setLngLat(destCoords)
      .addTo(map);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (originMarkerRef.current) originMarkerRef.current.remove();
      if (destMarkerRef.current) destMarkerRef.current.remove();
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getLayer(casingLayerId)) map.removeLayer(casingLayerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
  }, [map, vehicle.id, route]);

  return null;
};
