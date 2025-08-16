// frontend/src/components/Header.js - Updated with admin link
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserProfile from './UserProfile';
import '../styles/Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const location = useLocation();
  const { isAuthenticated, isAdmin, user } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <Link to="/" onClick={closeMenu}>
                <h1>Richman Tours</h1>
                <span>Adventure Awaits</span>
              </Link>
            </div>

            <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
              <ul>
                <li>
                  <Link 
                    to="/home" 
                    className={isActive('/home') || isActive('/') ? 'active' : ''}
                    onClick={closeMenu}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/gallery" 
                    className={isActive('/gallery') ? 'active' : ''}
                    onClick={closeMenu}
                  >
                    Gallery
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/about" 
                    className={isActive('/about') ? 'active' : ''}
                    onClick={closeMenu}
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/contact" 
                    className={isActive('/contact') ? 'active' : ''}
                    onClick={closeMenu}
                  >
                    Contact
                  </Link>
                </li>
                {isAuthenticated() && isAdmin() && (
                  <li>
                    <Link 
                      to="/admin" 
                      className={`admin-link ${isActive('/admin') ? 'active' : ''}`}
                      onClick={closeMenu}
                    >
                      Admin Panel
                    </Link>
                  </li>
                )}
              </ul>

              {/* User menu for authenticated users */}
              {isAuthenticated() && (
                <div className="user-menu">
                  <button 
                    className="user-button"
                    onClick={() => setShowProfile(true)}
                  >
                    <div className="user-avatar">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="user-name">{user?.username}</span>
                  </button>
                </div>
              )}
            </nav>

            <button 
              className="menu-toggle" 
              onClick={toggleMenu}
              aria-label="Toggle navigation menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      {/* User Profile Modal */}
      {showProfile && (
        <UserProfile onClose={() => setShowProfile(false)} />
      )}
    </>
  );
};

export default Header;
