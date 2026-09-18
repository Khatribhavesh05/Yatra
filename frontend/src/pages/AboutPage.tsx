import React from 'react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  return (
    <div className="w-full py-12 bg-surface">
      <div className="max-w-container-max-width mx-auto px-gutter">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container/10 text-primary text-xs font-label-bold uppercase tracking-wider mb-3">
            <span className="material-symbols-outlined text-sm">account_balance</span>
            Government Public Mobility Platform
          </div>
          <h1 className="font-display-lg text-3xl sm:text-5xl font-extrabold text-on-background">
            Institutional Mission & Trust
          </h1>
          <p className="font-body-md text-sm sm:text-base text-on-surface-variant mt-3 leading-relaxed">
            Unifying clean public transit telemetry, interoperable EV charging infrastructure, and civic transparency across India.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="p-8 rounded-2xl bg-white border border-outline-variant shadow-sm text-left">
            <div className="w-12 h-12 rounded-xl bg-primary-container/10 text-primary flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-2xl">public</span>
            </div>
            <h3 className="font-headline-sm text-xl font-bold text-on-background mb-3">
              Open Public Access
            </h3>
            <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
              We believe essential public transport information belongs to every citizen. Bus routes, live arrivals, and charging locations require zero login or subscription.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-outline-variant shadow-sm text-left">
            <div className="w-12 h-12 rounded-xl bg-secondary-container text-secondary flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-2xl">shield</span>
            </div>
            <h3 className="font-headline-sm text-xl font-bold text-on-background mb-3">
              Data Privacy & Commuter Safety
            </h3>
            <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
              Our system collects zero passenger identity data. Internal government fleet telemetry is scrubbed and sanitized before public broadcast to ensure complete operational safety.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-outline-variant shadow-sm text-left">
            <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center mb-6 shadow-md">
              <span className="material-symbols-outlined text-2xl">electric_meter</span>
            </div>
            <h3 className="font-headline-sm text-xl font-bold text-on-background mb-3">
              Interoperable Clean Grid
            </h3>
            <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
              Accelerating India's Net-Zero 2070 targets by eliminating charging fragmentation and providing unified visibility into standard CCS-2, Type 2, and DC fast chargers.
            </p>
          </div>
        </div>

        {/* Privacy Safeguards Section */}
        <div className="bg-white rounded-2xl border border-outline-variant p-8 sm:p-12 shadow-sm mb-16" id="privacy">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-secondary text-xs font-label-bold uppercase tracking-wider mb-3">
              <span className="material-symbols-outlined text-sm">lock</span>
              Public Data Charter
            </div>
            <h2 className="font-display-lg text-2xl sm:text-3xl font-bold text-on-background mb-4">
              Commuter Privacy & Open Telemetry Standards
            </h2>
            <div className="space-y-4 text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              <p>
                The FleetIQ / URJA platform is designed under strict government privacy frameworks. When you use this portal to track public electric buses or find EV charging stations:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Zero Citizen Tracking:</strong> We do not track, log, or profile your movement, search queries, or device IDs.</li>
                <li><strong>Sanitized Public Telemetry:</strong> Public bus telemetry exposes only vehicle code, route name, approximate speed, and public direction. Internal sensor metrics, driver names, phone numbers, and raw CAN-bus codes remain strictly restricted.</li>
                <li><strong>No Commercial Monetization:</strong> This is a public infrastructure utility; no citizen data is sold, monetized, or shared with third-party advertisers.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Accessibility & Governance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16" id="accessibility">
          <div className="p-8 rounded-2xl bg-white border border-outline-variant shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-primary text-3xl">accessibility</span>
              <h3 className="font-headline-sm text-xl font-bold text-on-background">
                Accessibility Statement
              </h3>
            </div>
            <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              FleetIQ is committed to ensuring digital accessibility for people of all abilities. The platform conforms to <strong>WCAG 2.1 Level AA</strong> standards, featuring high-contrast institutional typography, keyboard navigation, and screen reader-friendly semantic HTML.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-outline-variant shadow-sm" id="terms">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-secondary text-3xl">gavel</span>
              <h3 className="font-headline-sm text-xl font-bold text-on-background">
                Terms of Use
              </h3>
            </div>
            <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Information published on this platform is provided for public convenience and transit planning. While live GPS feeds reflect actual vehicle positions in real time, traffic conditions and municipal rerouting may affect estimated schedules.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg text-sm font-label-bold hover:bg-on-primary-fixed-variant transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-lg">explore</span>
            Explore All Public Services
          </Link>
        </div>
      </div>
    </div>
  );
};
