import api from './api';
import type { LoginRequest, RegisterRequest, AuthResponse, MessageResponse } from '../types';

export const AuthService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  forgotPassword: async (email: string): Promise<MessageResponse> => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  
  resetPassword: async (token: string, newPassword: string): Promise<MessageResponse> => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  verifyEmail: async (token: string): Promise<MessageResponse> => {
    const response = await api.get(`/auth/verify?token=${token}`);
    return response.data;
  },

  oauth2Google: async (token: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/oauth2/google', { token });
    return response.data;
  },

  oauth2Facebook: async (token: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/oauth2/facebook', { token });
    return response.data;
  }
};
