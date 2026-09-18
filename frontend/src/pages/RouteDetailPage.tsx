import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import { publicApi } from '../api/publicApi';
import { Route, VehiclePublic } from '../types';
import { MapContainer } from '../components/map/MapContainer';
import { RoutePolyline } from '../components/map/RoutePolyline';
import { StopMarker } from '../components/map/StopMarker';
import { VehicleMarker } from '../components/map/VehicleMarker';
import { MapControls } from '../components/map/MapControls';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Badge } from '../components/common/Badge';

export const RouteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [route, setRoute] = useState<Route | null>(null);
  const [buses, setBuses] = useState<VehiclePublic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [map, setMap] = useState<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchRouteData = async () => {
      try {
        setLoading(true);
        const [rData, bData] = await Promise.all([
          publicApi.getRouteById(id),
          publicApi.getVehicles({ route_id: id }).catch(() => []),
        ]);
        setRoute(rData);
        setBuses(bData);
      } catch (err) {
        console.error('Failed to load route details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRouteData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <LoadingSpinner message="Loading transit corridor and stop timetable..." />
      </div>
    );
  }

  if (!route) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <EmptyState
          icon="alt_route"
          title="Route Not Found"
          description="The requested transit route is not available or has been modified."
          actionLabel="Back to Bus Tracker"
          onAction={() => window.history.back()}
        />
      </div>
    );
  }

  const stops = route.stops || [];
  const mapCenter: [number, number] = stops.length > 0
    ? [stops[0].longitude, stops[0].latitude]
    : [73.3119, 28.0229];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-background">
      {/* Top Breadcrumb & Header */}
      <div className="bg-white border-b border-outline-variant px-6 py-4 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/bus"
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </Link>
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-sm"
            style={{ backgroundColor: route.color || '#006A3B' }}
          >
            <span className="text-xs">{route.code}</span>
          </div>
          <div>
            <h1 className="font-headline-sm text-lg font-bold text-on-background flex items-center gap-2">
              {route.name}
              <Badge variant="primary" size="sm">
                Active Line
              </Badge>
            </h1>
            <p className="text-xs text-on-surface-variant">
              {route.city}, {route.state} • {stops.length} Total Passenger Stops • {buses.length} Active E-Buses
            </p>
          </div>
        </div>

        <Link
          to={`/bus?route=${route.id}`}
          className="hidden sm:inline-flex items-center gap-1.5 bg-primary text-white text-xs font-label-bold px-3.5 py-2 rounded-lg hover:bg-on-primary-fixed-variant transition-colors"
        >
          <span className="material-symbols-outlined text-base">sensors</span>
          Live Stream
        </Link>
      </div>

      {/* Main Split View: Stops Timeline + Interactive Map */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side Panel: Ordered Stops List */}
        <div className="w-full lg:w-96 bg-white border-r border-outline-variant flex flex-col shrink-0 h-64 lg:h-full z-10 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-outline-variant/60 bg-surface-container-low flex items-center justify-between">
            <h2 className="font-label-bold text-xs uppercase tracking-wider text-on-surface">
              Route Stop Sequence
            </h2>
            <span className="text-xs font-semibold text-primary">
              {stops.length} Stops
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {stops.map((stop, idx) => {
              const isSelected = selectedStopId === stop.id;
              return (
                <div
                  key={stop.id}
                  onClick={() => {
                    setSelectedStopId(stop.id);
                    if (map) {
                      map.flyTo({ center: [stop.longitude, stop.latitude], zoom: 15, essential: true });
                    }
                  }}
                  className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-start gap-3 relative ${
                    isSelected
                      ? 'border-primary bg-primary-container/10 ring-1 ring-primary shadow-sm'
                      : 'border-outline-variant/70 bg-white hover:border-primary/50'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-headline-sm text-sm font-bold text-on-background">
                        {stop.name}
                      </h4>
                      <Link
                        to={`/stops/${stop.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[11px] text-primary font-bold hover:underline"
                      >
                        Details →
                      </Link>
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      {stop.address || `${stop.city}, ${stop.state}`}
                    </p>
                    {stop.distance_from_start_km !== undefined && (
                      <span className="inline-block text-[10px] text-outline font-semibold mt-1">
                        {stop.distance_from_start_km} km from origin
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Map Canvas */}
        <div className="flex-1 h-full relative">
          <MapContainer
            center={mapCenter}
            zoom={13}
            onMapLoaded={(m) => setMap(m)}
            className="w-full h-full"
          >
            {/* Route Polyline */}
            <RoutePolyline
              map={map}
              route={route}
              color={route.color || '#006A3B'}
              width={6}
            />

            {/* Stop Markers */}
            {stops.map((s, idx) => (
              <StopMarker
                key={s.id}
                map={map}
                stop={s}
                sequence={idx + 1}
                isSelected={selectedStopId === s.id}
                onClick={(clicked) => {
                  setSelectedStopId(clicked.id);
                }}
              />
            ))}

            {/* Active Vehicle Markers on this route */}
            {buses.map((b) => (
              <VehicleMarker
                key={b.id}
                map={map}
                vehicle={b}
              />
            ))}
          </MapContainer>

          <MapControls
            map={map}
            onResetView={() => {
              if (map) {
                map.flyTo({ center: mapCenter, zoom: 13, essential: true });
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
