// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import TourCard from '../components/TourCard';
import { getFeaturedTours, getTestimonials } from '../services/api';
import '../styles/Home.css';

const Home = () => {
  const [featuredTours, setFeaturedTours] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [toursData, testimonialsData] = await Promise.all([
          getFeaturedTours(),
          getTestimonials()
        ]);
        setFeaturedTours(toursData.slice(0, 3)); // Show only 3 featured tours
        setTestimonials(testimonialsData.slice(0, 3)); // Show only 3 testimonials
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home">
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
              <p>No featured tours available.</p>
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
                    {'⭐'.repeat(testimonial.rating)}
                  </div>
                  <p>"{testimonial.comment}"</p>
                  <div className="testimonial-author">
                    <strong>{testimonial.name}</strong>
                  </div>
                </div>
              ))
            ) : (
              <p>No testimonials available.</p>
            )}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready for Your Next Adventure?</h2>
          <p>Contact us today to start planning your dream vacation.</p>
          <button className="cta-btn">Get Started</button>
        </div>
      </section>
    </div>
  );
};

export default Home;
