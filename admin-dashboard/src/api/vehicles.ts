import client from './client';
import type { VehicleWithTelemetryResponse, VehicleTrackPoint } from '../types/api';

export const getVehicles = async (limit?: number, offset?: number): Promise<VehicleWithTelemetryResponse[]> => {
  const { data } = await client.get<VehicleWithTelemetryResponse[]>('/api/operator/vehicles', {
    params: { limit, offset },
  });
  return data;
};

export const getVehicle = async (id: string): Promise<VehicleWithTelemetryResponse> => {
  const { data } = await client.get<VehicleWithTelemetryResponse>(`/api/operator/vehicles/${id}`);
  return data;
};

export const getVehicleTrack = async (id: string, limit?: number): Promise<VehicleTrackPoint[]> => {
  const { data } = await client.get<VehicleTrackPoint[]>(`/api/operator/vehicles/${id}/track`, {
    params: { limit },
  });
  return data;
};
