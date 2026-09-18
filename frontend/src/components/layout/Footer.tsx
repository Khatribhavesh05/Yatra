import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-secondary text-on-primary transition-opacity duration-200 mt-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter max-w-container-max-width mx-auto px-gutter py-section-padding-desktop text-on-primary">
        {/* Brand Column */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/urja-logo-darkmode.svg"
              alt="URJA Logo"
              className="h-10 w-auto object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/urja-logo-darkmode.png';
              }}
            />
          </Link>
          <p className="font-body-md text-sm text-on-primary/80 leading-relaxed">
            An official Government initiative to accelerate electric mobility, unify charging infrastructure, and build a sustainable transportation ecosystem nationwide.
          </p>
          <div className="flex gap-3 pt-2">
            <a
              href="https://india.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-on-primary/10 flex items-center justify-center hover:bg-on-primary/20 transition-colors"
              title="National Portal of India"
            >
              <span className="material-symbols-outlined text-lg">public</span>
            </a>
            <Link
              to="/help"
              className="w-9 h-9 rounded-full bg-on-primary/10 flex items-center justify-center hover:bg-on-primary/20 transition-colors"
              title="Help & Emergency Helpline"
            >
              <span className="material-symbols-outlined text-lg">call</span>
            </Link>
          </div>
        </div>

        {/* Links Column 1 - Platform */}
        <div>
          <h4 className="font-label-bold text-label-bold text-on-primary mb-4 uppercase tracking-wider text-xs">
            Platform Services
          </h4>
          <ul className="space-y-2.5 font-body-md text-sm">
            <li>
              <Link to="/services" className="text-on-primary/80 hover:text-on-primary hover:underline transition-colors">
                Public Services Hub
              </Link>
            </li>
            <li>
              <Link to="/bus" className="text-on-primary/80 hover:text-on-primary hover:underline transition-colors">
                Where Is My Bus?
              </Link>
            </li>
            <li>
              <Link to="/charging" className="text-on-primary/80 hover:text-on-primary hover:underline transition-colors">
                Charging Centers Directory
              </Link>
            </li>
            <li>
              <Link to="/network" className="text-on-primary/80 hover:text-on-primary hover:underline transition-colors">
                Transit Network
              </Link>
            </li>
            <li>
              <Link to="/vehicles" className="text-on-primary/80 hover:text-on-primary hover:underline transition-colors">
                Green Fleet Intelligence
              </Link>
            </li>
          </ul>
        </div>

        {/* Links Column 2 - Resources */}
        <div>
          <h4 className="font-label-bold text-label-bold text-on-primary mb-4 uppercase tracking-wider text-xs">
            Resources & Policies
          </h4>
          <ul className="space-y-2.5 font-body-md text-sm">
            <li>
              <Link to="/resources" className="text-on-primary/80 hover:text-on-primary hover:underline transition-colors">
                EV Guidelines & Manuals
              </Link>
            </li>
            <li>
              <Link to="/resources#policies" className="text-on-primary/80 hover:text-on-primary hover:underline transition-colors">
                National EV Policies
              </Link>
            </li>
            <li>
              <Link to="/resources#faqs" className="text-on-primary/80 hover:text-on-primary hover:underline transition-colors">
                Frequently Asked Questions
              </Link>
            </li>
            <li>
              <Link to="/help" className="text-on-primary/80 hover:text-on-primary hover:underline transition-colors">
                Grievance & Helpline
              </Link>
            </li>
          </ul>
        </div>

        {/* Links Column 3 - About & Governance */}
        <div>
          <h4 className="font-label-bold text-label-bold text-on-primary mb-4 uppercase tracking-wider text-xs">
            About & Trust
          </h4>
          <ul className="space-y-2.5 font-body-md text-sm">
            <li>
              <Link to="/about" className="text-on-primary/80 hover:text-on-primary hover:underline transition-colors">
                Mission & Vision
              </Link>
            </li>
            <li>
              <Link to="/about#privacy" className="text-on-primary/80 hover:text-on-primary hover:underline transition-colors">
                Data Privacy & Safeguards
              </Link>
            </li>
            <li>
              <Link to="/login" className="text-on-primary/80 hover:text-on-primary hover:underline transition-colors">
                Charging Operator Portal
              </Link>
            </li>
            <li>
              <Link to="/help" className="text-on-primary/80 hover:text-on-primary hover:underline transition-colors">
                Emergency Control Rooms
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-on-primary/20 bg-secondary/90">
        <div className="max-w-container-max-width mx-auto px-gutter py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body-md text-xs text-on-primary/80">
            © 2024-2026 URJA (FleetIQ). All rights reserved. Government of India Initiative.
          </p>
          <div className="flex flex-wrap gap-6 font-body-md text-xs text-on-primary/80">
            <Link to="/about#privacy" className="hover:text-on-primary hover:underline">
              Privacy Policy
            </Link>
            <Link to="/about#terms" className="hover:text-on-primary hover:underline">
              Terms of Use
            </Link>
            <Link to="/about#accessibility" className="hover:text-on-primary hover:underline">
              Accessibility Statement
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
