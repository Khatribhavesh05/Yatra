import { useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import { Route } from '../../types';

export interface RoutePolylineProps {
  map: maplibregl.Map | null;
  route: Route;
  color?: string;
  width?: number;
}

export const RoutePolyline: React.FC<RoutePolylineProps> = ({
  map,
  route,
  color = '#006A3B',
  width = 5,
}) => {
  useEffect(() => {
    if (!map || !route.geometry) return;

    const sourceId = `route-source-${route.id}`;
    const layerId = `route-layer-${route.id}`;
    const casingLayerId = `route-casing-${route.id}`;

    // Coordinates can be LineString or array of [lng, lat]
    let coordinates = (route.geometry as any).coordinates;
    if (!coordinates && Array.isArray(route.geometry)) {
      coordinates = route.geometry;
    }

    if (!coordinates || coordinates.length === 0) return;

    // Check if source already exists
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {
            id: route.id,
            name: route.name,
          },
          geometry: {
            type: 'LineString',
            coordinates,
          },
        },
      });

      // Add casing (outline) for high visibility
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
          'line-width': width + 3,
          'line-opacity': 0.8,
        },
      });

      // Add main polyline
      map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': route.color || color,
          'line-width': width,
          'line-opacity': 0.9,
        },
      });
    }

    return () => {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getLayer(casingLayerId)) map.removeLayer(casingLayerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
  }, [map, route.id, route.geometry, route.color, color, width]);

  return null;
};
