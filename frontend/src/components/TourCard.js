
// src/components/TourCard.js
import React from 'react';

const TourCard = ({ tour }) => {
  const defaultImage = 'https://via.placeholder.com/300x200?text=Tour+Image';
  
  return (
    <div className="tour-card">
      <div className="tour-image">
        <img 
          src={tour.image || defaultImage} 
          alt={tour.title}
          onError={(e) => {
            e.target.src = defaultImage;
          }}
        />
        {tour.featured && <span className="featured-badge">Featured</span>}
      </div>
      
      <div className="tour-info">
        <h3>{tour.title}</h3>
        <p className="tour-destination">📍 {tour.destination}</p>
        <p className="tour-description">{tour.short_description}</p>
        
        <div className="tour-details">
          <span className="duration">⏱️ {tour.duration}</span>
          <span className="difficulty">🎯 {tour.difficulty}</span>
          <span className="max-people">👥 Max {tour.max_people}</span>
        </div>
        
        <div className="tour-footer">
          <span className="price">${tour.price}</span>
          <button className="book-btn">Book Now</button>
        </div>
      </div>
    </div>
  );
};

export default TourCard;
