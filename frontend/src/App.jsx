// src/App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Components
import Navbar from './components/Layout/Navbar'
import Footer from './components/Layout/Footer'

// Pages
import Home from './pages/Home'
import Tours from './pages/Tours'
import TourDetail from './pages/TourDetail'
import About from './pages/About'
import Contact from './pages/Contact'
import Booking from './pages/Booking'
import BookingSuccess from './pages/BookingSuccess'
import BookingCheck from './pages/BookingCheck'

// Contexts
import { TourProvider } from './contexts/TourContext'
import { BookingProvider } from './contexts/BookingContext'

// Styles
import './index.css'

function App() {
  return (
    <TourProvider>
      <BookingProvider>
        <Router>
          <div className="min-h-screen bg-white">
            <Navbar />

            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tours" element={<Tours />} />
              <Route path="/tours/:slug" element={<TourDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/book/:tourSlug" element={<Booking />} />
              <Route path="/booking/success/:bookingReference" element={<BookingSuccess />} />
              <Route path="/booking/check" element={<BookingCheck />} />
            </Routes>

            <Footer />
          </div>
        </Router>
      </BookingProvider>
    </TourProvider>
  )
}

export default App
