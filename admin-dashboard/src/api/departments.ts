import client from './client';
import type { DepartmentResponse, DepartmentCreate, DepartmentUpdate } from '../types/api';

export const getDepartments = async (limit?: number, offset?: number): Promise<DepartmentResponse[]> => {
  const { data } = await client.get<DepartmentResponse[]>('/api/admin/departments', {
    params: { limit, offset },
  });
  return data;
};

export const createDepartment = async (createData: DepartmentCreate): Promise<DepartmentResponse> => {
  const { data } = await client.post<DepartmentResponse>('/api/admin/departments', createData);
  return data;
};

export const updateDepartment = async (id: string, updateData: DepartmentUpdate): Promise<DepartmentResponse> => {
  const { data } = await client.patch<DepartmentResponse>(`/api/admin/departments/${id}`, updateData);
  return data;
};
