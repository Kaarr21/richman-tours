// frontend/src/components/UserProfile.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { changePassword } from '../services/authApi';
import '../styles/UserProfile.css';

const UserProfile = ({ onClose }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (passwordError) setPasswordError('');
    if (passwordSuccess) setPasswordSuccess('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      await changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
        passwordForm.confirmPassword
      );
      
      setPasswordSuccess('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setPasswordError(
        error.response?.data?.error || 
        error.response?.data?.current_password?.[0] ||
        'Failed to change password'
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await logout();
      if (onClose) onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="profile-modal">
        <div className="modal-header">
          <h3>User Profile</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="profile-tabs">
          <button 
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button 
            className={activeTab === 'security' ? 'active' : ''}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
        </div>

        <div className="modal-content">
          {activeTab === 'profile' && (
            <div className="profile-info">
              <div className="user-avatar">
                <div className="avatar-circle">
                  {user?.username?.charAt(0).toUpperCase() || 'A'}
                </div>
              </div>
              
              <div className="user-details">
                <div className="detail-row">
                  <label>Username:</label>
                  <span>{user?.username}</span>
                </div>
                <div className="detail-row">
                  <label>Email:</label>
                  <span>{user?.email}</span>
                </div>
                <div className="detail-row">
                  <label>Role:</label>
                  <span>{user?.is_staff ? 'Staff' : 'Admin'}</span>
                </div>
                <div className="detail-row">
                  <label>Last Login:</label>
                  <span>
                    {user?.last_login ? 
                      new Date(user.last_login).toLocaleString() : 
                      'Never'
                    }
                  </span>
                </div>
              </div>

              <div className="profile-actions">
                <button 
                  className="btn-logout"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="security-settings">
              <h4>Change Password</h4>
              
              {passwordSuccess && (
                <div className="success-message">
                  {passwordSuccess}
                </div>
              )}
              
              {passwordError && (
                <div className="error-message">
                  {passwordError}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit}>
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    disabled={passwordLoading}
                  />
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength="8"
                    disabled={passwordLoading}
                  />
                  <small className="help-text">
                    Password must be at least 8 characters long
                  </small>
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    disabled={passwordLoading}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-change-password"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
