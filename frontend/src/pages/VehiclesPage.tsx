import React, { useState, useEffect } from 'react';
import { useCity } from '../context/CityContext';
import { publicApi } from '../api/publicApi';
import { VehiclePublic } from '../types';
import { BusCard } from '../components/cards/BusCard';
import { SearchBar } from '../components/common/SearchBar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { formatVehicleType } from '../utils/formatters';

export const VehiclesPage: React.FC = () => {
  const { selectedCity, selectedState, openCityModal } = useCity();

  const [vehicles, setVehicles] = useState<VehiclePublic[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const data = await publicApi.getVehicles({ city: selectedCity });
        setVehicles(data);
      } catch (err) {
        console.error('Failed to load vehicles:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, [selectedCity]);

  const filteredVehicles = vehicles.filter((v) => {
    const matchesType =
      typeFilter === 'all' ? true : v.vehicle_type.toLowerCase() === typeFilter.toLowerCase();
    const matchesSearch = searchQuery
      ? (v.vehicle_code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.department_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.route_name || '').toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesType && matchesSearch;
  });

  const activeCount = vehicles.filter((v) => v.status === 'online').length;
  const avgSoc = vehicles.length > 0
    ? Math.round(
        vehicles.reduce((acc, v) => acc + (v.soc_pct || 0), 0) / vehicles.length
      )
    : 0;

  return (
    <div className="w-full py-10 bg-surface">
      <div className="max-w-container-max-width mx-auto px-gutter">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 pb-6 border-b border-outline-variant/60 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container/10 text-primary text-xs font-label-bold mb-2">
              <span className="material-symbols-outlined text-sm">electric_car</span>
              Clean Fleet Public Transparency
            </div>
            <h1 className="font-display-lg text-3xl sm:text-4xl font-bold text-on-background">
              {selectedCity} Electric Fleet Intelligence
            </h1>
            <p className="font-body-md text-sm sm:text-base text-on-surface-variant mt-1">
              Public telemetry, clean energy impact, and real-time operational status for municipal EV fleets in {selectedState}.
            </p>
          </div>

          <button
            onClick={openCityModal}
            className="flex items-center gap-1.5 bg-white border border-outline-variant px-4 py-2 rounded-lg text-xs font-label-bold text-on-surface hover:bg-surface-container transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-primary text-base">location_on</span>
            <span>City: {selectedCity}</span>
            <span className="text-primary hover:underline ml-1">Change</span>
          </button>
        </div>

        {/* Fleet Status Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          <div className="p-5 rounded-xl bg-white border border-outline-variant shadow-sm">
            <div className="flex items-center justify-between text-outline mb-2">
              <span className="text-xs font-label-bold uppercase">Total Clean Fleet</span>
              <span className="material-symbols-outlined text-primary text-xl">directions_bus</span>
            </div>
            <div className="text-3xl font-extrabold text-on-background font-display">
              {loading ? '...' : vehicles.length}
            </div>
            <p className="text-[11px] text-on-surface-variant mt-1">Deployed in {selectedCity}</p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-outline-variant shadow-sm">
            <div className="flex items-center justify-between text-outline mb-2">
              <span className="text-xs font-label-bold uppercase">Active In Service</span>
              <span className="material-symbols-outlined text-emerald-600 text-xl">sensors</span>
            </div>
            <div className="text-3xl font-extrabold text-emerald-700 font-display">
              {loading ? '...' : activeCount}
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">Real-time GPS connected</p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-outline-variant shadow-sm">
            <div className="flex items-center justify-between text-outline mb-2">
              <span className="text-xs font-label-bold uppercase">Avg Battery State</span>
              <span className="material-symbols-outlined text-primary text-xl">battery_charging_full</span>
            </div>
            <div className="text-3xl font-extrabold text-primary font-display">
              {loading ? '...' : `${avgSoc}%`}
            </div>
            <p className="text-[11px] text-on-surface-variant mt-1">Healthy operating range</p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-xl border border-outline-variant p-4 mb-8 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="w-full sm:max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by vehicle code, route, or department..."
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {['all', 'electric_bus', 'ambulance_ev', 'utility_ev'].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-label-bold capitalize transition-colors ${
                  typeFilter === type
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                }`}
              >
                {type === 'all' ? 'All Clean Types' : formatVehicleType(type)}
              </button>
            ))}
          </div>
        </div>

        {/* Fleet Grid */}
        <div>
          {loading ? (
            <LoadingSpinner message="Aggregating municipal fleet telemetry..." />
          ) : filteredVehicles.length === 0 ? (
            <EmptyState
              icon="directions_bus"
              title="No Vehicles Matching Filter"
              description="No fleet units matched your current filter criteria."
              actionLabel="Clear Filter"
              onAction={() => {
                setSearchQuery('');
                setTypeFilter('all');
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVehicles.map((vehicle) => (
                <BusCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
