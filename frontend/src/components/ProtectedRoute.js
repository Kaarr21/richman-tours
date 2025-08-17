// frontend/src/components/ProtectedRoute.js - Fixed version
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Show loading while authentication state is being determined
  if (loading) {
    return (
      <div className="protected-route-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated()) {
    // Redirect to login page with return URL
    return (
      <Navigate 
        to="/admin/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Check if admin access is required
  if (requireAdmin && !isAdmin()) {
    // User is authenticated but not an admin
    return (
      <div className="access-denied">
        <div className="container">
          <div className="access-denied-content">
            <h2>Access Denied</h2>
            <p>You don't have permission to access this area.</p>
            <p>Admin privileges are required.</p>
            <div className="access-denied-actions">
              <button onClick={() => window.history.back()}>
                Go Back
              </button>
              <a href="/" className="home-link">
                Return Home
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and has required permissions
  return children;
};

export default ProtectedRoute;
