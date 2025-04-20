import axios from 'axios';
import { ClothingItem, WearLog, WeatherSuggestion, Weather } from './types';
import { API_BASE_URL, AUTH_BASE_URL } from './config';

// Create a separate instance for auth requests
export const authApi = axios.create({
  baseURL: AUTH_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  console.log('API Request:', {
    url: config.url,
    method: config.method,
    token: token,
    headers: config.headers
  });
  
  if (token) {
    config.headers.Authorization = `Token ${token}`;
    console.log('Added token to request headers:', config.headers);
  } else {
    console.warn('No auth token found in localStorage');
    if (!config.url?.includes('login') && !config.url?.includes('register')) {
      console.log('Non-auth request without token, redirecting to login');
      window.location.href = '/login';
    }
  }
  return config;
});

// Add same token handling to authApi
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  console.log('Auth API Request:', {
    url: config.url,
    method: config.method,
    token: token,
    headers: config.headers
  });
  
  if (token && !config.url?.includes('login') && !config.url?.includes('register')) {
    config.headers.Authorization = `Token ${token}`;
    console.log('Added token to auth request headers:', config.headers);
  }
  return config;
});

// Add response interceptors to both API instances
authApi.interceptors.response.use(
  (response) => {
    console.log('Auth API Response:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error('Auth API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });
    return Promise.reject(error);
  }
);

// Error handling interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.config.url);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('API Error Response:', error.response.data);
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Request URL:', error.config.url);
      console.error('Request method:', error.config.method);
      console.error('Request headers:', error.config.headers);
      
      if (error.response.status === 401) {
        console.error('Unauthorized: Token might be invalid or expired');
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
      console.error('Request config:', error.config);
    } else {
      console.error('Error setting up request:', error.message);
      console.error('Error config:', error.config);
    }
    return Promise.reject(error);
  }
);

export const getClothingItems = async (): Promise<ClothingItem[]> => {
  try {
    console.log('Fetching clothing items from:', `${API_BASE_URL}/clothing-items/`);
    const response = await api.get('/clothing-items/');
    console.log('Clothing items response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching clothing items:', error);
    throw error;
  }
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
  try {
    const response = await api.get('/weather/current/');
    return response.data;
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw error;
  }
};

export const login = async (username: string, password: string) => {
  try {
    // Use authApi for login request
    const response = await authApi.post('/api/accounts/login/', { username, password });
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}; 