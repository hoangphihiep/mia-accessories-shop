import { createContext, useContext, useState, type ReactNode } from 'react';
import type { UserResponse } from '../types';

interface AuthContextType {
  token: string | null;
  user: UserResponse | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, refreshToken: string, user: UserResponse, rememberMe?: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token') || sessionStorage.getItem('token')
  );
  
  const [user, setUser] = useState<UserResponse | null>(() => {
    const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!savedUser || savedUser === 'undefined') return null;
    try {
      return JSON.parse(savedUser);
    } catch (e) {
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      return null;
    }
  });

  const login = (newToken: string, newRefreshToken: string, newUser: UserResponse, rememberMe: boolean = true) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('token', newToken);
    storage.setItem('refreshToken', newRefreshToken);
    storage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    // Gọi API logout để đưa token vào blacklist (fire and forget)
    try {
      if (token) {
        await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'}/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (e) {
      console.error('Logout API failed', e);
    }

    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role?.name === 'ROLE_ADMIN' || user?.role?.name === 'ROLE_STAFF';

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
