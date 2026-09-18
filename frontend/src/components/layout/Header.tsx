import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCity } from '../../context/CityContext';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedCity, selectedState, openCityModal } = useCity();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Where Is My Bus?', path: '/bus' },
    { name: 'Charging Centers', path: '/charging' },
    { name: 'Network', path: '/network' },
    { name: 'Vehicles', path: '/vehicles' },
    { name: 'Resources', path: '/resources' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="w-full top-0 sticky z-40 bg-white/95 backdrop-blur-md border-b border-outline-variant transition-all duration-200 shadow-sm">
      <div className="flex justify-between items-center max-w-container-max-width mx-auto px-gutter h-20">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 group py-1">
          <img
            src="/urja-logo.svg"
            alt="URJA Logo"
            className="h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/urja-logo.png';
            }}
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6 font-body-md text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`transition-colors py-1 ${
                isActive(link.path)
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-primary font-medium'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Actions & City Picker */}
        <div className="hidden sm:flex items-center gap-3">
          {/* City Selector Button */}
          <button
            onClick={openCityModal}
            className="inline-flex items-center gap-1.5 bg-surface-container-low hover:bg-surface-container border border-outline-variant px-3 py-1.5 rounded text-xs font-label-bold text-on-surface transition-colors"
            title="Change City"
          >
            <span className="material-symbols-outlined text-primary text-base" data-weight="fill">
              location_on
            </span>
            <span>{selectedCity}</span>
            <span className="text-outline text-[10px]">({selectedState})</span>
            <span className="material-symbols-outlined text-outline text-sm">
              arrow_drop_down
            </span>
          </button>

          {/* Emergency / Help Quick Link */}
          <Link
            to="/help"
            className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded transition-colors"
            title="Emergency & Support Helplines"
          >
            <span className="material-symbols-outlined text-xl">call</span>
          </Link>

          {/* Auth Button */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/charging/operator"
                className="bg-secondary-container text-on-secondary-container px-3.5 py-2 rounded text-xs font-label-bold hover:bg-secondary-fixed transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">ev_station</span>
                Operator Portal
              </Link>
              <button
                onClick={logout}
                className="p-2 text-outline hover:text-error rounded transition-colors"
                title="Logout"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-primary text-on-primary px-4 py-2 rounded text-xs font-label-bold hover:bg-on-primary-fixed-variant transition-colors shadow-sm"
            >
              Operator Login
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={openCityModal}
            className="flex items-center gap-1 bg-surface-container-low border border-outline-variant px-2.5 py-1 rounded text-xs font-label-bold text-on-surface"
          >
            <span className="material-symbols-outlined text-primary text-sm" data-weight="fill">
              location_on
            </span>
            <span>{selectedCity}</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded text-on-surface hover:bg-surface-container transition-colors"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-outline-variant px-gutter py-4 space-y-3 shadow-lg animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 px-3 rounded text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-primary-container/10 text-primary font-bold'
                    : 'text-on-surface hover:bg-surface-container-low'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/help"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded text-sm font-medium text-on-surface hover:bg-surface-container-low flex items-center gap-2 text-error"
            >
              <span className="material-symbols-outlined text-base">emergency</span>
              Help & Emergency Helplines
            </Link>
          </div>

          <div className="pt-3 border-t border-outline-variant flex items-center justify-between">
            {isAuthenticated ? (
              <div className="flex items-center justify-between w-full">
                <Link
                  to="/charging/operator"
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-primary text-white px-4 py-2 rounded text-xs font-label-bold"
                >
                  Operator Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-error font-semibold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center bg-primary text-white py-2.5 rounded text-xs font-label-bold"
              >
                Operator Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
