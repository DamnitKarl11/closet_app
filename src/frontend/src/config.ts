// API Configuration
const isDevelopment = import.meta.env.DEV;
const BASE_URL = isDevelopment ? '' : 'https://closet-app-g0ud.onrender.com';

export const API_BASE_URL = `${BASE_URL}/api`;
export const AUTH_BASE_URL = `${BASE_URL}/api`;
export const MEDIA_BASE_URL = `${BASE_URL}/media`; 