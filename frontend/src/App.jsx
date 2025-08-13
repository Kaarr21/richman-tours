// src/App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { TourProvider } from './contexts/TourContext'
import { BookingProvider } from './contexts/BookingContext'

// Layout Components
import Navbar from './components/Layout/Navbar'
import Footer from './components/Layout/Footer'

// Pages
import Home from './pages/Home'
import Destinations from './pages/Destinations'
import About from './pages/About'
import Contact from './pages/Contact'
import Booking from './pages/Booking'
import BookingCheck from './pages/BookingCheck'
import BookingSuccess from './pages/BookingSuccess'

// Legacy tour pages (keep for backward compatibility)
import Tours from './pages/Tours'
import TourDetail from './pages/TourDetail'

import './App.css'

function App() {
  return (
    <TourProvider>
      <BookingProvider>
        <Router>
          <div className="App">
            <Navbar />
            <main className="min-h-screen">
              <Routes>
                {/* Main Pages */}
                <Route path="/" element={<Home />} />
                <Route path="/destinations" element={<Destinations />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                
                {/* Booking Pages */}
                <Route path="/booking" element={<Booking />} />
                <Route path="/booking/check" element={<BookingCheck />} />
                <Route path="/booking/success" element={<BookingSuccess />} />
                <Route path="/book/:slug" element={<Booking />} />
                
                {/* Legacy Tour Pages (for backward compatibility) */}
                <Route path="/tours" element={<Tours />} />
                <Route path="/tours/:slug" element={<TourDetail />} />
                
                {/* Redirect old tour routes to destinations */}
                <Route path="/tours" element={<Destinations />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </BookingProvider>
    </TourProvider>
  )
}

export default App
