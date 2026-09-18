import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const ResourcesPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Do I need to create an account or log in to track city electric buses?',
      a: 'No. FleetIQ / URJA is built on an open-access public service model. All citizens, commuters, and tourists can view real-time electric bus movements, stop arrivals, and live speeds directly on the map without any registration or login.',
    },
    {
      q: 'How accurate is the live bus GPS streaming?',
      a: 'Bus location and velocity telemetry are streamed from onboard GPS & AIS-140 standard tracking units. Refresh intervals are between 1 to 5 seconds, providing real-time accuracy within 5-10 meters.',
    },
    {
      q: 'Can private EV car and two-wheeler owners use the listed charging stations?',
      a: 'Yes. All charging stations marked as "Public" in our directory support standard interoperable connectors including CCS-2 (for 4-wheelers & commercial fleets) and Type 2 / 15A industrial sockets (for 2/3 wheelers).',
    },
    {
      q: 'What should I do if a public charging station is offline or damaged?',
      a: 'You can directly contact the 24/7 Rajasthan EV Emergency Helpline at 1800 180 6127 or submit an online redressal ticket via our Help & Grievance desk.',
    },
    {
      q: 'How does the platform protect commuter privacy?',
      a: 'FleetIQ adheres strictly to Government of India data privacy guidelines. No citizen location history, facial recognition, or personal identifiers are stored. All vehicle data is sanitized to show only public route, speed, and status metrics.',
    },
  ];

  return (
    <div className="w-full py-12 bg-surface">
      <div className="max-w-container-max-width mx-auto px-gutter">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-secondary text-xs font-label-bold uppercase tracking-wider mb-3">
            <span className="material-symbols-outlined text-sm">menu_book</span>
            National Knowledge Base
          </div>
          <h1 className="font-display-lg text-3xl sm:text-4xl font-extrabold text-on-background">
            EV Resources, Policies & FAQs
          </h1>
          <p className="font-body-md text-sm sm:text-base text-on-surface-variant mt-2">
            Official Government guidelines, charging technical standards, passenger transit information, and public documentation.
          </p>
        </div>

        {/* Technical Standards & Policy Documents */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16" id="policies">
          <div className="p-6 rounded-2xl bg-white border border-outline-variant shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary-container/10 text-primary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-2xl">policy</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary-container/10 px-2 py-0.5 rounded">
                National Policy
              </span>
              <h3 className="font-headline-sm text-lg font-bold text-on-background mt-3 mb-2">
                PM-eBus Sewa Framework
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                Operational guidelines for deploying 10,000 electric buses on PPP model across Indian cities, with green depot power infrastructure.
              </p>
            </div>
            <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between text-xs font-label-bold text-primary">
              <span>Ministry of Housing & Urban Affairs</span>
              <span className="material-symbols-outlined text-base">download</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-outline-variant shadow-sm flex flex-col justify-between" id="guidelines">
            <div>
              <div className="w-12 h-12 rounded-xl bg-secondary-container text-secondary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-2xl">electric_bolt</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-secondary bg-secondary-container px-2 py-0.5 rounded">
                Technical Standard
              </span>
              <h3 className="font-headline-sm text-lg font-bold text-on-background mt-3 mb-2">
                CEA EV Charging Safety Protocols
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                Central Electricity Authority guidelines on insulation resistance, automatic cutoff, surge protection, and ground fault safety for fast chargers.
              </p>
            </div>
            <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between text-xs font-label-bold text-primary">
              <span>CEA Technical Directive</span>
              <span className="material-symbols-outlined text-base">download</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-outline-variant shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-surface-container text-on-surface flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-2xl">lock</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface bg-surface-container px-2 py-0.5 rounded">
                Data Governance
              </span>
              <h3 className="font-headline-sm text-lg font-bold text-on-background mt-3 mb-2">
                Open Transit Telemetry Standard
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                Government specifications for publishing sanitized vehicle positions (GTFS-RT) while safeguarding internal security and telemetry channels.
              </p>
            </div>
            <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between text-xs font-label-bold text-primary">
              <span>National Open Data Portal</span>
              <span className="material-symbols-outlined text-base">download</span>
            </div>
          </div>
        </div>

        {/* FAQs Accordion Section */}
        <div className="max-w-3xl mx-auto" id="faqs">
          <div className="text-center mb-8">
            <h2 className="font-display-lg text-2xl sm:text-3xl font-bold text-on-background">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
              Everything you need to know about navigating the public EV transit network.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-outline-variant overflow-hidden transition-all shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-surface-container-low/50 transition-colors"
                  >
                    <span className="font-headline-sm text-sm sm:text-base font-bold text-on-background">
                      {faq.q}
                    </span>
                    <span
                      className={`material-symbols-outlined text-primary text-xl transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-on-surface-variant leading-relaxed border-t border-outline-variant/40 animate-in fade-in duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Need Help CTA Banner */}
        <div className="mt-16 bg-primary rounded-2xl p-8 sm:p-12 text-white shadow-xl text-center max-w-4xl mx-auto flex flex-col items-center">
          <span className="material-symbols-outlined text-4xl mb-3 text-secondary-container">
            contact_support
          </span>
          <h2 className="font-display-lg text-2xl sm:text-3xl font-bold">
            Still Have Questions or Feedback?
          </h2>
          <p className="text-sm text-white/85 max-w-xl mt-2 leading-relaxed">
            Reach out to our citizen assistance control desk or connect directly with our municipal transit officers.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/help"
              className="bg-white text-primary px-6 py-3 rounded-lg text-xs font-label-bold hover:bg-gray-100 transition-colors shadow-md"
            >
              Go to Help & Emergency Desk
            </Link>
            <Link
              to="/about"
              className="bg-primary-container text-white px-6 py-3 rounded-lg text-xs font-label-bold hover:bg-opacity-90 transition-colors border border-white/20"
            >
              Learn More About URJA
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
