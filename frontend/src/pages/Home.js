// src/pages/Home.js - Fixed with proper error handling
import React, { useState, useEffect } from 'react';
import TourCard from '../components/TourCard';
import { getFeaturedTours, getTestimonials } from '../services/api';
import '../styles/Home.css';

const Home = () => {
  const [featuredTours, setFeaturedTours] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        
        // Fetch data with individual error handling
        const fetchPromises = await Promise.allSettled([
          getFeaturedTours(),
          getTestimonials()
        ]);

        // Handle tours data
        const [toursResult, testimonialsResult] = fetchPromises;

        if (toursResult.status === 'fulfilled') {
          const toursData = toursResult.value;
          // Ensure it's an array before slicing
          if (Array.isArray(toursData)) {
            setFeaturedTours(toursData.slice(0, 3));
          } else {
            console.warn('Tours data is not an array:', toursData);
            setFeaturedTours([]);
          }
        } else {
          console.error('Error fetching tours:', toursResult.reason);
          setFeaturedTours([]);
        }

        // Handle testimonials data
        if (testimonialsResult.status === 'fulfilled') {
          const testimonialsData = testimonialsResult.value;
          // Ensure it's an array before slicing
          if (Array.isArray(testimonialsData)) {
            setTestimonials(testimonialsData.slice(0, 3));
          } else {
            console.warn('Testimonials data is not an array:', testimonialsData);
            setTestimonials([]);
          }
        } else {
          console.error('Error fetching testimonials:', testimonialsResult.reason);
          setTestimonials([]);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load page data. Please refresh and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="home">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home">
        <div className="container">
          <div className="error-container">
            <h2>Oops! Something went wrong</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Discover Amazing Adventures</h1>
            <p>Join us for unforgettable tours and experiences around the world</p>
            <div className="hero-actions">
              <a href="/contact" className="btn-primary">Book Now</a>
              <a href="/gallery" className="btn-secondary">View Gallery</a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tours Section */}
      <section className="featured-tours">
        <div className="container">
          <h2>Featured Tours</h2>
          <div className="tours-grid">
            {featuredTours.length > 0 ? (
              featuredTours.map(tour => (
                <TourCard key={tour.id} tour={tour} />
              ))
            ) : (
              <div className="no-tours">
                <p>No featured tours available at the moment.</p>
                <a href="/contact" className="contact-link">Contact us to learn about available tours</a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-us">
        <div className="container">
          <h2>Why Choose Richman Tours?</h2>
          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon">🌟</div>
              <h3>Expert Guides</h3>
              <p>Our experienced guides ensure you have the best adventure while staying safe.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">💰</div>
              <h3>Best Prices</h3>
              <p>We offer competitive prices without compromising on quality and service.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🛡️</div>
              <h3>Safety First</h3>
              <p>Your safety is our priority. All tours include comprehensive safety measures.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🎯</div>
              <h3>Customized Tours</h3>
              <p>We tailor each tour to your preferences for a truly personalized experience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <h2>What Our Customers Say</h2>
          <div className="testimonials-grid">
            {testimonials.length > 0 ? (
              testimonials.map(testimonial => (
                <div key={testimonial.id} className="testimonial">
                  <div className="rating">
                    {'⭐'.repeat(testimonial.rating || 5)}
                  </div>
                  <p>"{testimonial.comment}"</p>
                  <div className="testimonial-author">
                    <strong>{testimonial.name}</strong>
                    {testimonial.location && <span className="location"> - {testimonial.location}</span>}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-testimonials">
                <p>Customer reviews will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready for Your Next Adventure?</h2>
          <p>Contact us today to start planning your dream vacation.</p>
          <a href="/contact" className="cta-btn">Get Started</a>
        </div>
      </section>
    </div>
  );
};

export default Home;
