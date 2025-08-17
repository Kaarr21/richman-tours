// frontend/src/components/ProtectedRoute.js - Protected Route Component
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, adminRequired = false, fallback = null }) => {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  // Show loading spinner while authentication is being checked
  if (loading) {
    return fallback || (
      <div className="auth-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated()) {
    // Redirect to login with return URL
    return (
      <Navigate 
        to="/admin/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Check if admin access is required
  if (adminRequired && !isAdmin()) {
    return (
      <div className="access-denied">
        <div className="access-denied-container">
          <div className="access-denied-icon">🚫</div>
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
          <p>Admin privileges are required.</p>
          <div className="access-denied-actions">
            <button 
              onClick={() => window.history.back()}
              className="btn-secondary"
            >
              Go Back
            </button>
            <a href="/" className="btn-primary">
              Return to Website
            </a>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and has required permissions
  return children;
};

export default ProtectedRoute;
