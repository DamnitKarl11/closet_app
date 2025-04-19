import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, authApi } from '../api';
import { AxiosError } from 'axios';

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
  const [token, setToken] = useState<string | null>(() => {
    const savedToken = localStorage.getItem('authToken');
    console.log('Initial token from localStorage:', savedToken);
    return savedToken;
  });

  useEffect(() => {
    console.log('Token changed in AuthContext:', token);
    if (token) {
      console.log('Setting Authorization headers with token:', token);
      // Set token for both API instances
      api.defaults.headers.common['Authorization'] = `Token ${token}`;
      authApi.defaults.headers.common['Authorization'] = `Token ${token}`;
      
      // Verify headers were set
      console.log('API headers after setting:', api.defaults.headers.common);
      console.log('Auth API headers after setting:', authApi.defaults.headers.common);
    } else {
      console.log('Removing Authorization headers');
      // Remove token from both API instances
      delete api.defaults.headers.common['Authorization'];
      delete authApi.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = async (username: string, password: string) => {
    try {
      console.log('Attempting login for user:', username);
      const response = await authApi.post('/api/accounts/login/', { username, password });
      console.log('Login response:', response.data);
      
      const { token: newToken, user_id, username: responseUsername } = response.data;
      console.log('Received new token:', newToken);
      
      localStorage.setItem('authToken', newToken);
      console.log('Token saved to localStorage');
      
      setToken(newToken);
      setUser({ id: user_id, username: responseUsername, email: '' });
      
      // Verify token was set correctly
      const storedToken = localStorage.getItem('authToken');
      console.log('Verified token in localStorage:', storedToken);
    } catch (error) {
      console.error('Login failed:', error);
      // Log more details about the error
      if (error instanceof AxiosError && error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
      }
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      console.log('Attempting registration for user:', username);
      const response = await authApi.post('/api/accounts/register/', { username, email, password });
      console.log('Registration response:', response.data);
      
      const { token: newToken, user } = response.data;
      console.log('Received new token:', newToken);
      
      localStorage.setItem('authToken', newToken);
      console.log('Token saved to localStorage');
      
      setToken(newToken);
      setUser(user);
      
      // Verify token was set correctly
      const storedToken = localStorage.getItem('authToken');
      console.log('Verified token in localStorage:', storedToken);
    } catch (error) {
      console.error('Registration failed:', error);
      if (error instanceof AxiosError && error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
      }
      throw error;
    }
  };

  const logout = () => {
    console.log('Logging out, removing token');
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