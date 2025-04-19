import axios from 'axios';
import { ClothingItem, WearLog, WeatherSuggestion, Weather } from './types';
import { API_BASE_URL, AUTH_BASE_URL } from './config';

// Create a separate instance for auth requests (no credentials needed)
const authApi = axios.create({
  baseURL: AUTH_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const getClothingItems = async (): Promise<ClothingItem[]> => {
  const response = await api.get('/clothing-items/');
  return response.data;
};

export interface ClothingItemFormData {
  name: string;
  category: string;
  color: string;
  size: string;
  brand?: string;
  image?: File;
  weather_suitability: string;
}

export const createClothingItem = async (itemData: ClothingItemFormData): Promise<ClothingItem> => {
  const formData = new FormData();
  Object.entries(itemData).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, value);
    }
  });

  const response = await api.post('/clothing-items/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateClothingItem = async (id: number, itemData: ClothingItemFormData): Promise<ClothingItem> => {
  const formData = new FormData();
  Object.entries(itemData).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, value);
    }
  });

  const response = await api.patch(`/clothing-items/${id}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteClothingItem = async (id: number): Promise<void> => {
  await api.delete(`/clothing-items/${id}/`);
};

export const getWearLogs = async (): Promise<WearLog[]> => {
  const response = await api.get('/wear-logs/');
  return response.data;
};

export const createWearLog = async (logData: Partial<WearLog>): Promise<WearLog> => {
  const response = await api.post('/wear-logs/', logData);
  return response.data;
};

export const deleteWearLog = async (id: number): Promise<void> => {
  const response = await api.delete(`/wear-logs/${id}/`);
  if (response.status !== 204) {
    throw new Error('Failed to delete wear log');
  }
};

export const getWeatherSuggestions = async (city?: string, zipCode?: string): Promise<WeatherSuggestion> => {
  const params = new URLSearchParams();
  if (city) params.append('city', city);
  if (zipCode) params.append('zip_code', zipCode);
  
  const response = await api.get(`/clothing-items/suggestions/?${params.toString()}`);
  return response.data;
};

export const getCurrentWeather = async (): Promise<Weather> => {
  const response = await api.get('/weather/current/');
  return response.data;
};

export const login = async (username: string, password: string) => {
  try {
    // Use authApi for login request
    const response = await authApi.post('accounts/login/', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}; 