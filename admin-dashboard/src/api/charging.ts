import client from './client';
import type { ChargingCenterPublicResponse } from '../types/api';

export const getChargingCenters = async (): Promise<ChargingCenterPublicResponse[]> => {
  const { data } = await client.get<ChargingCenterPublicResponse[]>('/api/public/charging-centers');
  return data;
};
