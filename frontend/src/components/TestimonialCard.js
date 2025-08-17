// frontend/src/components/TestimonialCard.js
import React from 'react';
import '../styles/TestimonialCard.css';

const TestimonialCard = ({ testimonial }) => {
  // Handle missing or invalid testimonial data
  if (!testimonial) {
    return null;
  }

  const {
    name = 'Anonymous',
    rating = 5,
    comment = 'Great experience!',
    tour = null,
    created_at = null
  } = testimonial;

  // Generate star rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star full">⭐</span>);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">⭐</span>);
    }
    
    // Add empty stars to make it 5 total
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
    }
    
    return stars;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short'
      });
    } catch (error) {
      return '';
    }
  };

  // Get user avatar with initials
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Generate consistent color based on name
  const getAvatarColor = (name) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#82E0AA', '#F8C471', '#D7BDE2', '#AED6F1'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="testimonial-card">
      <div className="testimonial-header">
        <div className="testimonial-avatar">
          <div 
            className="avatar-circle"
            style={{ backgroundColor: getAvatarColor(name) }}
          >
            {getInitials(name)}
          </div>
        </div>
        
        <div className="testimonial-info">
          <h4 className="testimonial-name">{name}</h4>
          <div className="testimonial-rating">
            {renderStars(rating)}
            <span className="rating-number">({rating}/5)</span>
          </div>
          {created_at && (
            <span className="testimonial-date">{formatDate(created_at)}</span>
          )}
        </div>
      </div>

      <div className="testimonial-content">
        <div className="quote-mark">"</div>
        <p className="testimonial-comment">{comment}</p>
        
        {tour && (
          <div className="testimonial-tour">
            <span className="tour-label">Tour:</span>
            <span className="tour-name">
              {typeof tour === 'string' ? tour : tour.title || tour.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestimonialCard;
