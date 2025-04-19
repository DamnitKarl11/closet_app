// API Configuration
const isDevelopment = import.meta.env.DEV;
const BASE_URL = isDevelopment ? '' : 'https://closet-app-g0ud.onrender.com';

// For regular API endpoints
export const API_BASE_URL = `${BASE_URL}/api`;

// For auth endpoints (login/register)
export const AUTH_BASE_URL = BASE_URL;  // Don't include /api here since it's in the endpoint path

// For media files
export const MEDIA_BASE_URL = `${BASE_URL}/media`; 