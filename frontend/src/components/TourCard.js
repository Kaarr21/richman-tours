// src/components/TourCard.js - Fixed with better image handling
import React, { useState } from 'react';

const TourCard = ({ tour }) => {
  const [imageError, setImageError] = useState(false);
  
  // Create a colored placeholder based on tour title
  const getPlaceholderColor = (title) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#82E0AA', '#F8C471', '#D7BDE2', '#AED6F1'
    ];
    const index = title ? title.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  const PlaceholderImage = ({ title, destination }) => (
    <div 
      className="tour-image-placeholder"
      style={{
        width: '100%',
        height: '250px',
        backgroundColor: getPlaceholderColor(title),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '1rem',
        fontWeight: 'bold',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📸</div>
      <div style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{title}</div>
      <div style={{ fontSize: '0.9rem', opacity: '0.8' }}>📍 {destination}</div>
      
      {/* Decorative elements */}
      <div 
        style={{
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '100%',
          height: '100%',
          background: 'rgba(255, 255, 255, 0.1)',
          transform: 'rotate(45deg)',
          borderRadius: '50%'
        }}
      />
    </div>
  );

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="tour-card">
      <div className="tour-image">
        {!imageError && tour.image ? (
          <>
            <img 
              src={tour.image}
              alt={tour.title}
              onError={handleImageError}
              loading="lazy"
            />
            {tour.featured && <span className="featured-badge">Featured</span>}
          </>
        ) : (
          <>
            <PlaceholderImage title={tour.title} destination={tour.destination} />
            {tour.featured && <span className="featured-badge">Featured</span>}
          </>
        )}
      </div>
      
      <div className="tour-info">
        <h3>{tour.title}</h3>
        <p className="tour-destination">📍 {tour.destination}</p>
        <p className="tour-description">
          {tour.short_description || tour.description || 'An amazing tour experience awaits you!'}
        </p>
        
        <div className="tour-details">
          {tour.duration && <span className="duration">⏱️ {tour.duration}</span>}
          {tour.difficulty && <span className="difficulty">🎯 {tour.difficulty}</span>}
          {tour.max_people && <span className="max-people">👥 Max {tour.max_people}</span>}
        </div>
        
        <div className="tour-footer">
          <span className="price">
            {tour.price ? `$${tour.price}` : 'Contact for Price'}
          </span>
          <button 
            className="book-btn"
            onClick={() => {
              // Navigate to contact page or booking form
              window.location.href = '/contact';
            }}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default TourCard;
