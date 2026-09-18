import client from './client';
import type { TokenResponse, UserMeResponse } from '../types/api';

export const login = async (email: string, password: string): Promise<TokenResponse> => {
  const { data } = await client.post<TokenResponse>('/api/auth/login', { email, password });
  return data;
};

export const refreshToken = async (refresh_token: string): Promise<TokenResponse> => {
  const { data } = await client.post<TokenResponse>('/api/auth/refresh', { refresh_token });
  return data;
};

export const getMe = async (): Promise<UserMeResponse> => {
  const { data } = await client.get<UserMeResponse>('/api/auth/me');
  return data;
};
