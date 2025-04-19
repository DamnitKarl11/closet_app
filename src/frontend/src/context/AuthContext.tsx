import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, authApi } from '../api';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));

  useEffect(() => {
    if (token) {
      // Set token for both API instances
      api.defaults.headers.common['Authorization'] = `Token ${token}`;
      authApi.defaults.headers.common['Authorization'] = `Token ${token}`;
    } else {
      // Remove token from both API instances
      delete api.defaults.headers.common['Authorization'];
      delete authApi.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = async (username: string, password: string) => {
    try {
      const response = await authApi.post('accounts/login/', { username, password });
      const { token: newToken, user_id, username: responseUsername } = response.data;
      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      setUser({ id: user_id, username: responseUsername, email: '' });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await authApi.post('accounts/register/', { username, email, password });
      const { token: newToken, user } = response.data;
      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      setUser(user);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token }}>
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