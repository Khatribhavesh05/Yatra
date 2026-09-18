import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import { useCity } from '../context/CityContext';
import { publicApi } from '../api/publicApi';
import { ChargingCenter } from '../types';
import { MapContainer, TileStyle } from '../components/map/MapContainer';
import { MapControls } from '../components/map/MapControls';
import { MapStyleSwitcher } from '../components/map/MapStyleSwitcher';
import { ChargingCard } from '../components/cards/ChargingCard';
import { SearchBar } from '../components/common/SearchBar';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

const CONNECTOR_TYPES = [
  'All',
  'CCS2',
  'Type 2',
  'CHAdeMO',
  'GB/T',
  'Bharat DC',
  'Bharat AC',
];

export const ChargingStationsPage: React.FC = () => {
  const { selectedCity, activeCityObj, openCityModal } = useCity();

  const [stations, setStations] = useState<ChargingCenter[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedConnector, setSelectedConnector] = useState<string>('All');
  const [fastOnly, setFastOnly] = useState<boolean>(false);
  const [selectedStation, setSelectedStation] = useState<ChargingCenter | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [tileStyle, setTileStyle] = useState<TileStyle>('osm');

  // Load Charging Centers for selected city
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        const data = await publicApi.getChargingCenters({ city: selectedCity });
        setStations(data);
      } catch (err) {
        console.error('Failed to load charging centers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
  }, [selectedCity]);

  // Filter stations based on search, status, connector type, and fast charging
  const filteredStations = useMemo(() => {
    return stations.filter((st) => {
      const matchesSearch = searchQuery
        ? st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (st.address || '').toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const matchesStatus =
        statusFilter === 'all' ? true : st.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesFast = !fastOnly || (st.power_kw || 0) >= 50;

      const matchesConnector =
        selectedConnector === 'All'
          ? true
          : st.connectors
          ? Object.keys(st.connectors).some((k) =>
              k.toLowerCase().includes(selectedConnector.toLowerCase())
            ) ||
            JSON.stringify(st.connectors).toLowerCase().includes(selectedConnector.toLowerCase())
          : true;

      return matchesSearch && matchesStatus && matchesFast && matchesConnector;
    });
  }, [stations, searchQuery, statusFilter, fastOnly, selectedConnector]);

  // MapLibre GeoJSON Clustering Layer Integration
  useEffect(() => {
    if (!map) return;

    const sourceId = 'charging-stations-source';
    const clusterLayerId = 'charging-clusters';
    const clusterCountId = 'charging-cluster-count';
    const unclusteredPointId = 'charging-unclustered-point';
    const unclusteredLabelId = 'charging-unclustered-label';

    const geojsonData: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: filteredStations.map((station) => ({
        type: 'Feature',
        properties: {
          id: station.id,
          name: station.name,
          status: station.status,
          power_kw: station.power_kw || 0,
          address: station.address || '',
        },
        geometry: {
          type: 'Point',
          coordinates: [station.longitude, station.latitude],
        },
      })),
    };

    const setupLayers = () => {
      if (map.getSource(sourceId)) {
        (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(geojsonData);
        return;
      }

      // Add clustered GeoJSON source
      map.addSource(sourceId, {
        type: 'geojson',
        data: geojsonData,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // Cluster Circle Layer
      map.addLayer({
        id: clusterLayerId,
        type: 'circle',
        source: sourceId,
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#006a3b', // < 10 stations (primary green)
            10,
            '#376757', // 10-50 stations (secondary)
            50,
            '#ba1a1a', // 50+ stations (error red)
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            18,
            10,
            24,
            50,
            30,
          ],
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9,
        },
      });

      // Cluster Count Text Layer
      map.addLayer({
        id: clusterCountId,
        type: 'symbol',
        source: sourceId,
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        paint: {
          'text-color': '#ffffff',
        },
      });

      // Unclustered Station Points
      map.addLayer({
        id: unclusteredPointId,
        type: 'circle',
        source: sourceId,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'match',
            ['get', 'status'],
            'operational',
            '#006a3b',
            'limited',
            '#eab308',
            'offline',
            '#ba1a1a',
            /* default */ '#006a3b',
          ],
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Unclustered Station Label
      map.addLayer({
        id: unclusteredLabelId,
        type: 'symbol',
        source: sourceId,
        filter: ['!', ['has', 'point_count']],
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
          'text-size': 10,
          'text-offset': [0, 1.2],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': '#191c1d',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.5,
        },
      });
    };

    if (map.isStyleLoaded()) {
      setupLayers();
    } else {
      map.once('style.load', setupLayers);
    }

    // Cluster click: zoom in
    const handleClusterClick = (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
      const features = map.queryRenderedFeatures(e.point, { layers: [clusterLayerId] });
      if (!features.length) return;

      const clusterId = features[0].properties?.cluster_id;
      const source = map.getSource(sourceId) as maplibregl.GeoJSONSource;

      source.getClusterExpansionZoom(clusterId).then((zoom) => {
        const coordinates = (features[0].geometry as GeoJSON.Point).coordinates;
        map.easeTo({
          center: [coordinates[0], coordinates[1]],
          zoom: zoom,
        });
      });
    };

    // Unclustered point click: select station
    const handlePointClick = (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
      const features = map.queryRenderedFeatures(e.point, { layers: [unclusteredPointId] });
      if (!features.length) return;

      const stationId = features[0].properties?.id;
      const found = stations.find((s) => s.id === stationId);
      if (found) {
        setSelectedStation(found);
        map.flyTo({ center: [found.longitude, found.latitude], zoom: 15, duration: 1000 });
      }
    };

    // Cursor pointers
    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = 'pointer';
    };
    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = '';
    };

    map.on('click', clusterLayerId, handleClusterClick);
    map.on('click', unclusteredPointId, handlePointClick);
    map.on('mouseenter', clusterLayerId, handleMouseEnter);
    map.on('mouseleave', clusterLayerId, handleMouseLeave);
    map.on('mouseenter', unclusteredPointId, handleMouseEnter);
    map.on('mouseleave', unclusteredPointId, handleMouseLeave);

    return () => {
      map.off('click', clusterLayerId, handleClusterClick);
      map.off('click', unclusteredPointId, handlePointClick);
      map.off('mouseenter', clusterLayerId, handleMouseEnter);
      map.off('mouseleave', clusterLayerId, handleMouseLeave);
      map.off('mouseenter', unclusteredPointId, handleMouseEnter);
      map.off('mouseleave', unclusteredPointId, handleMouseLeave);

      if (map.getLayer(unclusteredLabelId)) map.removeLayer(unclusteredLabelId);
      if (map.getLayer(unclusteredPointId)) map.removeLayer(unclusteredPointId);
      if (map.getLayer(clusterCountId)) map.removeLayer(clusterCountId);
      if (map.getLayer(clusterLayerId)) map.removeLayer(clusterLayerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
  }, [map, filteredStations, stations]);

  const handleSelectStation = (station: ChargingCenter) => {
    setSelectedStation(station);
    if (map && station.longitude && station.latitude) {
      map.flyTo({
        center: [station.longitude, station.latitude],
        zoom: 15,
        essential: true,
      });
    }
  };

  const cityCenter: [number, number] =
    activeCityObj?.longitude && activeCityObj?.latitude
      ? [activeCityObj.longitude, activeCityObj.latitude]
      : [73.3119, 28.0229];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-background">
      {/* Top Filter & Search Bar */}
      <div className="bg-white border-b border-outline-variant px-4 py-3 shrink-0 flex flex-col gap-2.5 z-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-[260px] max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={`Search charging stations in ${selectedCity}...`}
              className="w-full"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-surface-container-low border border-outline-variant rounded-lg text-xs font-semibold px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="all">All Statuses</option>
              <option value="operational">Operational (Open)</option>
              <option value="limited">Limited</option>
              <option value="offline">Offline</option>
            </select>

            {/* Fast DC Only Switch Toggle */}
            <button
              onClick={() => setFastOnly((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-label-bold border transition-colors ${
                fastOnly
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-surface-container-low border-outline-variant text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-sm">bolt</span>
              <span>Fast DC Only (&gt;50kW)</span>
            </button>

            {/* City Badge Button */}
            <button
              onClick={openCityModal}
              className="flex items-center gap-1 bg-surface-container border border-outline-variant px-3 py-2 rounded-lg text-xs font-label-bold text-primary hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-sm">location_on</span>
              <span>{selectedCity}</span>
            </button>
          </div>
        </div>

        {/* Horizontal Connector Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-[11px] font-bold text-outline uppercase tracking-wider shrink-0 mr-1">
            Connectors:
          </span>
          {CONNECTOR_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedConnector(type)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                selectedConnector === type
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-container-low border border-outline-variant text-on-surface hover:bg-surface-container'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Split Layout: Station Cards List + Interactive Map */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Side: Station List */}
        <div className="w-full lg:w-96 bg-white border-r border-outline-variant flex flex-col shrink-0 h-64 lg:h-full z-10 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-outline-variant/60 bg-surface-container-low flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">ev_station</span>
              <h2 className="font-headline-sm text-sm font-bold text-on-background">
                Verified Stations ({filteredStations.length})
              </h2>
            </div>
            <span className="text-[11px] text-on-surface-variant font-medium">
              Open to Public
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <LoadingSpinner message="Locating verified EV charging hubs..." />
            ) : filteredStations.length === 0 ? (
              <EmptyState
                icon="ev_station"
                title="No Stations Found"
                description="No public charging stations match your current search or filter criteria."
                actionLabel="Clear Filters"
                onAction={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setSelectedConnector('All');
                  setFastOnly(false);
                }}
              />
            ) : (
              filteredStations.map((station) => (
                <ChargingCard
                  key={station.id}
                  station={station}
                  isSelected={selectedStation?.id === station.id}
                  onSelect={() => handleSelectStation(station)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Map Canvas */}
        <div className="flex-1 h-full relative">
          <MapContainer
            center={cityCenter}
            zoom={12}
            tileStyle={tileStyle}
            onMapLoaded={(m) => setMap(m)}
            className="w-full h-full"
          />

          {/* Map Tile Style Switcher */}
          <MapStyleSwitcher activeStyle={tileStyle} onStyleChange={setTileStyle} />

          <MapControls
            map={map}
            onResetView={() => {
              if (map) {
                map.flyTo({ center: cityCenter, zoom: 12, essential: true });
              }
            }}
          />

          {/* Selected Station Floating Bottom Card */}
          {selectedStation && (
            <div className="absolute bottom-6 left-4 right-4 sm:right-auto sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-outline-variant p-5 z-20 animate-in slide-in-from-bottom duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-headline-sm text-base font-bold text-on-background">
                    {selectedStation.name}
                  </h4>
                  <p className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">
                    {selectedStation.address || `${selectedStation.city}, ${selectedStation.state}`}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedStation(null)}
                  className="p-1 text-outline hover:text-on-background rounded-full hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <div className="flex items-center gap-2 my-3">
                <Badge
                  variant={selectedStation.status === 'operational' ? 'success' : 'warning'}
                  size="sm"
                  dot
                >
                  {selectedStation.status.toUpperCase()}
                </Badge>
                {selectedStation.power_kw && (
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                    {selectedStation.power_kw} kW Fast DC
                  </span>
                )}
              </div>

              <div className="flex gap-2 pt-3 border-t border-outline-variant/40">
                <Link
                  to={`/charging/${selectedStation.id}`}
                  className="flex-1 text-center py-2 bg-primary text-white text-xs font-label-bold rounded-lg hover:bg-on-primary-fixed-variant transition-colors"
                >
                  Station Details
                </Link>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedStation.latitude},${selectedStation.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-lg text-xs font-label-bold text-on-surface transition-colors flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">directions</span>
                  Directions
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChargingStationsPage;
