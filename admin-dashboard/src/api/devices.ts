import client from './client';
import type { DeviceResponse, DeviceCreate } from '../types/api';

export const getDevices = async (limit?: number, offset?: number): Promise<DeviceResponse[]> => {
  const { data } = await client.get<DeviceResponse[]>('/api/admin/devices', {
    params: { limit, offset },
  });
  return data;
};

export const createDevice = async (createData: DeviceCreate): Promise<DeviceResponse> => {
  const { data } = await client.post<DeviceResponse>('/api/admin/devices', createData);
  return data;
};
