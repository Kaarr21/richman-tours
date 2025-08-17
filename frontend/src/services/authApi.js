// frontend/src/services/authApi.js - Enhanced version
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance for auth endpoints
const authApi = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create axios instance for general API calls
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management utilities
const TokenManager = {
  getAccessToken: () => localStorage.getItem('access_token'),
  getRefreshToken: () => localStorage.getItem('refresh_token'),
  setTokens: (access, refresh) => {
    localStorage.setItem('access_token', access);
    if (refresh) localStorage.setItem('refresh_token', refresh);
  },
  clearTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
  isTokenValid: (token) => {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
};

// Track refresh attempts to prevent infinite loops
let isRefreshing = false;
let refreshSubscribers = [];

const onTokenRefreshed = (token) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken();
    if (token && TokenManager.isTokenValid(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          addRefreshSubscriber((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = TokenManager.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await authApi.post('/refresh/', { 
          refresh: refreshToken 
        });
        
        const { access } = response.data;
        TokenManager.setTokens(access);
        
        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        
        // Notify all queued requests
        onTokenRefreshed(access);
        
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        TokenManager.clearTokens();
        
        // Redirect to login only if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/admin/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth API functions
export const loginUser = async (username, password) => {
  try {
    const response = await authApi.post('/login/', { username, password });
    const { access, refresh, user } = response.data;
    
    TokenManager.setTokens(access, refresh);
    
    return { access, refresh, user };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const refreshToken = async (refresh) => {
  try {
    const response = await authApi.post('/refresh/', { refresh });
    return response.data;
  } catch (error) {
    console.error('Refresh token error:', error);
    throw error;
  }
};

export const logoutUser = async (refresh) => {
  try {
    await authApi.post('/logout/', { refresh });
  } catch (error) {
    console.error('Logout error:', error);
    // Don't throw error for logout - clear tokens anyway
  } finally {
    TokenManager.clearTokens();
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/profile/');
    return response.data;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};

// Public API wrapper for unauthenticated requests
export const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Enhanced API wrapper with better error handling
export const apiCall = async (config) => {
  try {
    const response = await api(config);
    return response.data;
  } catch (error) {
    console.error(`API call failed [${config.method?.toUpperCase()} ${config.url}]:`, error);
    
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.detail || 
                          error.response.data?.message || 
                          error.response.data?.error ||
                          `Server error: ${error.response.status}`;
      throw new Error(errorMessage);
    } else if (error.request) {
      // Network error
      throw new Error('Network error - please check your connection');
    } else {
      // Request setup error
      throw new Error('Request configuration error');
    }
  }
};

// Public API wrapper for unauthenticated calls
export const publicApiCall = async (config) => {
  try {
    const response = await publicApi(config);
    return response.data;
  } catch (error) {
    console.error(`Public API call failed [${config.method?.toUpperCase()} ${config.url}]:`, error);
    
    if (error.response) {
      const errorMessage = error.response.data?.detail || 
                          error.response.data?.message || 
                          error.response.data?.error ||
                          `Server error: ${error.response.status}`;
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error('Network error - please check your connection');
    } else {
      throw new Error('Request configuration error');
    }
  }
};

export { api, TokenManager };
