// src/pages/Contact.js
import React, { useState } from 'react';
import ContactForm from '../components/ContactForm';
import BookingForm from '../components/BookingForm';
import '../styles/Contact.css';

const Contact = () => {
  const [activeTab, setActiveTab] = useState('booking');

  return (
    <div className="contact">
      <div className="container">
        <div className="page-header">
          <h1>Book Your Adventure</h1>
          <p>Ready to explore? Book your tour or get in touch with us for any questions!</p>
        </div>

        <div className="contact-tabs">
          <button 
            className={activeTab === 'booking' ? 'active' : ''} 
            onClick={() => setActiveTab('booking')}
          >
            📅 Book a Tour
          </button>
          <button 
            className={activeTab === 'contact' ? 'active' : ''} 
            onClick={() => setActiveTab('contact')}
          >
            💬 Contact Us
          </button>
        </div>

        <div className="contact-content">
          <div className="contact-info">
            <h2>Get In Touch</h2>
            <div className="contact-item">
              <div className="contact-icon">📧</div>
              <div>
                <h3>Email</h3>
                <p>info@richmantours.com</p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">📞</div>
              <div>
                <h3>Phone</h3>
                <p>+1 (555) 123-4567</p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">📍</div>
              <div>
                <h3>Address</h3>
                <p>123 Travel Street<br />Adventure City, AC 12345</p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">⏰</div>
              <div>
                <h3>Business Hours</h3>
                <p>Mon - Fri: 9:00 AM - 6:00 PM<br />Sat: 10:00 AM - 4:00 PM<br />Sun: Closed</p>
              </div>
            </div>

            <div className="contact-item highlight">
              <div className="contact-icon">🎯</div>
              <div>
                <h3>Why Book With Us?</h3>
                <ul>
                  <li>Expert local guides</li>
                  <li>Small group experiences</li>
                  <li>Flexible booking options</li>
                  <li>24/7 customer support</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="form-container">
            {activeTab === 'booking' ? (
              <div className="booking-form-container">
                <h2>🎪 Book Your Adventure</h2>
                <p>Select your preferred tour and let's start planning your perfect adventure!</p>
                <BookingForm />
              </div>
            ) : (
              <div className="contact-form-container">
                <h2>💬 Send Us a Message</h2>
                <p>Have questions? We'd love to hear from you!</p>
                <ContactForm />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
