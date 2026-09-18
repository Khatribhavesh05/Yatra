import api from './client';
import {
  ChargingCenter,
  City,
  StateSummary,
  Route,
  Stop,
  StopDetail,
  HelpContact,
  VehiclePublic
} from '../types';

export const publicApi = {
  // Charging Centers
  getChargingCenters: async (params?: {
    search?: string;
    city?: string;
    state?: string;
    lat?: number;
    lng?: number;
    radius_km?: number;
    skip?: number;
    limit?: number;
  }): Promise<ChargingCenter[]> => {
    const res = await api.get('/api/public/charging-centers', { params });
    return res.data;
  },

  getChargingCenterById: async (id: string): Promise<ChargingCenter> => {
    const res = await api.get(`/api/public/charging-centers/${id}`);
    return res.data;
  },

  registerChargingCenter: async (data: Partial<ChargingCenter>): Promise<ChargingCenter> => {
    const res = await api.post('/api/public/charging-centers/register', data);
    return res.data;
  },

  // States & Cities
  getStates: async (): Promise<StateSummary[]> => {
    const res = await api.get('/api/public/states');
    return res.data;
  },

  getCities: async (state?: string): Promise<City[]> => {
    const res = await api.get('/api/public/cities', { params: { state } });
    return res.data;
  },

  // Transit Routes & Stops
  getRoutes: async (city?: string): Promise<Route[]> => {
    const res = await api.get('/api/public/routes', { params: { city } });
    return res.data;
  },

  getRouteById: async (id: string): Promise<Route> => {
    const res = await api.get(`/api/public/routes/${id}`);
    return res.data;
  },

  getStops: async (city?: string): Promise<Stop[]> => {
    const res = await api.get('/api/public/stops', { params: { city } });
    return res.data;
  },

  getStopById: async (id: string): Promise<StopDetail> => {
    const res = await api.get(`/api/public/stops/${id}`);
    return res.data;
  },

  // Public Vehicles (Electric Buses, Ambulances, etc.)
  getVehicles: async (params?: {
    vehicle_type?: string;
    city?: string;
    route_id?: string;
    search?: string;
    skip?: number;
    limit?: number;
  }): Promise<VehiclePublic[]> => {
    const res = await api.get('/api/public/vehicles', { params });
    return res.data;
  },

  getVehicleById: async (id: string): Promise<VehiclePublic> => {
    const res = await api.get(`/api/public/vehicles/${id}`);
    return res.data;
  },

  // Help & Emergency Contacts
  getHelpContacts: async (params?: {
    city?: string;
    state?: string;
    category?: string;
  }): Promise<HelpContact[]> => {
    const res = await api.get('/api/public/help-contacts', { params });
    return res.data;
  },
};
