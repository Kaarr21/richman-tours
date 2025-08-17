// frontend/src/pages/Home.js - Fixed version with proper error handling and export
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedTours, getTestimonials } from '../services/api';
import TestimonialCard from '../components/TestimonialCard';
import '../styles/Home.css';

const Home = () => {
  const [featuredTours, setFeaturedTours] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testimonialError, setTestimonialError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use Promise.allSettled to handle individual failures gracefully
      const [toursResult, testimonialsResult] = await Promise.allSettled([
        getFeaturedTours(),
        getTestimonials()
      ]);

      // Handle featured tours
      if (toursResult.status === 'fulfilled') {
        const tours = Array.isArray(toursResult.value) ? toursResult.value : [];
        setFeaturedTours(tours);
        console.log('Featured tours loaded:', tours.length);
      } else {
        console.error('Error loading featured tours:', toursResult.reason);
        setFeaturedTours([]);
      }

      // Handle testimonials with proper validation
      if (testimonialsResult.status === 'fulfilled') {
        const testimonialsData = testimonialsResult.value;
        
        // Validate testimonials data structure
        let validTestimonials = [];
        
        if (Array.isArray(testimonialsData)) {
          validTestimonials = testimonialsData;
        } else if (testimonialsData && typeof testimonialsData === 'object') {
          // Check if it's a paginated response
          if (testimonialsData.results && Array.isArray(testimonialsData.results)) {
            validTestimonials = testimonialsData.results;
          } else if (testimonialsData.testimonials && Array.isArray(testimonialsData.testimonials)) {
            validTestimonials = testimonialsData.testimonials;
          } else {
            console.warn('Testimonials data structure not recognized:', testimonialsData);
            validTestimonials = [];
          }
        } else {
          console.warn('Invalid testimonials data type:', typeof testimonialsData, testimonialsData);
          validTestimonials = [];
        }
        
        setTestimonials(validTestimonials);
        setTestimonialError(null);
        console.log('Testimonials loaded:', validTestimonials.length);
      } else {
        console.error('Error loading testimonials:', testimonialsResult.reason);
        setTestimonials([]);
        setTestimonialError('Failed to load testimonials');
      }

    } catch (error) {
      console.error('Error in fetchData:', error);
      setError('Failed to load page data. Please refresh the page.');
      setFeaturedTours([]);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="home">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading amazing tours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      {error && (
        <div className="error-banner">
          <div className="container">
            <span>⚠️ {error}</span>
            <button onClick={fetchData} className="retry-btn">Retry</button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Discover Kenya's Hidden Gems</h1>
          <p>Experience the beauty, culture, and adventure of Kenya with our expertly crafted tours</p>
          <Link to="/tours" className="cta-button">Explore Tours</Link>
        </div>
      </section>

      <div className="container">
        {/* Featured Tours Section */}
        <section className="featured-tours">
          <div className="section-header">
            <h2>Featured Tours</h2>
            <p>Handpicked experiences that showcase the best of Kenya</p>
          </div>
          
          {featuredTours.length > 0 ? (
            <div className="tours-grid">
              {featuredTours.slice(0, 6).map(tour => (
                <div key={tour.id} className="tour-card">
                  <div className="tour-image">
                    {tour.image ? (
                      <img 
                        src={tour.image} 
                        alt={tour.title}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/placeholder-tour.jpg';
                        }}
                      />
                    ) : (
                      <div className="image-placeholder">
                        <span>📸</span>
                      </div>
                    )}
                    <div className="tour-badge">
                      <span className="difficulty">{tour.difficulty}</span>
                      {tour.featured && <span className="featured">Featured</span>}
                    </div>
                  </div>
                  
                  <div className="tour-content">
                    <h3>{tour.title}</h3>
                    <p className="tour-destination">📍 {tour.destination}</p>
                    <p className="tour-description">
                      {tour.description ? 
                        (tour.description.length > 100 
                          ? tour.description.substring(0, 100) + '...' 
                          : tour.description
                        ) : 
                        'An amazing tour experience awaits you!'
                      }
                    </p>
                    
                    <div className="tour-details">
                      <div className="tour-meta">
                        <span className="duration">⏱️ {tour.duration} days</span>
                        <span className="price">${tour.price}</span>
                      </div>
                      
                      <div className="tour-actions">
                        <Link to={`/tours/${tour.id}`} className="btn-details">
                          View Details
                        </Link>
                        <Link to={`/book/${tour.id}`} className="btn-book">
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-tours">
              <div className="empty-state">
                <span className="empty-icon">🏔️</span>
                <h3>No featured tours available</h3>
                <p>We're working on bringing you amazing tour experiences. Check back soon!</p>
              </div>
            </div>
          )}
          
          {featuredTours.length > 0 && (
            <div className="section-footer">
              <Link to="/tours" className="view-all-link">
                View All Tours →
              </Link>
            </div>
          )}
        </section>

        {/* About Section */}
        <section className="about-preview">
          <div className="about-content">
            <div className="about-text">
              <h2>Why Choose Richman Tours?</h2>
              <p>
                With over a decade of experience in showcasing Kenya's natural beauty, 
                we create unforgettable journeys that connect you with the heart and soul of this magnificent country.
              </p>
              
              <div className="features">
                <div className="feature">
                  <span className="feature-icon">🌟</span>
                  <div>
                    <h4>Expert Guides</h4>
                    <p>Local expertise and passionate storytelling</p>
                  </div>
                </div>
                
                <div className="feature">
                  <span className="feature-icon">🛡️</span>
                  <div>
                    <h4>Safe & Secure</h4>
                    <p>Your safety is our top priority</p>
                  </div>
                </div>
                
                <div className="feature">
                  <span className="feature-icon">💎</span>
                  <div>
                    <h4>Unique Experiences</h4>
                    <p>Discover hidden gems off the beaten path</p>
                  </div>
                </div>
              </div>
              
              <Link to="/about" className="learn-more-btn">Learn More About Us</Link>
            </div>
            
            <div className="about-image">
              <img 
                src="/images/about-preview.jpg" 
                alt="Kenya landscape" 
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="testimonials">
          <div className="section-header">
            <h2>What Our Travelers Say</h2>
            <p>Real experiences from real adventurers</p>
          </div>
          
          {testimonialError && (
            <div className="testimonial-error">
              <p>Unable to load testimonials at the moment. Please try refreshing the page.</p>
            </div>
          )}
          
          {!testimonialError && testimonials.length > 0 ? (
            <div className="testimonials-grid">
              {testimonials.slice(0, 3).map(testimonial => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          ) : !testimonialError ? (
            <div className="no-testimonials">
              <div className="empty-state">
                <span className="empty-icon">💬</span>
                <h3>No testimonials yet</h3>
                <p>Be the first to share your amazing experience with us!</p>
              </div>
            </div>
          ) : null}
        </section>

        {/* Call to Action */}
        <section className="cta-section">
          <div className="cta-content">
            <h2>Ready for Your Next Adventure?</h2>
            <p>Join thousands of travelers who have discovered the magic of Kenya with us</p>
            <div className="cta-buttons">
              <Link to="/tours" className="cta-primary">
                Browse Tours
              </Link>
              <Link to="/contact" className="cta-secondary">
                Get in Touch
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
