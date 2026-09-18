import axios from 'axios';

const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to inject JWT token for protected operator routes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fleetiq_access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token expiry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('fleetiq_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post('/api/auth/refresh', { refresh_token: refreshToken });
          localStorage.setItem('fleetiq_access_token', res.data.access_token);
          localStorage.setItem('fleetiq_refresh_token', res.data.refresh_token);
          originalRequest.headers.Authorization = `Bearer ${res.data.access_token}`;
          return api(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('fleetiq_access_token');
          localStorage.removeItem('fleetiq_refresh_token');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
