import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as loginApi, refreshToken, getMe } from '../api/auth';
import { UserMeResponse, TokenResponse } from '../types/api';
import { STORAGE_KEYS } from '../utils/constants';

interface AuthContextType {
  user: UserMeResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserMeResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isAuthenticated = !!user;

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    setUser(null);
    window.location.href = '/login';
  };

  const refreshUser = async () => {
    try {
      const userData = await getMe();
      setUser(userData);
    } catch (error) {
      console.error('Failed to get user', error);
      throw error;
    }
  };

  const checkAuth = async () => {
    setIsLoading(true);
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      try {
        await refreshUser();
      } catch (error: any) {
        if (error.response?.status === 401) {
          try {
            const refresh = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
            if (refresh) {
              const tokens = await refreshToken(refresh);
              localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
              localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);
              await refreshUser();
            } else {
              handleLogout();
            }
          } catch (refreshError) {
            handleLogout();
          }
        } else {
          handleLogout();
        }
      }
    } else {
      setUser(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    const tokens = await loginApi(email, password);
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);
    await refreshUser();
  };

  const logout = () => {
    handleLogout();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
