
// src/pages/About.js
import React from 'react';
import '../styles/About.css';

const About = () => {
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
            <img 
              src="https://via.placeholder.com/500x400?text=Our+Team" 
              alt="Our Team"
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
              <img 
                src="https://via.placeholder.com/200x200?text=John+Doe" 
                alt="John Doe"
              />
              <h3>John Doe</h3>
              <p>Founder & CEO</p>
              <p>With over 15 years in the travel industry, John leads our team with passion and expertise.</p>
            </div>
            
            <div className="team-member">
              <img 
                src="https://via.placeholder.com/200x200?text=Jane+Smith" 
                alt="Jane Smith"
              />
              <h3>Jane Smith</h3>
              <p>Head of Operations</p>
              <p>Jane ensures all our tours run smoothly and exceed customer expectations.</p>
            </div>
            
            <div className="team-member">
              <img 
                src="https://via.placeholder.com/200x200?text=Mike+Johnson" 
                alt="Mike Johnson"
              />
              <h3>Mike Johnson</h3>
              <p>Lead Tour Guide</p>
              <p>Mike's extensive knowledge and enthusiasm make every tour an unforgettable experience.</p>
            </div>
          </div>
        </section>

        <section className="values">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value">
              <h3>🌍 Sustainability</h3>
              <p>We're committed to responsible tourism that protects our planet for future generations.</p>
            </div>
            
            <div className="value">
              <h3>🤝 Community</h3>
              <p>We support local communities and promote cultural exchange through our tours.</p>
            </div>
            
            <div className="value">
              <h3>⭐ Excellence</h3>
              <p>We strive for excellence in everything we do, from planning to execution.</p>
            </div>
            
            <div className="value">
              <h3>🛡️ Safety</h3>
              <p>Your safety and well-being are our top priorities on every adventure.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;

