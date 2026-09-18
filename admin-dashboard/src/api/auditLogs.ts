import client from './client';
import type { AuditLogResponse } from '../types/api';

export const getAuditLogs = async (limit?: number, offset?: number): Promise<AuditLogResponse[]> => {
  const { data } = await client.get<AuditLogResponse[]>('/api/admin/audit-logs', {
    params: { limit, offset },
  });
  return data;
};
