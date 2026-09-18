import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import { useCity } from '../context/CityContext';
import { publicApi } from '../api/publicApi';
import { VehiclePublic, Route } from '../types';
import { MapContainer, TileStyle } from '../components/map/MapContainer';
import { VehicleMarker } from '../components/map/VehicleMarker';
import { RoutePolyline } from '../components/map/RoutePolyline';
import { VehicleTrailPolyline } from '../components/map/VehicleTrailPolyline';
import { MapControls } from '../components/map/MapControls';
import { MapStyleSwitcher } from '../components/map/MapStyleSwitcher';
import { BusCard } from '../components/cards/BusCard';
import { SearchBar } from '../components/common/SearchBar';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { haversineDistanceKm } from '../utils/polylineUtils';
import { formatRelativeTime } from '../utils/formatters';

export const WhereIsMyBusPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const { selectedCity, activeCityObj } = useCity();

  const [vehicles, setVehicles] = useState<VehiclePublic[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [selectedVehicle, setSelectedVehicle] = useState<VehiclePublic | null>(null);
  const [selectedVehicleRoute, setSelectedVehicleRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [map, setMap] = useState<maplibregl.Map | null>(null);

  // Map Tile Style
  const [tileStyle, setTileStyle] = useState<TileStyle>('osm');

  // Layout View Mode (Split vs Fullscreen)
  const [viewLayout, setViewLayout] = useState<'split' | 'fullscreen'>('split');

  // User Geolocation for "Near Me"
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);

  // WebSocket Connection States
  const [wsStatus, setWsStatus] = useState<'live' | 'reconnecting' | 'polling'>('polling');
  const [reconnectCount, setReconnectCount] = useState<number>(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const reconnectDelayRef = useRef<number>(1000);
  const maxReconnectDelay = 30000;

  // Initial Data Fetch
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [vData, rData] = await Promise.all([
          publicApi.getVehicles({ city: selectedCity }),
          publicApi.getRoutes(selectedCity),
        ]);
        if (isMounted) {
          setVehicles(vData);
          setRoutes(rData);
        }
      } catch (err) {
        console.error('Failed to load buses/routes:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [selectedCity]);

  // Fetch route geometry for selected vehicle
  useEffect(() => {
    if (!selectedVehicle?.route_id) {
      setSelectedVehicleRoute(null);
      return;
    }

    const matchedRoute = routes.find((r) => r.id === selectedVehicle.route_id);
    if (matchedRoute?.geometry) {
      setSelectedVehicleRoute(matchedRoute);
    } else {
      publicApi
        .getRouteById(selectedVehicle.route_id)
        .then((r) => setSelectedVehicleRoute(r))
        .catch(() => setSelectedVehicleRoute(matchedRoute || null));
    }
  }, [selectedVehicle, routes]);

  // WebSocket Connection with Exponential Backoff
  useEffect(() => {
    let isCancelled = false;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const routeParam = selectedRouteId !== 'all' ? `?route_id=${selectedRouteId}` : '';
    const wsUrl = `${protocol}//${host}/ws/public/vehicles${routeParam}`;

    function connect() {
      if (isCancelled) return;
      try {
        const socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          if (isCancelled) {
            socket.close();
            return;
          }
          setWsStatus('live');
          setReconnectCount(0);
          reconnectDelayRef.current = 1000;
        };

        socket.onmessage = (event) => {
          try {
            const liveList: VehiclePublic[] = JSON.parse(event.data);
            if (Array.isArray(liveList)) {
              setVehicles(liveList);
              if (selectedVehicle) {
                const updated = liveList.find((v) => v.id === selectedVehicle.id);
                if (updated) setSelectedVehicle(updated);
              }
            }
          } catch (e) {
            console.error('WS Parse Error:', e);
          }
        };

        socket.onerror = () => {
          socket.close();
        };

        socket.onclose = () => {
          if (isCancelled) return;
          setWsStatus('reconnecting');
          setReconnectCount((prev) => prev + 1);

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelayRef.current);

          reconnectDelayRef.current = Math.min(reconnectDelayRef.current * 2, maxReconnectDelay);
        };
      } catch (e) {
        setWsStatus('polling');
      }
    }

    connect();

    // Fallback polling interval
    const pollingInterval = setInterval(async () => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        try {
          const vData = await publicApi.getVehicles({
            city: selectedCity,
            route_id: selectedRouteId !== 'all' ? selectedRouteId : undefined,
          });
          setVehicles(vData);
        } catch (e) {
          // ignore
        }
      }
    }, 4000);

    return () => {
      isCancelled = true;
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      clearInterval(pollingInterval);
    };
  }, [selectedCity, selectedRouteId]);

  // Handle User Geolocation / Near Me
  const handleNearMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const coords: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        setUserLocation(coords);

        if (map) {
          map.flyTo({ center: coords, zoom: 14, duration: 1500 });
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation failed:', err.message);
        alert('Could not retrieve your location. Please check browser permissions.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Add/update blue pulsing marker for user location
  useEffect(() => {
    if (!map || !userLocation) return;

    if (!userMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'relative flex items-center justify-center';
      el.innerHTML = `
        <div class="absolute -inset-2 rounded-full bg-blue-500/30 animate-ping"></div>
        <div class="w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
          <span class="material-symbols-outlined text-xs font-bold">person_pin</span>
        </div>
      `;
      userMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat(userLocation)
        .addTo(map);
    } else {
      userMarkerRef.current.setLngLat(userLocation);
    }

    return () => {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
    };
  }, [map, userLocation]);

  // Filter and sort vehicles (by distance if user location is available)
  const filteredVehicles = useMemo(() => {
    const list = vehicles.filter((v) => {
      const matchesRoute =
        selectedRouteId === 'all' || v.route_id === selectedRouteId;
      const matchesSearch = searchQuery
        ? (v.vehicle_code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (v.route_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (v.route_code || '').toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesRoute && matchesSearch;
    });

    if (userLocation) {
      const [uLng, uLat] = userLocation;
      return list
        .map((v) => {
          let dist = Infinity;
          if (v.latitude != null && v.longitude != null) {
            dist = haversineDistanceKm(uLat, uLng, v.latitude, v.longitude);
          }
          return { ...v, _distanceKm: dist };
        })
        .sort((a, b) => (a._distanceKm || 0) - (b._distanceKm || 0));
    }

    return list;
  }, [vehicles, selectedRouteId, searchQuery, userLocation]);

  const onlineCount = filteredVehicles.filter((v) => v.status === 'online').length;
  const offlineCount = filteredVehicles.length - onlineCount;

  const handleSelectVehicle = (vehicle: VehiclePublic) => {
    setSelectedVehicle((prev) => (prev?.id === vehicle.id ? null : vehicle));
    if (map && vehicle.longitude && vehicle.latitude) {
      map.flyTo({
        center: [vehicle.longitude, vehicle.latitude],
        zoom: 15,
        essential: true,
      });
    }
  };

  const selectedRouteObj = routes.find((r) => r.id === selectedRouteId);

  const cityCenter: [number, number] =
    activeCityObj?.longitude && activeCityObj?.latitude
      ? [activeCityObj.longitude, activeCityObj.latitude]
      : [73.3119, 28.0229];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-background">
      {/* Top Filter Bar */}
      <div className="bg-white border-b border-outline-variant px-4 py-3 shrink-0 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-3 flex-1 min-w-[240px] max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={`Search ${selectedCity} electric buses...`}
            className="w-full"
          />
        </div>

        {/* Route Selector & Fleet Counts */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Online/Offline Fleet Badge */}
          <div className="inline-flex items-center gap-2 bg-surface-container-low border border-outline-variant px-3 py-1.5 rounded-lg text-xs font-label-bold">
            <span className="text-primary flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary inline-block" />
              {onlineCount} Online
            </span>
            <span className="text-outline">·</span>
            <span className="text-outline flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-outline inline-block" />
              {offlineCount} Offline
            </span>
          </div>

          {/* Near Me Action */}
          <button
            onClick={handleNearMe}
            disabled={isLocating}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-label-bold border transition-colors ${
              userLocation
                ? 'bg-blue-50 border-blue-400 text-blue-700'
                : 'bg-surface-container-low border-outline-variant text-on-surface hover:bg-surface-container'
            }`}
            title="Sort buses by distance from your current location"
          >
            <span className="material-symbols-outlined text-sm">
              {isLocating ? 'hourglass_top' : 'near_me'}
            </span>
            <span>{isLocating ? 'Locating...' : userLocation ? 'Near Me (Active)' : 'Near Me'}</span>
          </button>

          {/* Route Selector Dropdown */}
          <select
            value={selectedRouteId}
            onChange={(e) => setSelectedRouteId(e.target.value)}
            className="bg-surface-container-low border border-outline-variant rounded-lg text-xs font-semibold px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="all">All Routes ({routes.length})</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.code} - {r.name}
              </option>
            ))}
          </select>

          {/* Fullscreen View Toggle */}
          <button
            onClick={() => setViewLayout((prev) => (prev === 'split' ? 'fullscreen' : 'split'))}
            className={`p-2 rounded-lg border border-outline-variant transition-colors flex items-center justify-center ${
              viewLayout === 'fullscreen'
                ? 'bg-primary text-white border-primary'
                : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
            }`}
            title={viewLayout === 'fullscreen' ? 'Switch to Split View' : 'Full-Screen Map Mode'}
          >
            <span className="material-symbols-outlined text-base">
              {viewLayout === 'fullscreen' ? 'view_sidebar' : 'fullscreen'}
            </span>
          </button>

          {/* Live Status Indicator */}
          <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/60">
            {wsStatus === 'live' ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                  Live Stream
                </span>
              </>
            ) : wsStatus === 'reconnecting' ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                  Reconnecting ({reconnectCount})
                </span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-error" />
                <span className="text-[11px] font-bold text-error uppercase tracking-wider">
                  Polling (HTTP)
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar + Interactive Map */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Side Panel: Buses List (Hidden in fullscreen mode) */}
        {viewLayout === 'split' && (
          <div className="w-full lg:w-96 bg-white border-r border-outline-variant flex flex-col shrink-0 h-64 lg:h-full z-10 shadow-sm overflow-hidden animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b border-outline-variant/60 bg-surface-container-low flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">directions_bus</span>
                <h2 className="font-headline-sm text-sm font-bold text-on-background">
                  Active E-Buses ({filteredVehicles.length})
                </h2>
              </div>
              <span className="text-[11px] text-on-surface-variant font-medium">
                {selectedCity} Transit
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <LoadingSpinner message="Locating electric buses on the city grid..." />
              ) : filteredVehicles.length === 0 ? (
                <EmptyState
                  icon="directions_bus_filled"
                  title="No Buses Found"
                  description={
                    searchQuery
                      ? `No buses match "${searchQuery}". Try a different bus number or clear your filter.`
                      : 'No active buses on this route currently.'
                  }
                  actionLabel="Clear Filter"
                  onAction={() => {
                    setSearchQuery('');
                    setSelectedRouteId('all');
                  }}
                />
              ) : (
                filteredVehicles.map((vehicle: any) => (
                  <div key={vehicle.id} className="relative">
                    <BusCard
                      vehicle={vehicle}
                      isSelected={selectedVehicle?.id === vehicle.id}
                      onSelect={() => handleSelectVehicle(vehicle)}
                    />
                    {vehicle._distanceKm !== undefined && vehicle._distanceKm !== Infinity && (
                      <div className="absolute top-3 right-3 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full pointer-events-none">
                        {vehicle._distanceKm < 1
                          ? `${Math.round(vehicle._distanceKm * 1000)} m away`
                          : `${vehicle._distanceKm.toFixed(1)} km away`}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Right Map Canvas */}
        <div className="flex-1 h-full relative">
          <MapContainer
            center={cityCenter}
            zoom={13}
            tileStyle={tileStyle}
            onMapLoaded={(m) => setMap(m)}
            className="w-full h-full"
          >
            {/* Render Route Polyline if selected from dropdown */}
            {selectedRouteObj && !selectedVehicle && (
              <RoutePolyline
                map={map}
                route={selectedRouteObj}
                color={selectedRouteObj.color || '#006A3B'}
              />
            )}

            {/* Render Vehicle Trail Polyline if a specific vehicle is selected */}
            {selectedVehicle && (
              <VehicleTrailPolyline
                map={map}
                vehicle={selectedVehicle}
                route={selectedVehicleRoute}
              />
            )}

            {/* Render Vehicle Markers */}
            {filteredVehicles.map((vehicle) => (
              <VehicleMarker
                key={vehicle.id}
                map={map}
                vehicle={vehicle}
                isSelected={selectedVehicle?.id === vehicle.id}
                onClick={handleSelectVehicle}
              />
            ))}
          </MapContainer>

          {/* Map Tile Style Switcher */}
          <MapStyleSwitcher activeStyle={tileStyle} onStyleChange={setTileStyle} />

          {/* Map Controls (Locate & Reset) */}
          <MapControls
            map={map}
            onLocateMe={handleNearMe}
            onResetView={() => {
              if (map) {
                map.flyTo({ center: cityCenter, zoom: 13, essential: true });
              }
            }}
          />

          {/* Floating Vehicle HUD for Selected Vehicle */}
          {selectedVehicle && (
            <div
              className={`absolute left-4 right-4 sm:left-auto sm:right-4 z-20 transition-all duration-300 animate-in slide-in-from-bottom ${
                viewLayout === 'fullscreen'
                  ? 'bottom-6 sm:w-96 bg-white/95 backdrop-blur-md border border-outline-variant rounded-2xl shadow-2xl p-5'
                  : 'bottom-6 sm:w-80 bg-white rounded-xl shadow-2xl border border-outline-variant p-4'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-headline-sm text-lg font-bold text-on-background">
                      {selectedVehicle.vehicle_code || 'Electric Bus'}
                    </span>
                    <Badge
                      variant={selectedVehicle.status === 'online' ? 'success' : 'neutral'}
                      size="sm"
                      dot
                    >
                      {selectedVehicle.status === 'online' ? 'LIVE' : 'IDLE'}
                    </Badge>
                  </div>
                  <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                    {selectedVehicle.route_name
                      ? `${selectedVehicle.route_code || ''} • ${selectedVehicle.route_name}`
                      : selectedVehicle.department_name}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedVehicle(null)}
                  className="p-1 text-outline hover:text-on-background rounded-full hover:bg-surface-container transition-colors"
                  title="Close HUD"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              {/* Gauge & Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 my-3 pt-3 border-t border-outline-variant/40 text-center">
                {/* Speed Gauge */}
                <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40">
                  <div className="text-[10px] uppercase font-bold text-outline">Speed</div>
                  <div className="text-sm font-bold text-primary mt-0.5 flex items-center justify-center gap-0.5">
                    <span className="material-symbols-outlined text-sm">speed</span>
                    {selectedVehicle.speed_kph || 0}
                    <span className="text-[9px] font-normal text-outline">km/h</span>
                  </div>
                </div>

                {/* Battery SOC */}
                <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40">
                  <div className="text-[10px] uppercase font-bold text-outline">Battery SOC</div>
                  <div
                    className={`text-sm font-bold mt-0.5 flex items-center justify-center gap-0.5 ${
                      (selectedVehicle.soc_pct ?? 100) > 50
                        ? 'text-primary'
                        : (selectedVehicle.soc_pct ?? 100) > 20
                        ? 'text-amber-600'
                        : 'text-error'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">battery_charging_full</span>
                    {selectedVehicle.soc_pct ?? 0}%
                  </div>
                </div>

                {/* Heading / Direction */}
                <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40">
                  <div className="text-[10px] uppercase font-bold text-outline">Direction</div>
                  <div className="text-xs font-bold text-on-surface mt-1 truncate">
                    {selectedVehicle.direction || 'Inbound'}
                  </div>
                </div>
              </div>

              {/* Color-coded Battery Progress Bar */}
              <div className="mb-3">
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      (selectedVehicle.soc_pct ?? 100) > 50
                        ? 'bg-primary'
                        : (selectedVehicle.soc_pct ?? 100) > 20
                        ? 'bg-amber-500'
                        : 'bg-error'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, selectedVehicle.soc_pct ?? 0))}%` }}
                  />
                </div>
              </div>

              {/* Footer with Last Updated */}
              <div className="flex items-center justify-between text-[11px] text-outline pt-2 border-t border-outline-variant/30">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">schedule</span>
                  Updated {formatRelativeTime(selectedVehicle.last_updated_at)}
                </span>
                {viewLayout === 'fullscreen' && (
                  <button
                    onClick={() => setViewLayout('split')}
                    className="text-primary font-bold hover:underline text-[11px]"
                  >
                    Show Sidebar
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhereIsMyBusPage;
