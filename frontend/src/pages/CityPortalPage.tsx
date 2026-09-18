import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCity } from '../context/CityContext';
import { publicApi } from '../api/publicApi';
import { Route, ChargingCenter, HelpContact, VehiclePublic } from '../types';
import { RouteCard } from '../components/cards/RouteCard';
import { ChargingCard } from '../components/cards/ChargingCard';
import { HelpCard } from '../components/cards/HelpCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const CityPortalPage: React.FC = () => {
  const {
    selectedCity,
    selectedState,
    setSelectedCity,
    availableCities,
    availableStates,
  } = useCity();

  const [routes, setRoutes] = useState<Route[]>([]);
  const [stations, setStations] = useState<ChargingCenter[]>([]);
  const [contacts, setContacts] = useState<HelpContact[]>([]);
  const [vehicles, setVehicles] = useState<VehiclePublic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCityData = async () => {
      try {
        setLoading(true);
        const [rData, sData, cData, vData] = await Promise.all([
          publicApi.getRoutes(selectedCity).catch(() => []),
          publicApi.getChargingCenters({ city: selectedCity }).catch(() => []),
          publicApi.getHelpContacts({ city: selectedCity }).catch(() => []),
          publicApi.getVehicles({ city: selectedCity }).catch(() => []),
        ]);
        setRoutes(rData);
        setStations(sData);
        setContacts(cData);
        setVehicles(vData);
      } catch (err) {
        console.error('Failed to load city portal data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCityData();
  }, [selectedCity]);

  return (
    <div className="w-full py-10 bg-surface">
      <div className="max-w-container-max-width mx-auto px-gutter">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 pb-6 border-b border-outline-variant/60 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-secondary text-xs font-label-bold mb-2">
              <span className="material-symbols-outlined text-sm">location_city</span>
              Municipal Mobility Intelligence
            </div>
            <h1 className="font-display-lg text-3xl sm:text-4xl font-bold text-on-background">
              {selectedCity} Clean Transit Portal
            </h1>
            <p className="font-body-md text-sm sm:text-base text-on-surface-variant mt-1">
              Local municipal EV grid, passenger corridor schedules, and charging network in {selectedState}.
            </p>
          </div>

          {/* Quick City Switcher Buttons */}
          <div className="flex flex-wrap gap-2">
            {availableCities.map((city) => {
              const isCurrent = city.name.toLowerCase() === selectedCity.toLowerCase();
              return (
                <button
                  key={city.id}
                  onClick={() => setSelectedCity(city.name)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-label-bold transition-all ${
                    isCurrent
                      ? 'bg-primary text-white shadow-sm ring-2 ring-primary/20'
                      : 'bg-white border border-outline-variant hover:bg-surface-container text-on-surface'
                  }`}
                >
                  {city.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* City Key Performance Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="p-5 rounded-xl bg-white border border-outline-variant shadow-sm">
            <div className="flex items-center justify-between text-outline mb-2">
              <span className="text-xs font-label-bold uppercase">Transit Corridors</span>
              <span className="material-symbols-outlined text-primary text-xl">alt_route</span>
            </div>
            <div className="text-3xl font-extrabold text-on-background font-display">
              {loading ? '...' : routes.length}
            </div>
            <p className="text-[11px] text-on-surface-variant mt-1">Active bus routes in city</p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-outline-variant shadow-sm">
            <div className="flex items-center justify-between text-outline mb-2">
              <span className="text-xs font-label-bold uppercase">Live E-Buses</span>
              <span className="material-symbols-outlined text-primary text-xl">directions_bus</span>
            </div>
            <div className="text-3xl font-extrabold text-primary font-display">
              {loading ? '...' : vehicles.length}
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">GPS Telemetry connected</p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-outline-variant shadow-sm">
            <div className="flex items-center justify-between text-outline mb-2">
              <span className="text-xs font-label-bold uppercase">Charging Centers</span>
              <span className="material-symbols-outlined text-secondary text-xl">ev_station</span>
            </div>
            <div className="text-3xl font-extrabold text-secondary font-display">
              {loading ? '...' : stations.length}
            </div>
            <p className="text-[11px] text-on-surface-variant mt-1">Public EV fast charging</p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-outline-variant shadow-sm">
            <div className="flex items-center justify-between text-outline mb-2">
              <span className="text-xs font-label-bold uppercase">Help & Dispatch</span>
              <span className="material-symbols-outlined text-error text-xl">emergency</span>
            </div>
            <div className="text-3xl font-extrabold text-on-background font-display">
              {loading ? '...' : contacts.length}
            </div>
            <p className="text-[11px] text-on-surface-variant mt-1">24/7 Verified desks</p>
          </div>
        </div>

        {/* Section 1: City Transit Routes */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-headline-sm text-xl font-bold text-on-background">
                {selectedCity} Scheduled Transit Routes
              </h2>
              <p className="text-xs text-on-surface-variant">
                Major connecting corridors between railway stations, hospitals, and educational institutions.
              </p>
            </div>
            <Link
              to="/bus"
              className="text-xs font-label-bold text-primary hover:underline flex items-center gap-1"
            >
              Track Live on Map →
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading city corridors..." />
          ) : routes.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-outline-variant text-sm text-on-surface-variant">
              No routes found for {selectedCity}. Corridors are being onboarded.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {routes.map((r) => (
                <RouteCard key={r.id} route={r} />
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Public Charging Infrastructure */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-headline-sm text-xl font-bold text-on-background">
                Public EV Charging Centers in {selectedCity}
              </h2>
              <p className="text-xs text-on-surface-variant">
                Verified high-power DC fast charging and municipal destination chargers.
              </p>
            </div>
            <Link
              to="/charging"
              className="text-xs font-label-bold text-primary hover:underline flex items-center gap-1"
            >
              View Full Charging Directory →
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading local charging stations..." />
          ) : stations.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-outline-variant text-sm text-on-surface-variant">
              No charging stations listed for {selectedCity} yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stations.map((st) => (
                <ChargingCard key={st.id} station={st} />
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Municipal Helplines */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-headline-sm text-xl font-bold text-on-background">
                {selectedCity} Emergency & Support Contacts
              </h2>
              <p className="text-xs text-on-surface-variant">
                Direct helplines for passenger transit, EV breakdown, and medical dispatch.
              </p>
            </div>
            <Link
              to="/help"
              className="text-xs font-label-bold text-primary hover:underline flex items-center gap-1"
            >
              View All Emergency Helplines →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contacts.map((c) => (
              <HelpCard key={c.id} contact={c} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
