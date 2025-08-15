// src/components/BookingForm.js
import React, { useState, useEffect } from 'react';
import { submitBooking, getTours } from '../services/api';

const BookingForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    tour: '',
    preferred_date: '',
    number_of_people: 1,
    special_requirements: ''
  });
  
  const [tours, setTours] = useState([]);
  const [selectedTour, setSelectedTour] = useState(null);
  
  const [status, setStatus] = useState({
    loading: false,
    message: '',
    type: '' // 'success' or 'error'
  });

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const toursData = await getTours();
        setTours(toursData);
      } catch (error) {
        console.error('Error fetching tours:', error);
      }
    };

    fetchTours();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Update selected tour when tour selection changes
    if (name === 'tour' && value) {
      const tour = tours.find(t => t.id.toString() === value);
      setSelectedTour(tour);
    }
  };

  const calculateTotalAmount = () => {
    if (selectedTour && formData.number_of_people) {
      return (selectedTour.price * formData.number_of_people).toFixed(2);
    }
    return '0.00';
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
        tour: '', 
        preferred_date: '', 
        number_of_people: 1, 
        special_requirements: '' 
      });
      setSelectedTour(null);
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
          <label htmlFor="tour">Select Tour *</label>
          <select
            id="tour"
            name="tour"
            value={formData.tour}
            onChange={handleChange}
            required
          >
            <option value="">Choose a tour...</option>
            {tours.map(tour => (
              <option key={tour.id} value={tour.id}>
                {tour.title} - {tour.destination} (${tour.price}/person)
              </option>
            ))}
          </select>
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
          <select
            id="number_of_people"
            name="number_of_people"
            value={formData.number_of_people}
            onChange={handleChange}
            required
          >
            {[...Array(20)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} {i === 0 ? 'Person' : 'People'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedTour && (
        <div className="booking-summary">
          <h3>Booking Summary</h3>
          <div className="summary-item">
            <span>Tour:</span>
            <span>{selectedTour.title}</span>
          </div>
          <div className="summary-item">
            <span>Destination:</span>
            <span>{selectedTour.destination}</span>
          </div>
          <div className="summary-item">
            <span>Duration:</span>
            <span>{selectedTour.duration}</span>
          </div>
          <div className="summary-item">
            <span>Price per person:</span>
            <span>${selectedTour.price}</span>
          </div>
          <div className="summary-item">
            <span>Number of people:</span>
            <span>{formData.number_of_people}</span>
          </div>
          <div className="summary-item total">
            <span>Total Amount:</span>
            <span>${calculateTotalAmount()}</span>
          </div>
        </div>
      )}

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
