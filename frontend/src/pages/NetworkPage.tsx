import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import { useCity } from '../context/CityContext';
import { publicApi } from '../api/publicApi';
import { Route, Stop } from '../types';
import { MapContainer } from '../components/map/MapContainer';
import { RoutePolyline } from '../components/map/RoutePolyline';
import { StopMarker } from '../components/map/StopMarker';
import { MapControls } from '../components/map/MapControls';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const NetworkPage: React.FC = () => {
  const { selectedCity, activeCityObj, openCityModal } = useCity();

  const [routes, setRoutes] = useState<Route[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [map, setMap] = useState<maplibregl.Map | null>(null);

  useEffect(() => {
    const fetchNetworkData = async () => {
      try {
        setLoading(true);
        const [rData, sData] = await Promise.all([
          publicApi.getRoutes(selectedCity),
          publicApi.getStops(selectedCity),
        ]);
        setRoutes(rData);
        setStops(sData);
      } catch (err) {
        console.error('Failed to load transit network:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNetworkData();
  }, [selectedCity]);

  const cityCenter: [number, number] =
    activeCityObj?.longitude && activeCityObj?.latitude
      ? [activeCityObj.longitude, activeCityObj.latitude]
      : [73.3119, 28.0229];

  const handleRouteClick = (r: Route) => {
    setActiveRouteId(r.id === activeRouteId ? null : r.id);
    if (map && r.geometry) {
      const coords = (r.geometry as any).coordinates;
      if (coords && coords.length > 0) {
        const mid = coords[Math.floor(coords.length / 2)];
        map.flyTo({ center: mid, zoom: 13, essential: true });
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-background">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-outline-variant px-6 py-3 shrink-0 flex items-center justify-between z-10">
        <div>
          <h1 className="font-headline-sm text-lg font-bold text-on-background flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">alt_route</span>
            {selectedCity} Clean Transit Network
          </h1>
          <p className="text-xs text-on-surface-variant">
            {routes.length} Active Public Corridors • {stops.length} Passenger Interchanges
          </p>
        </div>

        <button
          onClick={openCityModal}
          className="flex items-center gap-1.5 bg-surface-container hover:bg-surface-container-high border border-outline-variant px-3 py-1.5 rounded-lg text-xs font-label-bold text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-primary text-sm">location_on</span>
          <span>{selectedCity}</span>
          <span className="text-primary hover:underline ml-1">Switch</span>
        </button>
      </div>

      {/* Main Split Layout: Network Lines Panel + Full Map */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Side: Route Lines */}
        <div className="w-full lg:w-96 bg-white border-r border-outline-variant flex flex-col shrink-0 h-64 lg:h-full z-10 shadow-sm overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/60">
            <span className="text-xs font-label-bold uppercase tracking-wider text-outline">
              Transit Corridors
            </span>
            <span className="text-xs text-on-surface-variant font-semibold">
              Select line to isolate
            </span>
          </div>

          {loading ? (
            <LoadingSpinner message="Rendering municipal corridor geometry..." />
          ) : (
            routes.map((route) => {
              const isSelected = activeRouteId === route.id;
              return (
                <div
                  key={route.id}
                  onClick={() => handleRouteClick(route)}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary-container/10 ring-2 ring-primary shadow-md'
                      : 'border-outline-variant/70 bg-white hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-sm"
                        style={{ backgroundColor: route.color || '#006A3B' }}
                      >
                        {route.code}
                      </div>
                      <div>
                        <h4 className="font-headline-sm text-sm font-bold text-on-background">
                          {route.name}
                        </h4>
                        <p className="text-[11px] text-on-surface-variant">
                          {route.stops?.length || 0} Connected Stops
                        </p>
                      </div>
                    </div>

                    <Link
                      to={`/routes/${route.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-full hover:bg-surface-container text-primary transition-colors"
                      title="Route timetable & stops"
                    >
                      <span className="material-symbols-outlined text-lg">open_in_new</span>
                    </Link>
                  </div>

                  {route.description && (
                    <p className="text-xs text-on-surface-variant mt-2 leading-relaxed line-clamp-2">
                      {route.description}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Map Canvas */}
        <div className="flex-1 h-full relative">
          <MapContainer
            center={cityCenter}
            zoom={12}
            onMapLoaded={(m) => setMap(m)}
            className="w-full h-full"
          >
            {/* Render all polylines */}
            {routes.map((r) => {
              const isSelected = activeRouteId === r.id;
              // If a route is selected, only render that one or make it prominent
              if (activeRouteId && !isSelected) return null;
              return (
                <RoutePolyline
                  key={r.id}
                  map={map}
                  route={r}
                  color={r.color || '#006A3B'}
                  width={isSelected ? 7 : 4}
                />
              );
            })}

            {/* Render Stops */}
            {stops.map((s, idx) => (
              <StopMarker
                key={s.id}
                map={map}
                stop={s}
                sequence={idx + 1}
              />
            ))}
          </MapContainer>

          <MapControls
            map={map}
            onResetView={() => {
              if (map) {
                map.flyTo({ center: cityCenter, zoom: 12, essential: true });
                setActiveRouteId(null);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
