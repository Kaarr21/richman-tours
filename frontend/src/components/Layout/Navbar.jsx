// src/components/Layout/Navbar.jsx
import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
//import { motion, AnimatePresence } from 'framer-motion'
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
    { name: 'Tours', href: '/tours' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <>
      {/* Top Bar */}
      <div className="bg-primary-900 text-white py-2 px-4 hidden md:block">
        <div className="container mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <MapPinIcon className="h-4 w-4" />
              <span>Nairobi, Kenya</span>
            </div>
            <div className="flex items-center space-x-2">
              <PhoneIcon className="h-4 w-4" />
              <span>+254 700 123 456</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/booking/check" className="hover:text-accent-300 transition-colors">
              Check Booking
            </Link>
            <span>•</span>
            <a href="mailto:info@richmantours.co.ke" className="hover:text-accent-300 transition-colors">
              info@richmantours.co.ke
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <motion.nav
        initial={false}
        animate={{
          backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 1)',
          backdropFilter: isScrolled ? 'blur(10px)' : 'none',
        }}
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled ? 'shadow-lg' : 'shadow-sm'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-primary-600 to-safari-500 p-2 rounded-lg">
                <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" />
                  <path d="M12 7L8 12h3v5h2v-5h3l-4-5z" fill="white" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold font-heading bg-gradient-to-r from-primary-600 to-safari-600 bg-clip-text text-transparent">
                  Richman Tours
                </h1>
                <p className="text-xs text-gray-600 -mt-1">& Travel</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`relative px-3 py-2 rounded-md font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'text-primary-600'
                      : 'text-gray-700 hover:text-primary-600'
                  }`}
                >
                  {item.name}
                  {isActive(item.href) && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary-600 rounded-full"
                      initial={false}
                    />
                  )}
                </Link>
              ))}
              
              {/* CTA Button */}
              <Link
                to="/tours"
                className="bg-gradient-to-r from-primary-600 to-safari-600 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Book Now
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 transition-colors"
              >
                {isOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-white border-t border-gray-200"
            >
              <div className="px-4 py-6 space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                <Link
                  to="/tours"
                  className="block bg-gradient-to-r from-primary-600 to-safari-600 text-white text-center px-4 py-3 rounded-lg font-medium"
                >
                  Book Now
                </Link>
                <div className="pt-4 border-t border-gray-200">
                  <Link
                    to="/booking/check"
                    className="block text-gray-600 hover:text-primary-600 py-2"
                  >
                    Check Booking Status
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  )
}

export default Navbar
