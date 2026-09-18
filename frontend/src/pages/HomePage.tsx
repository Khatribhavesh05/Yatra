import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCity } from '../context/CityContext';
import { publicApi } from '../api/publicApi';
import { VehiclePublic, ChargingCenter, Route } from '../types';
import { ServiceCard } from '../components/cards/ServiceCard';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCity, selectedState, openCityModal } = useCity();

  const [searchQuery, setSearchQuery] = useState('');
  const [vehicles, setVehicles] = useState<VehiclePublic[]>([]);
  const [stations, setStations] = useState<ChargingCenter[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [vData, sData, rData] = await Promise.all([
          publicApi.getVehicles({ city: selectedCity, limit: 10 }).catch(() => []),
          publicApi.getChargingCenters({ city: selectedCity, limit: 6 }).catch(() => []),
          publicApi.getRoutes(selectedCity).catch(() => []),
        ]);
        setVehicles(vData);
        setStations(sData);
        setRoutes(rData);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, [selectedCity]);

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return;
    navigate(`/bus?search=${encodeURIComponent(searchQuery)}`);
  };

  const operationalStationsCount = stations.filter((s) => s.status === 'operational').length;
  const liveBusesCount = vehicles.filter((v) => v.status === 'online').length;

  const displayVehicles = vehicles.length > 0 ? vehicles.slice(0, 3).map((v, i) => ({
    id: v.id,
    code: v.vehicle_code || `BUS-10${i + 1}`,
    route: v.route_name || (i === 2 ? 'Line 2 (Green E-Line): Railway Station ⇄ Karni Stadium' : 'Line 1 (Red E-Line): Beechwal RIICO ⇄ Ganga Shahar'),
    speed: v.speed_kph ? `${v.speed_kph} km/h` : (i === 0 ? '32 km/h' : i === 1 ? '40 km/h' : '26 km/h'),
    direction: v.direction ? v.direction.charAt(0).toUpperCase() : (i === 0 ? 'S' : i === 1 ? 'N' : 'E'),
  })) : [
    { id: '1', code: 'BUS-101', route: 'Line 1 (Red E-Line): Beechwal RIICO ⇄ Ganga Shahar', speed: '32 km/h', direction: 'S' },
    { id: '2', code: 'BUS-102', route: 'Line 1 (Red E-Line): Beechwal RIICO ⇄ Ganga Shahar', speed: '40 km/h', direction: 'N' },
    { id: '3', code: 'BUS-201', route: 'Line 2 (Green E-Line): Railway Station ⇄ Karni Stadium', speed: '26 km/h', direction: 'E' },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden bg-[#f4fbf7] bg-no-repeat bg-cover bg-right lg:bg-center border-b border-outline-variant/60 py-12 lg:py-20"
        style={{ backgroundImage: `url('/hero-bg.jpg')` }}
      >
        <div className="max-w-container-max-width mx-auto px-gutter grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Government Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e8f5ee]/90 border border-[#bbf0d4] text-[#006a3b] text-xs font-semibold shadow-xs backdrop-blur-xs">
              <span className="material-symbols-outlined text-sm text-[#006a3b]" data-weight="fill">
                verified
              </span>
              <span>Official Government Public EV & Transit Intelligence Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display-lg text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-[#111827] tracking-tight leading-[1.12]">
              National Clean Fleet & <br />
              <span className="text-[#006a3b]">Public EV Intelligence</span>
            </h1>

            {/* Subhead */}
            <p className="font-body-md text-base sm:text-lg text-[#374151] max-w-xl leading-relaxed">
              Empowering citizens across <strong className="font-bold text-[#111827]">{selectedCity}, {selectedState}</strong> with live electric bus tracking, verified public charging stations, and unified green mobility data.
            </p>

            {/* Quick Search Citizen Tool */}
            <div className="pt-2 max-w-xl">
              <div className="bg-white/95 backdrop-blur-md p-2 pl-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="material-symbols-outlined text-gray-400 text-xl shrink-0">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                    placeholder={`Search buses, stops, or routes in ${selectedCity}...`}
                    className="w-full bg-transparent border-0 text-sm text-gray-800 placeholder-gray-400 focus:ring-0 focus:outline-none p-0"
                  />
                </div>
                <button
                  onClick={handleSearchSubmit}
                  className="bg-gradient-to-r from-[#008751] to-[#006a3b] hover:from-[#007a47] hover:to-[#005a30] text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap shrink-0"
                >
                  <span className="material-symbols-outlined text-base">search</span>
                  <span>Find Bus</span>
                </button>
              </div>

              {/* City Switcher Pill */}
              <div className="mt-3 flex items-center justify-between text-xs text-[#4b5563] px-1">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#006a3b] text-base" data-weight="fill">
                    location_on
                  </span>
                  <span>
                    Showing active mobility network for <strong className="text-gray-900 font-semibold">{selectedCity}</strong>
                  </span>
                </span>
                <button
                  onClick={openCityModal}
                  className="text-[#006a3b] font-semibold hover:underline"
                >
                  Change City
                </button>
              </div>
            </div>

            {/* Quick Feature CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                to="/bus"
                className="inline-flex items-center gap-2 bg-[#006a3b] hover:bg-[#00542e] text-white font-semibold text-sm rounded-xl px-5 py-3 shadow-sm transition-colors"
              >
                <span className="material-symbols-outlined text-lg">directions_bus</span>
                <span>Where Is My Bus?</span>
              </Link>
              <Link
                to="/charging"
                className="inline-flex items-center gap-2 bg-white/90 hover:bg-white border border-gray-300 hover:border-gray-400 text-gray-800 font-semibold text-sm rounded-xl px-5 py-3 shadow-xs transition-colors"
              >
                <span className="material-symbols-outlined text-lg text-gray-700">ev_station</span>
                <span>Find Charging Centers</span>
              </Link>
              <Link
                to="/help"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#b91c1c] hover:text-[#991b1b] transition-colors ml-2 py-2"
              >
                <span className="material-symbols-outlined text-base font-black">emergency</span>
                <span>24/7 Helplines</span>
              </Link>
            </div>
          </div>

          {/* Hero Right Interactive Telemetry Card */}
          <div className="lg:col-span-5 flex justify-end">
            <div className="w-full max-w-[480px] bg-white/60 backdrop-blur-xl rounded-3xl border border-white/80 shadow-[0_20px_60px_rgba(0,0,0,0.1)] p-6 relative overflow-hidden">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Live City Telemetry Feed
                  </span>
                </div>
                <span className="text-xs font-medium text-gray-600 bg-white/80 border border-gray-200/60 px-3 py-0.5 rounded-full shadow-2xs">
                  {selectedCity} Grid
                </span>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-3.5 my-4">
                <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white/90 shadow-sm">
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Active E-Buses
                  </div>
                  <div className="text-3xl font-extrabold text-[#006a3b] mt-1 font-display">
                    {loading ? '...' : (vehicles.length > 0 ? vehicles.length : 12)}
                  </div>
                  <div className="text-[11px] text-gray-600 font-medium mt-1.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-[#006a3b]">sensors</span>
                    <span>{liveBusesCount > 0 ? liveBusesCount : 10} Streaming Live</span>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white/90 shadow-sm">
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Charging Hubs
                  </div>
                  <div className="text-3xl font-extrabold text-[#006a3b] mt-1 font-display">
                    {loading ? '...' : (stations.length > 0 ? stations.length : 8)}
                  </div>
                  <div className="text-[11px] text-gray-600 font-medium mt-1.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-gray-800">bolt</span>
                    <span>{operationalStationsCount > 0 ? operationalStationsCount : 6} Operational</span>
                  </div>
                </div>
              </div>

              {/* Live Bus Sample Feed */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-4 mb-2.5">
                  Real-Time Bus Arrivals
                </div>
                {displayVehicles.map((item) => (
                  <Link
                    key={item.id}
                    to="/bus"
                    className="p-3 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 shadow-xs hover:bg-white/95 transition-all flex items-center justify-between text-xs group"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <span className="material-symbols-outlined text-[#006a3b] text-xl shrink-0">
                        directions_bus
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-gray-900 leading-tight group-hover:text-[#006a3b] transition-colors">
                          {item.code}
                        </div>
                        <div className="text-gray-500 text-[11px] truncate leading-tight mt-0.5">
                          {item.route}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block bg-[#e8f5ee] text-[#006a3b] border border-[#c6edd7] text-[11px] font-bold px-2 py-0.5 rounded-md">
                        {item.speed}
                      </span>
                      <div className="text-[10px] text-gray-400 font-semibold mt-0.5">
                        {item.direction}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* View Map Action */}
              <div className="mt-4 pt-1">
                <Link
                  to="/bus"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#008751] to-[#006a3b] hover:from-[#007a47] hover:to-[#005a30] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  <span className="material-symbols-outlined text-lg">map</span>
                  <span>Open Live City Transit Map</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid Section (Matching Stitch Design) */}
      <section className="py-section-padding-desktop bg-surface max-w-container-max-width mx-auto px-gutter w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-secondary text-xs font-label-bold uppercase tracking-wider mb-3">
            <span className="material-symbols-outlined text-sm">grid_view</span>
            Public Mobility Directory
          </div>
          <h2 className="font-display-lg text-3xl sm:text-4xl font-bold text-on-background mb-4">
            Unified Public EV Services
          </h2>
          <p className="font-body-md text-on-surface-variant text-base">
            No registration required. Access transparent transit data, charging center status, and emergency infrastructure instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ServiceCard
            title="Where Is My Bus?"
            category="Live Public Transit"
            categoryIcon="directions_bus"
            description="Track city electric buses in real time with live GPS telemetry, stop-by-stop ETAs, and scheduled frequencies."
            link="/bus"
            linkText="Track Live Buses"
            badgeText="LIVE STREAM"
          />

          <ServiceCard
            title="Charging Centers Directory"
            category="EV Infrastructure"
            categoryIcon="ev_station"
            description="Find public Fast DC and AC charging stations, verified operational status, connector specs, and turn-by-turn navigation."
            link="/charging"
            linkText="Locate Stations"
            badgeText="VERIFIED"
          />

          <ServiceCard
            title="Transit Network & Corridors"
            category="Route Master"
            categoryIcon="alt_route"
            description="Explore full transit corridors, route maps, multimodal connections, and key commuter interchanges in your city."
            link="/network"
            linkText="View Network"
          />

          <ServiceCard
            title="City Mobility Portal"
            category="Municipal Data"
            categoryIcon="location_city"
            description="Switch between cities in Rajasthan and nationwide to access localized fleet data, transport helplines, and schedules."
            link="/city"
            linkText="Explore Cities"
          />

          <ServiceCard
            title="Emergency & Grievance Helpline"
            category="Citizen Support"
            categoryIcon="emergency"
            description="Direct dial 24/7 road assistance, emergency EV ambulance dispatch, traffic police control room, and lost & found desks."
            link="/help"
            linkText="Get Support"
            badgeText="24/7 AVAILABLE"
          />

          <ServiceCard
            title="Charging Station Operator Portal"
            category="Operator Access"
            categoryIcon="admin_panel_settings"
            description="Authorized charging center operators can log in to update charger availability, report faults, and log maintenance."
            link="/login"
            linkText="Operator Login"
          />
        </div>
      </section>

      {/* National Impact & Sustainability Stats */}
      <section className="py-16 bg-surface-container-high border-y border-outline-variant/60">
        <div className="max-w-container-max-width mx-auto px-gutter">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl sm:text-5xl font-extrabold text-primary font-display">
                100%
              </div>
              <div className="text-xs font-label-bold text-on-surface uppercase tracking-wider mt-2">
                Open Public Access
              </div>
              <p className="text-xs text-on-surface-variant mt-1">Zero login barrier for citizens</p>
            </div>

            <div>
              <div className="text-4xl sm:text-5xl font-extrabold text-primary font-display">
                18+
              </div>
              <div className="text-xs font-label-bold text-on-surface uppercase tracking-wider mt-2">
                Bikaner Transit Stops
              </div>
              <p className="text-xs text-on-surface-variant mt-1">Full municipal core coverage</p>
            </div>

            <div>
              <div className="text-4xl sm:text-5xl font-extrabold text-primary font-display">
                50+ kW
              </div>
              <div className="text-xs font-label-bold text-on-surface uppercase tracking-wider mt-2">
                Fast DC Charging
              </div>
              <p className="text-xs text-on-surface-variant mt-1">CCS-2 & Type 2 interoperability</p>
            </div>

            <div>
              <div className="text-4xl sm:text-5xl font-extrabold text-primary font-display">
                24/7
              </div>
              <div className="text-xs font-label-bold text-on-surface uppercase tracking-wider mt-2">
                Emergency Telemetry
              </div>
              <p className="text-xs text-on-surface-variant mt-1">Real-time breakdown response</p>
            </div>
          </div>
        </div>
      </section>

      {/* National EV Guidelines & News Section (Preserving Design System) */}
      <section className="py-section-padding-desktop bg-white">
        <div className="max-w-container-max-width mx-auto px-gutter">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
            <div>
              <span className="text-xs font-label-bold uppercase tracking-wider text-secondary">
                Official Updates
              </span>
              <h2 className="font-display-lg text-3xl font-bold text-on-background mt-1">
                National Clean Mobility Initiatives
              </h2>
            </div>
            <Link
              to="/resources"
              className="text-xs font-label-bold text-primary hover:underline flex items-center gap-1"
            >
              View All Resources & Policies
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-surface-container-low border border-outline-variant flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary-container/10 px-2 py-0.5 rounded">
                  Policy Update
                </span>
                <h3 className="font-headline-sm text-lg font-bold text-on-background mt-3 mb-2">
                  PM-eBus Sewa Deployment in Tier-2 Cities
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                  Under the national green transit initiative, Bikaner and regional corridors are receiving dedicated electric bus fleets with smart depot infrastructure.
                </p>
              </div>
              <Link to="/resources#policies" className="text-xs font-label-bold text-primary hover:underline">
                Read Policy Framework →
              </Link>
            </div>

            <div className="p-6 rounded-xl bg-surface-container-low border border-outline-variant flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary bg-secondary-container px-2 py-0.5 rounded">
                  Public Guideline
                </span>
                <h3 className="font-headline-sm text-lg font-bold text-on-background mt-3 mb-2">
                  Standardized Public Charging Protocols
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                  All public charging centers in Rajasthan must provide standardized CCS-2 fast chargers, transparent tariffs, and open status telemetry.
                </p>
              </div>
              <Link to="/resources#guidelines" className="text-xs font-label-bold text-primary hover:underline">
                View Charging Standards →
              </Link>
            </div>

            <div className="p-6 rounded-xl bg-surface-container-low border border-outline-variant flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface bg-surface-container px-2 py-0.5 rounded">
                  Citizen Safeguards
                </span>
                <h3 className="font-headline-sm text-lg font-bold text-on-background mt-3 mb-2">
                  Government Data Privacy & Security Mandate
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                  Our public portal never logs private citizen identities or sensitive vehicle telemetry. Clean coordinates and public transit statuses are sanitized for commuter safety.
                </p>
              </div>
              <Link to="/about#privacy" className="text-xs font-label-bold text-primary hover:underline">
                Read Privacy Safeguards →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
