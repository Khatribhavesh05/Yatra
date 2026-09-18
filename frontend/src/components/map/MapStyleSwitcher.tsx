import React from 'react';
import { TileStyle } from './MapContainer';

interface MapStyleSwitcherProps {
  activeStyle: TileStyle;
  onStyleChange: (style: TileStyle) => void;
}

const STYLE_OPTIONS: { id: TileStyle; label: string; icon: string }[] = [
  { id: 'osm', label: 'Street', icon: 'map' },
  { id: 'carto_voyager', label: 'Light', icon: 'terrain' },
  { id: 'carto_dark', label: 'Dark', icon: 'dark_mode' },
  { id: 'satellite', label: 'Satellite', icon: 'satellite_alt' },
];

export const MapStyleSwitcher: React.FC<MapStyleSwitcherProps> = ({ activeStyle, onStyleChange }) => {
  return (
    <div className="absolute bottom-6 left-6 bg-white border border-outline-variant rounded-xl shadow-lg p-1.5 flex flex-row gap-1 z-10">
      {STYLE_OPTIONS.map((opt) => {
        const isActive = activeStyle === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onStyleChange(opt.id)}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg transition-all ${
              isActive
                ? 'bg-primary/10 border-primary ring-2 ring-primary text-primary'
                : 'bg-surface hover:bg-surface-variant text-on-surface-variant'
            }`}
            title={opt.label}
          >
            <span className="material-symbols-outlined text-2xl mb-0.5">{opt.icon}</span>
            <span className="text-[10px] font-label-bold">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
