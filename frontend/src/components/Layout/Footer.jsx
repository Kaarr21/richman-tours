// src/components/Layout/Footer.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  GlobeAltIcon 
} from '@heroicons/react/24/outline'

const Footer = () => {
  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'Tours', href: '/tours' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Booking Check', href: '/booking/check' }
  ]

  const tourCategories = [
    { name: 'Safari Tours', href: '/tours?category=safari' },
    { name: 'Cultural Tours', href: '/tours?category=cultural' },
    { name: 'Adventure Tours', href: '/tours?category=adventure' },
    { name: 'Beach Tours', href: '/tours?category=beach' },
    { name: 'Mountain Tours', href: '/tours?category=mountain' }
  ]

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
    { name: 'Twitter', href: '#', icon: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' },
    { name: 'Instagram', href: '#', icon: 'M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM12.017 7.72c2.356 0 4.267 1.912 4.267 4.267c0 2.356-1.911 4.267-4.267 4.267c-2.355 0-4.267-1.911-4.267-4.267c0-2.355 1.912-4.267 4.267-4.267zm6.124-4.267c.551 0 .998.447.998.998s-.447.998-.998.998s-.998-.447-.998-.998s.447-.998.998-.998zM18.124 12.017c0 3.365-2.73 6.094-6.094 6.094s-6.094-2.729-6.094-6.094s2.729-6.094 6.094-6.094s6.094 2.729 6.094 6.094z' },
    { name: 'YouTube', href: '#', icon: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' }
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container py-16">
        <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg-col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-primary p-2 rounded-lg">
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
                <h3 className="text-2xl font-bold font-heading">Richman Tours</h3>
                <p className="text-sm text-gray-400">& Travel</p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6">
              Your trusted partner for unforgettable adventures across Kenya. 
              We specialize in creating personalized travel experiences that showcase 
              the beauty and culture of our homeland.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPinIcon style={{ height: '20px', width: '20px' }} className="text-safari-500" />
                <span className="text-gray-300">Nairobi, Kenya</span>
              </div>
              <div className="flex items-center space-x-3">
                <PhoneIcon style={{ height: '20px', width: '20px' }} className="text-safari-500" />
                <span className="text-gray-300">+254 700 123 456</span>
              </div>
              <div className="flex items-center space-x-3">
                <EnvelopeIcon style={{ height: '20px', width: '20px' }} className="text-safari-500" />
                <span className="text-gray-300">info@richmantours.co.ke</span>
              </div>
              <div className="flex items-center space-x-3">
                <GlobeAltIcon style={{ height: '20px', width: '20px' }} className="text-safari-500" />
                <span className="text-gray-300">www.richmantours.co.ke</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover-text-safari-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tour Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Tour Categories</h4>
            <ul className="space-y-3">
              {tourCategories.map((category) => (
                <li key={category.name}>
                  <Link
                    to={category.href}
                    className="text-gray-300 hover-text-safari-400 transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Business Hours & Social */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Business Hours</h4>
            <div className="text-gray-300 mb-6 space-y-2">
              <p><span className="text-white">Monday - Friday:</span> 8:00 AM - 6:00 PM</p>
              <p><span className="text-white">Saturday:</span> 9:00 AM - 4:00 PM</p>
              <p><span className="text-white">Sunday:</span> 10:00 AM - 2:00 PM</p>
              <p className="text-safari-400 text-sm">Available 24/7 for emergencies</p>
            </div>

            {/* Social Links */}
            <div>
              <h5 className="font-semibold mb-4">Follow Us</h5>
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="text-gray-400 hover-text-safari-400 transition-colors"
                    aria-label={social.name}
                  >
                    <svg 
                      style={{ height: '24px', width: '24px' }} 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d={social.icon} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container py-6">
          <div className="flex flex-col md-flex justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Richman Tours & Travel. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4" style={{ marginTop: '0' }}>
              <Link to="/privacy" className="text-gray-400 hover-text-safari-400 text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover-text-safari-400 text-sm transition-colors">
                Terms of Service
              </Link>
              <Link to="/sitemap" className="text-gray-400 hover-text-safari-400 text-sm transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
