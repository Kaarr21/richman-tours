// src/pages/About.js - Fixed with reliable image sources
import React from 'react';
import '../styles/About.css';

const About = () => {
  // Fallback image component that creates a colored placeholder
  const PlaceholderImage = ({ width, height, text, className, alt }) => {
    return (
      <div 
        className={`placeholder-image ${className || ''}`}
        style={{
          width: width || '100%',
          height: height || '200px',
          backgroundColor: '#e9ecef',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6c757d',
          fontSize: '1rem',
          fontWeight: 'bold',
          textAlign: 'center',
          border: '2px dashed #dee2e6',
          borderRadius: '8px'
        }}
        role="img"
        aria-label={alt || text}
      >
        {text}
      </div>
    );
  };

  // Team member image component with fallback
  const TeamMemberImage = ({ name, role }) => {
    const getInitials = (fullName) => {
      return fullName.split(' ').map(n => n[0]).join('');
    };

    const getColorFromName = (name) => {
      const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
        '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
      ];
      const index = name.charCodeAt(0) % colors.length;
      return colors[index];
    };

    return (
      <div 
        className="team-member-avatar"
        style={{
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          backgroundColor: getColorFromName(name),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '3rem',
          fontWeight: 'bold',
          margin: '0 auto 1rem auto'
        }}
        role="img"
        aria-label={`${name} - ${role}`}
      >
        {getInitials(name)}
      </div>
    );
  };

  return (
    <div className="about">
      <div className="container">
        <div className="page-header">
          <h1>About Richman Tours & Travel</h1>
          <p>Your trusted partner in creating unforgettable travel experiences.</p>
        </div>

        <section className="about-content">
          <div className="about-text">
            <h2>Our Story</h2>
            <p>
              Founded in 2010, Richman Tours & Travel has been dedicated to creating extraordinary 
              travel experiences for adventurous souls around the world. What started as a small 
              local tour company has grown into a trusted name in the travel industry, known for 
              our commitment to quality, safety, and customer satisfaction.
            </p>
            <p>
              We believe that travel is more than just visiting new places – it's about creating 
              memories, discovering cultures, and pushing your boundaries. Our carefully curated 
              tours are designed to provide authentic experiences that connect you with the local 
              culture, nature, and people of each destination.
            </p>
          </div>
          
          <div className="about-image">
            <PlaceholderImage 
              width="500px"
              height="400px"
              text="Our Amazing Team"
              alt="Our team working together"
            />
          </div>
        </section>

        <section className="mission-vision">
          <div className="mission">
            <h2>Our Mission</h2>
            <p>
              To provide exceptional travel experiences that inspire, educate, and create 
              lasting memories while promoting sustainable tourism and supporting local communities.
            </p>
          </div>
          
          <div className="vision">
            <h2>Our Vision</h2>
            <p>
              To be the world's most trusted travel company, known for our innovative tours, 
              exceptional service, and commitment to responsible travel practices.
            </p>
          </div>
        </section>

        <section className="team">
          <h2>Meet Our Team</h2>
          <div className="team-grid">
            <div className="team-member">
              <TeamMemberImage name="Richard Karoki" role="Founder & CEO" />
              <h3>Richard Karoki</h3>
              <p>Founder & CEO</p>
              <p>With over 15 years in the travel industry, Richard leads our team with passion and expertise in creating unforgettable African adventures.</p>
            </div>
            
            <div className="team-member">
              <TeamMemberImage name="Sarah Wanjiku" role="Head of Operations" />
              <h3>Sarah Wanjiku</h3>
              <p>Head of Operations</p>
              <p>Sarah ensures all our tours run smoothly and exceed customer expectations with her attention to detail and operational excellence.</p>
            </div>
            
            <div className="team-member">
              <TeamMemberImage name="Michael Ochieng" role="Lead Tour Guide" />
              <h3>Michael Ochieng</h3>
              <p>Lead Tour Guide</p>
              <p>Michael's extensive knowledge of Kenyan culture and wildlife makes every tour an educational and unforgettable experience.</p>
            </div>
          </div>
        </section>

        <section className="values">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value">
              <h3>🌍 Sustainability</h3>
              <p>We're committed to responsible tourism that protects our planet and supports local ecosystems for future generations.</p>
            </div>
            
            <div className="value">
              <h3>🤝 Community</h3>
              <p>We support local communities and promote cultural exchange through our tours, ensuring tourism benefits everyone.</p>
            </div>
            
            <div className="value">
              <h3>⭐ Excellence</h3>
              <p>We strive for excellence in everything we do, from planning to execution, ensuring every detail exceeds expectations.</p>
            </div>
            
            <div className="value">
              <h3>🛡️ Safety</h3>
              <p>Your safety and well-being are our top priorities on every adventure, with comprehensive safety measures and protocols.</p>
            </div>
          </div>
        </section>

        <section className="contact-cta">
          <div className="cta-content">
            <h2>Ready to Start Your Adventure?</h2>
            <p>Get in touch with us today and let's plan your perfect Kenyan experience!</p>
            <div className="contact-info">
              <div className="contact-item">
                <span className="icon">📧</span>
                <a href="mailto:richardkaroki@gmail.com">richardkaroki@gmail.com</a>
              </div>
              <div className="contact-item">
                <span className="icon">📞</span>
                <a href="tel:+254720912561">+254 720 912 561</a>
              </div>
              <div className="contact-item">
                <span className="icon">📍</span>
                <span>Nairobi, Kenya</span>
              </div>
            </div>
            <a href="/contact" className="cta-button">Contact Us Today</a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
