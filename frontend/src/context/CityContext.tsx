import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { City, StateSummary } from '../types';
import { publicApi } from '../api/publicApi';

interface CityContextType {
  selectedCity: string;
  selectedState: string;
  setSelectedCity: (city: string) => void;
  setSelectedState: (state: string) => void;
  availableCities: City[];
  availableStates: StateSummary[];
  loadingCities: boolean;
  isCityModalOpen: boolean;
  openCityModal: () => void;
  closeCityModal: () => void;
  activeCityObj: City | undefined;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export const CityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedCity, setSelectedCityState] = useState<string>(() => {
    return localStorage.getItem('fleetiq_selected_city') || 'Bikaner';
  });

  const [selectedState, setSelectedStateState] = useState<string>(() => {
    return localStorage.getItem('fleetiq_selected_state') || 'Rajasthan';
  });

  const [availableCities, setAvailableCities] = useState<City[]>([]);
  const [availableStates, setAvailableStates] = useState<StateSummary[]>([]);
  const [loadingCities, setLoadingCities] = useState<boolean>(true);
  const [isCityModalOpen, setIsCityModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchCityData = async () => {
      try {
        setLoadingCities(true);
        const [statesData, citiesData] = await Promise.all([
          publicApi.getStates().catch(() => []),
          publicApi.getCities().catch(() => [])
        ]);
        setAvailableStates(statesData);
        setAvailableCities(citiesData);
      } catch (err) {
        console.error('Failed to load cities/states:', err);
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCityData();
  }, []);

  const setSelectedCity = (city: string) => {
    setSelectedCityState(city);
    localStorage.setItem('fleetiq_selected_city', city);
    const matched = availableCities.find((c) => c.name.toLowerCase() === city.toLowerCase());
    if (matched) {
      setSelectedStateState(matched.state);
      localStorage.setItem('fleetiq_selected_state', matched.state);
    }
  };

  const setSelectedState = (state: string) => {
    setSelectedStateState(state);
    localStorage.setItem('fleetiq_selected_state', state);
  };

  const activeCityObj = availableCities.find(
    (c) => c.name.toLowerCase() === selectedCity.toLowerCase()
  );

  return (
    <CityContext.Provider
      value={{
        selectedCity,
        selectedState,
        setSelectedCity,
        setSelectedState,
        availableCities,
        availableStates,
        loadingCities,
        isCityModalOpen,
        openCityModal: () => setIsCityModalOpen(true),
        closeCityModal: () => setIsCityModalOpen(false),
        activeCityObj,
      }}
    >
      {children}
    </CityContext.Provider>
  );
};

export const useCity = (): CityContextType => {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
};
