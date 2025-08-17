// frontend/src/components/Login.js - Fixed version
import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, error, isAuthenticated, isAdmin, setError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination from location state
  const from = location.state?.from?.pathname || '/admin';

  // Clear any previous errors when component mounts
  useEffect(() => {
    setError(null);
  }, [setError]);

  // Redirect if already authenticated and is admin
  if (isAuthenticated() && isAdmin()) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    
    try {
      const result = await login(username.trim(), password);
      
      if (result.success) {
        // Check if user is admin after successful login
        if (isAdmin()) {
          navigate(from, { replace: true });
        } else {
          setError('Access denied. Admin privileges required.');
          // Clear tokens for non-admin users
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      } else {
        // Error is already set by the login function
        console.error('Login failed:', result.error);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  return (
    <div className="login">
      <div className="login-container">
        <div className="login-header">
          <div className="logo">
            <h1>Richman Tours</h1>
            <p>Admin Panel</p>
          </div>
        </div>

        <div className="login-card">
          <div className="card-header">
            <h2>Admin Login</h2>
            <p>Sign in to access the admin dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-container">
                <span className="input-icon">👤</span>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={handleInputChange(setUsername)}
                  placeholder="Enter your username"
                  disabled={loading}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-container">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handleInputChange(setPassword)}
                  placeholder="Enter your password"
                  disabled={loading}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  tabIndex={-1}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={loading || !username.trim() || !password.trim()}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>
              <a href="/" className="back-link">
                ← Back to Website
              </a>
            </p>
            
            <div className="security-notice">
              <small>
                🔐 This is a secure admin area. All activities are logged for security purposes.
              </small>
            </div>
          </div>
        </div>

        <div className="login-help">
          <div className="help-section">
            <h4>Need Help?</h4>
            <ul>
              <li>Make sure you have admin privileges</li>
              <li>Check your username and password</li>
              <li>Contact system administrator if issues persist</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
