
// frontend/src/components/Login.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
  const { login, isAuthenticated, loading, error } = useAuth();
  const location = useLocation();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated()) {
    const from = location.state?.from?.pathname || '/admin';
    return <Navigate to={from} replace />;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.password.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await login(formData.username, formData.password);
      
      if (result.success) {
        // Redirect will happen automatically via Navigate component
        const from = location.state?.from?.pathname || '/admin';
        window.location.href = from;
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="logo">
            <h1>Richman Tours</h1>
            <span>Admin Panel</span>
          </div>
        </div>

        <div className="login-form-container">
          <form onSubmit={handleSubmit} className="login-form">
            <h2>Sign In</h2>
            <p>Enter your credentials to access the admin panel</p>

            {error && (
              <div className="error-message">
                <i className="error-icon">⚠️</i>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-container">
                <i className="input-icon">👤</i>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                  required
                  disabled={isSubmitting}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-container">
                <i className="input-icon">🔒</i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`login-btn ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting || loading}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="login-footer">
            <div className="security-info">
              <i className="security-icon">🛡️</i>
              <span>Secure admin access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
