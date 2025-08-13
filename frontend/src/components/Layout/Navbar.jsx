// src/components/Layout/Navbar.jsx
import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Bars3Icon, 
  XMarkIcon,
  MapPinIcon,
  PhoneIcon
} from '@heroicons/react/24/outline'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [location])

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Destinations', href: '/destinations' },
    { name: 'About Richard', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <>
      {/* Top Bar */}
      <div className="bg-primary-900 text-white py-2 px-4 hidden md-block">
        <div className="container flex justify-between items-center text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <MapPinIcon style={{ height: '16px', width: '16px' }} />
              <span>Nairobi, Kenya</span>
            </div>
            <div className="flex items-center space-x-2">
              <PhoneIcon style={{ height: '16px', width: '16px' }} />
              <span>+254 700 123 456</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span>•</span>
            <a href="mailto:info@richmantours.co.ke" className="hover-text-accent-300 transition-colors">
              info@richmantours.co.ke
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="navbar-brand">
              <div className="navbar-brand-icon">
                <svg 
                  style={{ height: '32px', width: '32px' }} 
                  className="text-white" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" />
                  <path d="M12 7L8 12h3v5h2v-5h3l-4-5z" fill="white" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold font-heading gradient-text">
                  Richman Tours
                </h1>
                <p className="text-xs text-gray-600" style={{ marginTop: '-4px' }}>
                  & Travel
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="navbar-nav">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`navbar-nav-item ${isActive(item.href) ? 'active' : ''}`}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* CTA Button */}
              <Link
                to="/contact"
                className="btn btn-primary px-6 py-2 rounded-full hover-translate-y"
              >
                Plan Trip
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md-hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-md text-gray-700 hover-text-primary-600 hover-bg-gray-100 transition-colors"
              >
                {isOpen ? (
                  <XMarkIcon style={{ height: '24px', width: '24px' }} />
                ) : (
                  <Bars3Icon style={{ height: '24px', width: '24px' }} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="mobile-menu">
            <div className="px-4 py-6 space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover-bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                to="/contact"
                className="block bg-gradient-primary text-white text-center px-4 py-3 rounded-lg font-medium"
              >
                Plan Trip
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}

export default Navbar
