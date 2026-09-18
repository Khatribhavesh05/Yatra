import React from 'react';
import maplibregl from 'maplibre-gl';

export interface MapControlsProps {
  map: maplibregl.Map | null;
  onLocateMe?: () => void;
  onResetView?: () => void;
  className?: string;
}

export const MapControls: React.FC<MapControlsProps> = ({
  map,
  onLocateMe,
  onResetView,
  className = 'absolute bottom-6 right-4 z-10 flex flex-col gap-2',
}) => {
  const handleLocateUser = () => {
    if (onLocateMe) {
      onLocateMe();
      return;
    }
    if (navigator.geolocation && map) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          map.flyTo({
            center: [pos.coords.longitude, pos.coords.latitude],
            zoom: 14,
            essential: true,
          });
        },
        (err) => {
          console.warn('Geolocation failed:', err.message);
        }
      );
    }
  };

  return (
    <div className={className}>
      <button
        onClick={handleLocateUser}
        className="w-10 h-10 rounded-lg bg-white border border-outline-variant text-on-surface shadow-md flex items-center justify-center hover:bg-surface-container transition-colors"
        title="Locate Me"
      >
        <span className="material-symbols-outlined text-xl text-primary">my_location</span>
      </button>

      {onResetView && (
        <button
          onClick={onResetView}
          className="w-10 h-10 rounded-lg bg-white border border-outline-variant text-on-surface shadow-md flex items-center justify-center hover:bg-surface-container transition-colors"
          title="Reset City View"
        >
          <span className="material-symbols-outlined text-xl text-outline">center_focus_strong</span>
        </button>
      )}
    </div>
  );
};
