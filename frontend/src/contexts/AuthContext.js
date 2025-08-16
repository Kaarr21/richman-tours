// frontend/src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, refreshToken, logoutUser, getCurrentUser } from '../services/authApi';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on app load
  useEffect(() => {
    initializeAuth();
  }, []);

  // Set up token refresh interval
  useEffect(() => {
    let refreshInterval;
    
    if (user) {
      // Refresh token every 45 minutes (token expires in 1 hour)
      refreshInterval = setInterval(async () => {
        try {
          await handleRefreshToken();
        } catch (error) {
          console.error('Token refresh failed:', error);
          handleLogout();
        }
      }, 45 * 60 * 1000); // 45 minutes
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [user]);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        // Verify token and get user info
        const userData = await getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      // Clear invalid tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (username, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await loginUser(username, password);
      
      // Store tokens
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      
      // Set user data
      setUser(response.user);
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.error || 
                          error.message || 
                          'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshToken = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) {
        throw new Error('No refresh token available');
      }

      const response = await refreshToken(refresh);
      localStorage.setItem('access_token', response.access);
      
      // Update user info if provided
      if (response.user) {
        setUser(response.user);
      }
      
      return response;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        await logoutUser(refresh);
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear tokens and user state regardless of API call success
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setError(null);
    }
  };

  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('access_token');
  };

  const isAdmin = () => {
    return user && (user.is_staff || user.is_admin);
  };

  const value = {
    user,
    loading,
    error,
    login: handleLogin,
    logout: handleLogout,
    refreshToken: handleRefreshToken,
    isAuthenticated,
    isAdmin,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
