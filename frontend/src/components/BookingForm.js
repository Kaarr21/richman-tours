// src/components/BookingForm.js
import React, { useState } from 'react';
import { submitBooking } from '../services/api';

const BookingForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    destination: '',
    preferred_date: '',
    number_of_people: 1,
    special_requirements: ''
  });
  
  const [status, setStatus] = useState({
    loading: false,
    message: '',
    type: '' // 'success' or 'error'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: '', type: '' });

    try {
      const response = await submitBooking(formData);
      setStatus({
        loading: false,
        message: `Booking submitted successfully! Your booking reference is: ${response.booking_reference}. You will receive a confirmation email shortly.`,
        type: 'success'
      });
      setFormData({ 
        name: '', 
        email: '', 
        phone: '', 
        destination: '', 
        preferred_date: '', 
        number_of_people: 1, 
        special_requirements: '' 
      });
    } catch (error) {
      setStatus({
        loading: false,
        message: 'Sorry, there was an error submitting your booking. Please try again.',
        type: 'error'
      });
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="name">Full Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="phone">Phone Number *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="destination">Destination *</label>
          <input
            type="text"
            id="destination"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            placeholder="Where would you like to go? (e.g., Paris, Bali, Tokyo)"
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="preferred_date">Preferred Date *</label>
          <input
            type="date"
            id="preferred_date"
            name="preferred_date"
            value={formData.preferred_date}
            onChange={handleChange}
            min={today}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="number_of_people">Number of People *</label>
          <input
            type="number"
            id="number_of_people"
            name="number_of_people"
            value={formData.number_of_people}
            onChange={handleChange}
            min="1"
            max="50"
            required
          />
        </div>
      </div>

      <div className="booking-summary">
        <h3>Booking Summary</h3>
        <div className="summary-item">
          <span>Destination:</span>
          <span>{formData.destination || 'Not specified'}</span>
        </div>
        <div className="summary-item">
          <span>Preferred Date:</span>
          <span>{formData.preferred_date ? new Date(formData.preferred_date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }) : 'Not specified'}</span>
        </div>
        <div className="summary-item">
          <span>Number of people:</span>
          <span>{formData.number_of_people} {formData.number_of_people === 1 ? 'person' : 'people'}</span>
        </div>
        <div className="summary-note">
          <p><em>Final pricing will be provided by Richard based on your destination and requirements.</em></p>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="special_requirements">Special Requirements or Requests</label>
        <textarea
          id="special_requirements"
          name="special_requirements"
          rows="4"
          value={formData.special_requirements}
          onChange={handleChange}
          placeholder="Please let us know about any dietary restrictions, accessibility needs, or special requests..."
        ></textarea>
      </div>

      {status.message && (
        <div className={`status-message ${status.type}`}>
          {status.message}
        </div>
      )}

      <button 
        type="submit" 
        className="submit-btn"
        disabled={status.loading}
      >
        {status.loading ? 'Submitting Booking...' : 'Submit Booking Request'}
      </button>

      <div className="booking-note">
        <p><strong>Note:</strong> This is a booking request. Richard will review your request and contact you within 24 hours to confirm your booking and provide additional details.</p>
      </div>
    </form>
  );
};

export default BookingForm;
