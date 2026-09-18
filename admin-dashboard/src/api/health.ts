import client from './client';
import type { HealthResponse } from '../types/api';

export const getHealth = async (): Promise<HealthResponse> => {
  const { data } = await client.get<HealthResponse>('/health');
  return data;
};
