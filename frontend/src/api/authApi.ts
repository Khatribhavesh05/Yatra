import api from './client';
import { User, AuthTokens } from '../types';

export const authApi = {
  login: async (email: string, password: string): Promise<AuthTokens> => {
    const res = await api.post('/api/auth/login', { email, password });
    return res.data;
  },

  getMe: async (): Promise<User> => {
    const res = await api.get('/api/auth/me');
    return res.data;
  },

  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    const res = await api.post('/api/auth/refresh', { refresh_token: refreshToken });
    return res.data;
  }
};
