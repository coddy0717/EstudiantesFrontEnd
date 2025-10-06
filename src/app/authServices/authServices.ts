import axios from 'axios';
import Router from 'next/router';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

type LoginCredentials = {
  nombre: string;
  password: string;
};

type LoginResponse = {
  access: string;
  refresh: string;
};

type ChangePasswordData = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await axios.post<LoginResponse>(`${API_URL}/token/`, credentials);
    localStorage.setItem('access', response.data.access);
    localStorage.setItem('refresh', response.data.refresh);
    return response.data;
  },

  changePassword: async (passwordData: ChangePasswordData): Promise<{ detail: string }> => {
    const token = localStorage.getItem('access');
    if (!token) throw new Error('No token found');

    try {
      const response = await axios.post(`${API_URL}/cambiar-password/`, passwordData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw error;
    }
  },

  refreshToken: async (): Promise<LoginResponse> => {
    const refresh = localStorage.getItem('refresh');
    const response = await axios.post<LoginResponse>(`${API_URL}/token/refresh/`, { refresh });
    localStorage.setItem('access', response.data.access);
    return response.data;
  },

  getToken: (): string | null => localStorage.getItem('access'),
  getRefreshToken: (): string | null => localStorage.getItem('refresh'),
  isAuthenticated: (): boolean => !!localStorage.getItem('access'),

  logout: () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    Router.push('/login');
  },
};
