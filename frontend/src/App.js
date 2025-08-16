// frontend/src/App.js - Updated with authentication
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import About from './pages/About';
import Admin from './pages/Admin';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={
              <>
                <Header />
                <main className="main-content">
                  <Home />
                </main>
                <Footer />
              </>
            } />
            <Route path="/home" element={
              <>
                <Header />
                <main className="main-content">
                  <Home />
                </main>
                <Footer />
              </>
            } />
            <Route path="/gallery" element={
              <>
                <Header />
                <main className="main-content">
                  <Gallery />
                </main>
                <Footer />
              </>
            } />
            <Route path="/contact" element={
              <>
                <Header />
                <main className="main-content">
                  <Contact />
                </main>
                <Footer />
              </>
            } />
            <Route path="/about" element={
              <>
                <Header />
                <main className="main-content">
                  <About />
                </main>
                <Footer />
              </>
            } />
            
            {/* Admin routes */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin={true}>
                <Admin />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
