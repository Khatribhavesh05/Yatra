import client from './client';
import type { AlertResponse, AlertAckRequest } from '../types/api';

export const getAlerts = async (statusFilter?: string, limit?: number, offset?: number): Promise<AlertResponse[]> => {
  const { data } = await client.get<AlertResponse[]>('/api/operator/alerts', {
    params: { statusFilter, limit, offset },
  });
  return data;
};

export const acknowledgeAlert = async (id: string, ackData: AlertAckRequest): Promise<AlertResponse> => {
  const { data } = await client.post<AlertResponse>(`/api/operator/alerts/${id}/ack`, ackData);
  return data;
};
