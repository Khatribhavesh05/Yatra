import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import { publicApi } from '../api/publicApi';
import { ChargingCenter } from '../types';
import { MapContainer } from '../components/map/MapContainer';
import { ChargingMarker } from '../components/map/ChargingMarker';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { formatStationStatus, formatRelativeTime } from '../../src/utils/formatters';

export const ChargingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [station, setStation] = useState<ChargingCenter | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [map, setMap] = useState<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchStationData = async () => {
      try {
        setLoading(true);
        const data = await publicApi.getChargingCenterById(id);
        setStation(data);
      } catch (err) {
        console.error('Failed to load station details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStationData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <LoadingSpinner message="Loading verified charging center specifications..." />
      </div>
    );
  }

  if (!station) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <EmptyState
          icon="ev_station"
          title="Station Not Found"
          description="The requested charging center does not exist or is currently restricted."
          actionLabel="Back to Charging Directory"
          onAction={() => window.history.back()}
        />
      </div>
    );
  }

  const statusInfo = formatStationStatus(station.status);
  const connectors = station.connectors || {};
  const amenities = station.amenities || {};
  const connectorEntries = Object.entries(connectors);
  const amenityEntries = Object.entries(amenities);

  const centerCoordinates: [number, number] = [station.longitude, station.latitude];

  return (
    <div className="w-full py-10 bg-surface">
      <div className="max-w-container-max-width mx-auto px-gutter">
        {/* Header Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-6 font-medium">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to="/charging" className="hover:text-primary">Charging Centers</Link>
          <span>/</span>
          <span className="text-on-surface font-semibold truncate">{station.name}</span>
        </div>

        {/* Top Summary Card */}
        <div className="bg-white rounded-2xl border border-outline-variant p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                <Badge variant={station.status === 'operational' ? 'success' : 'warning'} size="md" dot>
                  {statusInfo.label}
                </Badge>
                {station.source && (
                  <span className="text-xs font-bold text-secondary bg-secondary-container px-2.5 py-1 rounded">
                    Source: {station.source}
                  </span>
                )}
                {station.last_verified_at && (
                  <span className="text-xs text-outline flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">verified</span>
                    Verified {formatRelativeTime(station.last_verified_at)}
                  </span>
                )}
              </div>

              <h1 className="font-display-lg text-2xl sm:text-3xl font-bold text-on-background">
                {station.name}
              </h1>

              <p className="font-body-md text-sm text-on-surface-variant mt-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-base">location_on</span>
                {station.address || `${station.city}, ${station.state} ${station.pincode || ''}`}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 bg-primary text-white px-5 py-3 rounded-lg text-sm font-label-bold hover:bg-on-primary-fixed-variant transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-lg">directions</span>
                Start Turn-by-Turn GPS
              </a>

              {station.contact_phone && (
                <a
                  href={`tel:${station.contact_phone}`}
                  className="inline-flex items-center justify-center gap-2 bg-surface-container hover:bg-surface-container-high border border-outline-variant px-4 py-3 rounded-lg text-sm font-label-bold text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-lg text-primary">call</span>
                  Call Station
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid: Specs + Live Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Side: Technical Specifications */}
          <div className="lg:col-span-7 space-y-6">
            {/* Charger Power & Connectors */}
            <div className="bg-white rounded-xl border border-outline-variant p-6 shadow-sm">
              <h2 className="font-headline-sm text-lg font-bold text-on-background mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">bolt</span>
                Charging Ports & Power Delivery
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/60">
                  <div className="text-xs font-label-bold uppercase text-outline">Max Station Output</div>
                  <div className="text-2xl font-extrabold text-primary mt-1 font-display">
                    {station.power_kw ? `${station.power_kw} kW` : 'Standard Rate'}
                  </div>
                  <div className="text-[11px] text-on-surface-variant mt-1">High-voltage DC fast charging capability</div>
                </div>

                <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/60">
                  <div className="text-xs font-label-bold uppercase text-outline">Operating Hours</div>
                  <div className="text-lg font-bold text-on-surface mt-1">
                    {station.operating_hours || '24 Hours Open'}
                  </div>
                  <div className="text-[11px] text-on-surface-variant mt-1">Public access without gate fee</div>
                </div>
              </div>

              {/* Supported Connector Types */}
              <div className="mt-6 pt-4 border-t border-outline-variant/40">
                <h3 className="text-xs font-label-bold uppercase tracking-wider text-outline mb-3">
                  Installed Connectors & Guns
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {connectorEntries.map(([type, count]) => (
                    <div
                      key={type}
                      className="p-3 rounded-lg border border-outline-variant/70 bg-surface-container-lowest flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                          <span className="material-symbols-outlined text-base">ev_station</span>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-on-background uppercase">
                            {type.replace(/_/g, ' ')}
                          </div>
                          <div className="text-[10px] text-on-surface-variant">Compatible EV standard</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold bg-surface-container px-2.5 py-1 rounded text-on-surface">
                        {String(count)} {count === 1 ? 'Port' : 'Ports'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Amenities & On-site Facilities */}
            <div className="bg-white rounded-xl border border-outline-variant p-6 shadow-sm">
              <h2 className="font-headline-sm text-lg font-bold text-on-background mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-xl">local_convenience_store</span>
                On-Site Facilities & Amenities
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {amenityEntries.map(([key, val]) => (
                  <div
                    key={key}
                    className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/60 flex items-center gap-2 text-xs font-medium text-on-surface"
                  >
                    <span className="material-symbols-outlined text-primary text-base">
                      {val ? 'check_circle' : 'cancel'}
                    </span>
                    <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            {station.description && (
              <div className="bg-white rounded-xl border border-outline-variant p-6 shadow-sm">
                <h2 className="font-headline-sm text-base font-bold text-on-background mb-2">
                  About this Station
                </h2>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  {station.description}
                </p>
              </div>
            )}
          </div>

          {/* Right Side: Interactive Location Map */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-xl border border-outline-variant p-4 shadow-sm h-[400px] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/60">
                <h3 className="font-headline-sm text-sm font-bold text-on-background">
                  Station Location Pin
                </h3>
                <span className="text-[11px] text-outline">
                  {station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}
                </span>
              </div>

              <div className="flex-1 mt-3 rounded-lg overflow-hidden relative">
                <MapContainer
                  center={centerCoordinates}
                  zoom={15}
                  onMapLoaded={(m) => setMap(m)}
                  className="w-full h-full"
                >
                  <ChargingMarker
                    map={map}
                    station={station}
                    isSelected={true}
                  />
                </MapContainer>
              </div>
            </div>

            {/* Emergency Charging Support Notice */}
            <div className="p-5 rounded-xl bg-secondary-container/40 border border-secondary/20">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary text-2xl">support_agent</span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-secondary">
                    Rajasthan EV Assistance Desk
                  </h4>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    Facing charger hardware issues or payment errors at this hub? Reach the state EV helpdesk for immediate dispatch.
                  </p>
                  <Link to="/help" className="inline-block text-xs font-bold text-primary mt-2 hover:underline">
                    View Emergency Contacts →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
