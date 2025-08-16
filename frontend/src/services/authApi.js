// frontend/src/services/authApi.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance for auth
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

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      
      try {
        const refresh = localStorage.getItem('refresh_token');
        if (refresh) {
          const response = await authApi.post('/refresh/', { refresh });
          localStorage.setItem('access_token', response.data.access);
          original.headers.Authorization = `Bearer ${response.data.access}`;
          return api(original);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/admin/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API functions
export const loginUser = async (username, password) => {
  try {
    const response = await authApi.post('/login/', { username, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const refreshToken = async (refresh) => {
  try {
    const response = await authApi.post('/refresh/', { refresh });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async (refresh) => {
  try {
    const response = await authApi.post('/logout/', { refresh });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/profile/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const changePassword = async (currentPassword, newPassword, confirmPassword) => {
  try {
    const response = await api.post('/auth/change-password/', {
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmPassword
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSecurityLogs = async () => {
  try {
    const response = await api.get('/auth/security-logs/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Export the API instance for use in other services
export { api };
