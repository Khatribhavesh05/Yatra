import React from 'react';
import { useCity } from '../context/CityContext';
import { ServiceCard } from '../components/cards/ServiceCard';

export const ServicesPage: React.FC = () => {
  const { selectedCity, selectedState, openCityModal } = useCity();

  return (
    <div className="w-full py-12 bg-surface">
      <div className="max-w-container-max-width mx-auto px-gutter">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 pb-6 border-b border-outline-variant/60 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container/10 text-primary text-xs font-label-bold mb-2">
              <span className="material-symbols-outlined text-sm">hub</span>
              Public Directory & Citizen Utilities
            </div>
            <h1 className="font-display-lg text-3xl sm:text-4xl font-extrabold text-on-background">
              Government EV Mobility Services
            </h1>
            <p className="font-body-md text-sm sm:text-base text-on-surface-variant mt-2 max-w-2xl">
              Transparent, open-access public transport data and clean infrastructure directory for commuters and citizens across {selectedCity}, {selectedState}.
            </p>
          </div>

          <button
            onClick={openCityModal}
            className="flex items-center gap-2 bg-white border border-outline-variant px-4 py-2 rounded-lg text-xs font-label-bold text-on-surface hover:bg-surface-container-low transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-primary text-base">location_on</span>
            <span>City: {selectedCity} ({selectedState})</span>
            <span className="text-primary hover:underline ml-1">Change</span>
          </button>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ServiceCard
            title="Where Is My Bus?"
            category="Live Transit Telemetry"
            categoryIcon="directions_bus"
            description="Real-time electric bus tracking with live GPS speeds, arrival estimates, route stop timetables, and active vehicle telemetry."
            link="/bus"
            linkText="Open Live Bus Tracker"
            badgeText="LIVE STREAM"
          />

          <ServiceCard
            title="Public Charging Directory"
            category="Charging Infrastructure"
            categoryIcon="ev_station"
            description="Search fast DC and AC EV charging hubs across Rajasthan, check real-time charger status, available connectors, and get navigation directions."
            link="/charging"
            linkText="Explore Charging Stations"
            badgeText="VERIFIED"
          />

          <ServiceCard
            title="Clean Transit Network"
            category="Route Master"
            categoryIcon="alt_route"
            description="Interactive network map showing all electric bus lines, major transport corridors, railway station connectors, and transit interchanges."
            link="/network"
            linkText="View Transit Network"
          />

          <ServiceCard
            title="City Transport Portal"
            category="Municipal Grid"
            categoryIcon="location_city"
            description="Explore localized municipal fleet statistics, route maps, depot hubs, and upcoming clean transit expansions for Bikaner, Jaipur, Jodhpur, and Udaipur."
            link="/city"
            linkText="View City Portal"
          />

          <ServiceCard
            title="Green Fleet Transparency"
            category="Environmental Impact"
            categoryIcon="electric_car"
            description="Public transparency dashboard displaying municipal zero-emission distance travelled, battery health, and clean energy displacement metrics."
            link="/vehicles"
            linkText="View Fleet Metrics"
          />

          <ServiceCard
            title="Emergency & Grievance Desk"
            category="Citizen Support"
            categoryIcon="emergency"
            description="Direct-dial emergency control lines, EV breakdown assistance, medical ambulance dispatch, traffic police, and passenger lost & found."
            link="/help"
            linkText="Access Helplines"
            badgeText="24/7 HELPLINES"
          />

          <ServiceCard
            title="Policy & Guidelines Library"
            category="Official Resources"
            categoryIcon="menu_book"
            description="Official Ministry of Heavy Industries and Transport guidelines, PM-eBus Sewa documents, EV tariff policies, and operator documentation."
            link="/resources"
            linkText="Browse Guidelines"
          />

          <ServiceCard
            title="About Platform & Governance"
            category="Institutional Trust"
            categoryIcon="account_balance"
            description="Learn about the Yatra national mobility initiative, data protection standards, commuter privacy safeguards, and institutional governance."
            link="/about"
            linkText="Read Platform Mission"
          />

          <ServiceCard
            title="Charging Station Operator Portal"
            category="Operator Access"
            categoryIcon="admin_panel_settings"
            description="Restricted login portal for certified charging station operators to update charger uptime, report hardware faults, and log maintenance logs."
            link="/login"
            linkText="Operator Login"
          />
        </div>
      </div>
    </div>
  );
};
