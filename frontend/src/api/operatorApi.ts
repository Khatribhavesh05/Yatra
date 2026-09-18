import api from './client';
import { ChargingCenter } from '../types';

export const operatorApi = {
  getStations: async (): Promise<ChargingCenter[]> => {
    const res = await api.get('/api/charging-operator/stations');
    return res.data;
  },

  getStationById: async (id: string): Promise<ChargingCenter> => {
    const res = await api.get(`/api/charging-operator/stations/${id}`);
    return res.data;
  },

  updateStation: async (id: string, data: Partial<ChargingCenter>): Promise<ChargingCenter> => {
    const res = await api.patch(`/api/charging-operator/stations/${id}`, data);
    return res.data;
  },
};
