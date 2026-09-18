import React, { useState } from 'react';
import { useCity } from '../../context/CityContext';
import { Modal } from './Modal';
import { Button } from './Button';

export const CitySelectorModal: React.FC = () => {
  const {
    isCityModalOpen,
    closeCityModal,
    selectedCity,
    selectedState,
    setSelectedCity,
    availableCities,
    availableStates,
  } = useCity();

  const [filterState, setFilterState] = useState<string>(selectedState || 'Rajasthan');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredCities = availableCities.filter((c) => {
    const matchesState = filterState ? c.state.toLowerCase() === filterState.toLowerCase() : true;
    const matchesSearch = searchTerm ? c.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    return matchesState && matchesSearch;
  });

  const handleSelectCity = (cityName: string) => {
    setSelectedCity(cityName);
    closeCityModal();
  };

  return (
    <Modal
      isOpen={isCityModalOpen}
      onClose={closeCityModal}
      title="Select Your City"
      subtitle="Choose your city to access local bus routes, charging centers, and emergency services."
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* State Filter Tabs */}
        <div>
          <label className="block text-label-sm text-on-surface font-semibold mb-2">State</label>
          <div className="flex flex-wrap gap-2">
            {availableStates.map((st) => {
              const isSelected = filterState.toLowerCase() === st.state.toLowerCase();
              return (
                <button
                  key={st.state}
                  onClick={() => setFilterState(st.state)}
                  className={`px-3 py-1.5 rounded text-xs font-label-bold transition-colors ${
                    isSelected
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                  }`}
                >
                  {st.state} ({st.city_count})
                </button>
              );
            })}
          </div>
        </div>

        {/* City Search */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-lg">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search city name..."
            className="w-full bg-surface-container-low border border-outline-variant rounded text-sm pl-9 pr-4 py-2 focus:outline-none focus:border-primary focus:bg-white transition-colors"
          />
        </div>

        {/* City Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-1">
          {filteredCities.map((city) => {
            const isCurrent = city.name.toLowerCase() === selectedCity.toLowerCase();
            return (
              <button
                key={city.id}
                onClick={() => handleSelectCity(city.name)}
                className={`p-3 rounded border text-left flex items-center justify-between transition-all ${
                  isCurrent
                    ? 'border-primary bg-primary-container/10 text-primary font-bold shadow-sm'
                    : 'border-outline-variant hover:border-primary/50 hover:bg-surface-container-low text-on-surface'
                }`}
              >
                <div>
                  <div className="text-sm font-semibold">{city.name}</div>
                  <div className="text-[11px] text-on-surface-variant">{city.state}</div>
                </div>
                {isCurrent && (
                  <span className="material-symbols-outlined text-primary text-lg" data-weight="fill">
                    check_circle
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {filteredCities.length === 0 && (
          <div className="py-6 text-center text-sm text-on-surface-variant">
            No cities found matching your filter.
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <Button variant="outline" size="sm" onClick={closeCityModal}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
