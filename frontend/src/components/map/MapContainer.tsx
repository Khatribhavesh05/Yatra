import React, { useEffect, useRef, useState, ReactNode } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// OpenStreetMap Raster Style Specification (zero API key, crystal clear rendering)
export const OSM_RASTER_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'osm-tiles': {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm-tiles-layer',
      type: 'raster',
      source: 'osm-tiles',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

export const CARTO_VOYAGER_STYLE = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

export const CARTO_DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

export const SATELLITE_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'satellite-tiles': {
      type: 'raster',
      tiles: ['https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'],
      tileSize: 256,
      attribution: '© Google',
    },
  },
  layers: [
    {
      id: 'satellite-tiles-layer',
      type: 'raster',
      source: 'satellite-tiles',
      minzoom: 0,
      maxzoom: 20,
    },
  ],
};

export type TileStyle = 'osm' | 'carto_voyager' | 'carto_dark' | 'satellite';

export function getStyleSpec(style: TileStyle): string | maplibregl.StyleSpecification {
  switch (style) {
    case 'carto_voyager':
      return CARTO_VOYAGER_STYLE;
    case 'carto_dark':
      return CARTO_DARK_STYLE;
    case 'satellite':
      return SATELLITE_STYLE;
    case 'osm':
    default:
      return OSM_RASTER_STYLE;
  }
}

export interface MapContainerProps {
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  className?: string;
  tileStyle?: TileStyle;
  onMapLoaded?: (map: maplibregl.Map) => void;
  children?: ReactNode;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  center = [73.3119, 28.0229], // Default Bikaner [lng, lat]
  zoom = 12,
  minZoom = 4,
  maxZoom = 18,
  className = 'w-full h-full min-h-[400px]',
  tileStyle = 'osm',
  onMapLoaded,
  children,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: getStyleSpec(tileStyle),
        center,
        zoom,
        minZoom,
        maxZoom,
        attributionControl: false,
      });
    } catch (err) {
      console.error('Failed to initialize map:', err);
      setMapError(true);
      return;
    }

    // Add navigation controls (zoom in/out, compass)
    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    map.on('error', (e) => {
      console.error('Map error:', e?.error);
    });

    map.on('load', () => {
      mapInstanceRef.current = map;
      setMapReady(true);
      if (onMapLoaded) {
        onMapLoaded(map);
      }
    });

    // Resize map when window or container resizes
    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (mapError || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const handleStyleLoad = () => {
      map.resize();
    };

    map.setStyle(getStyleSpec(tileStyle));
    map.once('style.load', handleStyleLoad);
  }, [tileStyle]);

  // Update center when center prop changes significantly
  useEffect(() => {
    if (mapError || !mapInstanceRef.current || !center) return;
    mapInstanceRef.current.flyTo({
      center,
      zoom: zoom || mapInstanceRef.current.getZoom(),
      essential: true,
    });
  }, [center[0], center[1], zoom]);

  if (mapError) {
    return (
      <div className={`relative overflow-hidden flex flex-col items-center justify-center gap-2 bg-surface-low text-center p-8 ${className}`}>
        <span className="material-symbols-outlined text-4xl text-outline">map</span>
        <p className="text-sm font-semibold text-on-surface">Map unavailable in this browser</p>
        <p className="text-xs text-on-surface-variant max-w-xs">
          Live map rendering requires WebGL support. Please try a different browser or device.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full" />
      {mapReady && children}
    </div>
  );
};
