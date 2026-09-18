import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import { publicApi } from '../api/publicApi';
import { StopDetail, VehiclePublic } from '../types';
import { MapContainer } from '../components/map/MapContainer';
import { StopMarker } from '../components/map/StopMarker';
import { VehicleMarker } from '../components/map/VehicleMarker';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Badge } from '../components/common/Badge';

export const StopDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [stop, setStop] = useState<StopDetail | null>(null);
  const [passingBuses, setPassingBuses] = useState<VehiclePublic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [map, setMap] = useState<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchStopData = async () => {
      try {
        setLoading(true);
        const stopData = await publicApi.getStopById(id);
        setStop(stopData);

        // Fetch passing buses if any routes serve this stop
        if (stopData.serving_routes && stopData.serving_routes.length > 0) {
          const routeIds = stopData.serving_routes.map((r) => r.id);
          const allBuses = await publicApi.getVehicles({ city: stopData.city });
          const matchedBuses = allBuses.filter((b) => b.route_id && routeIds.includes(b.route_id));
          setPassingBuses(matchedBuses);
        }
      } catch (err) {
        console.error('Failed to load stop details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStopData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <LoadingSpinner message="Loading stop schedule and arriving transit lines..." />
      </div>
    );
  }

  if (!stop) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <EmptyState
          icon="pin_drop"
          title="Stop Not Found"
          description="The requested transit stop could not be found or has been deactivated."
          actionLabel="Back to Bus Tracker"
          onAction={() => window.history.back()}
        />
      </div>
    );
  }

  const stopCenter: [number, number] = [stop.longitude, stop.latitude];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-background">
      {/* Header */}
      <div className="bg-white border-b border-outline-variant px-6 py-4 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/bus"
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline-sm text-lg font-bold text-on-background">
                {stop.name}
              </h1>
              {stop.code && (
                <Badge variant="secondary" size="sm">
                  {stop.code}
                </Badge>
              )}
            </div>
            <p className="text-xs text-on-surface-variant">
              {stop.address || `${stop.city}, ${stop.state}`}
            </p>
          </div>
        </div>

        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-label-bold px-3.5 py-2 rounded-lg hover:bg-on-primary-fixed-variant transition-colors"
        >
          <span className="material-symbols-outlined text-base">directions_walk</span>
          Directions
        </a>
      </div>

      {/* Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Serving Lines & Arriving Buses */}
        <div className="w-full lg:w-96 bg-white border-r border-outline-variant flex flex-col shrink-0 h-64 lg:h-full z-10 shadow-sm overflow-y-auto p-4 space-y-6">
          {/* Serving Transit Routes */}
          <div>
            <h3 className="font-label-bold text-xs uppercase tracking-wider text-outline mb-3">
              Serving Transit Lines ({stop.serving_routes?.length || 0})
            </h3>
            <div className="space-y-2.5">
              {stop.serving_routes && stop.serving_routes.length > 0 ? (
                stop.serving_routes.map((r) => (
                  <Link
                    key={r.id}
                    to={`/routes/${r.id}`}
                    className="p-3 rounded-lg border border-outline-variant/60 bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center font-bold text-white text-xs"
                        style={{ backgroundColor: r.color || '#006A3B' }}
                      >
                        {r.code}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-on-background">{r.name}</div>
                        <div className="text-[10px] text-on-surface-variant">Click to view full corridor</div>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-outline text-lg">chevron_right</span>
                  </Link>
                ))
              ) : (
                <div className="text-xs text-on-surface-variant p-3 bg-surface-container rounded-lg">
                  No scheduled routes currently mapped to this stop.
                </div>
              )}
            </div>
          </div>

          {/* Real-Time Approaching Buses */}
          <div>
            <h3 className="font-label-bold text-xs uppercase tracking-wider text-outline mb-3">
              Live Approaching Buses ({passingBuses.length})
            </h3>
            <div className="space-y-2.5">
              {passingBuses.length > 0 ? (
                passingBuses.map((bus) => (
                  <div
                    key={bus.id}
                    className="p-3 rounded-lg border border-outline-variant bg-surface-container-lowest flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-primary text-xl">directions_bus</span>
                      <div>
                        <div className="text-xs font-bold text-on-background">{bus.vehicle_code}</div>
                        <div className="text-[10px] text-on-surface-variant">{bus.route_name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="success" size="sm" dot>
                        {bus.speed_kph ? `${bus.speed_kph} km/h` : 'LIVE'}
                      </Badge>
                      <div className="text-[10px] text-outline mt-0.5">{bus.direction || 'Inbound'}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-on-surface-variant p-3 bg-surface-container-low rounded-lg text-center">
                  No active e-buses approaching this stop currently.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Map Canvas */}
        <div className="flex-1 h-full relative">
          <MapContainer
            center={stopCenter}
            zoom={15}
            onMapLoaded={(m) => setMap(m)}
            className="w-full h-full"
          >
            {/* Stop Marker */}
            <StopMarker
              map={map}
              stop={stop}
              isSelected={true}
            />

            {/* Passing Vehicle Markers */}
            {passingBuses.map((b) => (
              <VehicleMarker
                key={b.id}
                map={map}
                vehicle={b}
              />
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};
