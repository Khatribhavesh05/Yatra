import client from './client';
import type { UserResponse, UserCreate, UserStatusUpdate } from '../types/api';

export const getUsers = async (departmentId?: string, limit?: number, offset?: number): Promise<UserResponse[]> => {
  const { data } = await client.get<UserResponse[]>('/api/admin/users', {
    params: { departmentId, limit, offset },
  });
  return data;
};

export const inviteUser = async (createData: UserCreate): Promise<UserResponse> => {
  const { data } = await client.post<UserResponse>('/api/admin/users/invite', createData);
  return data;
};

export const updateUserStatus = async (id: string, statusData: UserStatusUpdate): Promise<UserResponse> => {
  const { data } = await client.patch<UserResponse>(`/api/admin/users/${id}/status`, statusData);
  return data;
};
