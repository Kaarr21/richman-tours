// Enhanced Admin.js with fixed CRUD operations for schedule management
import React, { useState, useEffect } from 'react';
import { 
  getTours, 
  getContacts, 
  getStats, 
  getGalleryImages, 
  getPendingBookings,
  getConfirmedBookings,
  confirmBooking,
  updateBooking,
  deleteBooking,
  deleteGalleryImage
} from '../services/api';
import '../styles/Admin.css';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [tours, setTours] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state for booking confirmation
  const [confirmationForm, setConfirmationForm] = useState({
    confirmed_date: '',
    confirmed_time: '',
    meeting_point: '',
    additional_notes: '',
    final_price: ''
  });

  // Form state for editing bookings
  const [editForm, setEditForm] = useState({
    confirmed_date: '',
    confirmed_time: '',
    meeting_point: '',
    additional_notes: '',
    final_price: '',
    status: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, toursData, contactsData, galleryData, pendingData, confirmedData] = await Promise.all([
        getStats(),
        getTours(),
        getContacts(),
        getGalleryImages(),
        getPendingBookings(),
        getConfirmedBookings()
      ]);
      
      setStats(statsData);
      setTours(toursData);
      setContacts(contactsData);
      setGallery(galleryData);
      setPendingBookings(pendingData);
      setConfirmedBookings(confirmedData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Booking Confirmation Functions
  const handleBookingSelect = (booking) => {
    setSelectedBooking(booking);
    setConfirmationForm({
      confirmed_date: booking.confirmed_date || booking.preferred_date,
      confirmed_time: booking.confirmed_time || '',
      meeting_point: booking.meeting_point || '',
      additional_notes: booking.additional_notes || '',
      final_price: booking.final_price || booking.total_amount
    });
  };

  const handleConfirmationSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;

    try {
      // Use the confirmBooking API function which calls the confirm endpoint
      const result = await confirmBooking(selectedBooking.id, confirmationForm);
      console.log('Booking confirmation result:', result);
      
      alert('Booking confirmed successfully! Confirmation email sent to customer.');
      setSelectedBooking(null);
      setConfirmationForm({
        confirmed_date: '',
        confirmed_time: '',
        meeting_point: '',
        additional_notes: '',
        final_price: ''
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error confirming booking:', error);
      alert(`Error confirming booking: ${error.message || 'Please try again.'}`);
    }
  };

  // Edit Functions
  const handleEditBooking = (booking) => {
    setEditingBooking(booking);
    setEditForm({
      confirmed_date: booking.confirmed_date || booking.preferred_date,
      confirmed_time: booking.confirmed_time || '',
      meeting_point: booking.meeting_point || '',
      additional_notes: booking.additional_notes || '',
      final_price: booking.final_price || booking.total_amount,
      status: booking.status
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingBooking) return;

    try {
      const result = await updateBooking(editingBooking.id, editForm);
      console.log('Booking update result:', result);
      
      alert('Booking updated successfully!');
      setEditingBooking(null);
      setEditForm({
        confirmed_date: '',
        confirmed_time: '',
        meeting_point: '',
        additional_notes: '',
        final_price: '',
        status: ''
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating booking:', error);
      alert(`Error updating booking: ${error.message || 'Please try again.'}`);
    }
  };

  // Delete Function
  const handleDeleteBooking = async (bookingId, bookingReference) => {
    if (window.confirm(`Are you sure you want to delete booking ${bookingReference}? This action cannot be undone.`)) {
      try {
        await deleteBooking(bookingId);
        alert('Booking deleted successfully!');
        fetchData(); // Refresh data
      } catch (error) {
        console.error('Error deleting booking:', error);
        alert(`Error deleting booking: ${error.message || 'Please try again.'}`);
      }
    }
  };

  // Status Update Function
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await updateBooking(bookingId, { status: newStatus });
      alert('Booking status updated successfully!');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert(`Error updating booking status: ${error.message || 'Please try again.'}`);
    }
  };

  // Gallery Delete Function
  const handleDeleteGalleryImage = async (imageId, imageTitle) => {
    if (window.confirm(`Are you sure you want to delete the image "${imageTitle}"? This action cannot be undone.`)) {
      try {
        await deleteGalleryImage(imageId);
        alert('Gallery image deleted successfully!');
        fetchData(); // Refresh data
      } catch (error) {
        console.error('Error deleting gallery image:', error);
        alert(`Error deleting gallery image: ${error.message || 'Please try again.'}`);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return <div className="loading">Loading admin panel...</div>;
  }

  return (
    <div className="admin">
      <div className="container">
        <div className="page-header">
          <h1>Admin Panel</h1>
          <p>Manage bookings, tours, and monitor your business.</p>
        </div>

        <div className="admin-tabs">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''} 
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={activeTab === 'bookings' ? 'active' : ''} 
            onClick={() => setActiveTab('bookings')}
          >
            📅 Bookings {pendingBookings.length > 0 && <span className="badge">{pendingBookings.length}</span>}
          </button>
          <button 
            className={activeTab === 'schedule' ? 'active' : ''} 
            onClick={() => setActiveTab('schedule')}
          >
            🗓️ Schedule
          </button>
          <button 
            className={activeTab === 'tours' ? 'active' : ''} 
            onClick={() => setActiveTab('tours')}
          >
            🎯 Tours
          </button>
          <button 
            className={activeTab === 'contacts' ? 'active' : ''} 
            onClick={() => setActiveTab('contacts')}
          >
            💬 Contacts
          </button>
          <button 
            className={activeTab === 'gallery' ? 'active' : ''} 
            onClick={() => setActiveTab('gallery')}
          >
            🖼️ Gallery
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'dashboard' && (
            <div className="dashboard">
              <h2>Dashboard Overview</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Bookings</h3>
                  <p className="stat-number">{stats.total_bookings || 0}</p>
                </div>
                <div className="stat-card pending">
                  <h3>Pending Bookings</h3>
                  <p className="stat-number">{stats.pending_bookings || 0}</p>
                </div>
                <div className="stat-card confirmed">
                  <h3>Confirmed Bookings</h3>
                  <p className="stat-number">{stats.confirmed_bookings || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Tours</h3>
                  <p className="stat-number">{stats.total_tours || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Featured Tours</h3>
                  <p className="stat-number">{stats.featured_tours || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Contacts</h3>
                  <p className="stat-number">{stats.total_contacts || 0}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bookings-management">
              <h2>Booking Requests</h2>
              
              {pendingBookings.length > 0 ? (
                <div className="bookings-list">
                  {pendingBookings.map(booking => (
                    <div key={booking.id} className={`booking-item ${booking.status}`}>
                      <div className="booking-header">
                        <h4>{booking.name} - {booking.tour_title}</h4>
                        <span className={`status-badge ${booking.status}`}>
                          {booking.status_display}
                        </span>
                      </div>
                      
                      <div className="booking-details">
                        <div className="detail-row">
                          <span><strong>Reference:</strong> {booking.booking_reference}</span>
                          <span><strong>Email:</strong> {booking.email}</span>
                          <span><strong>Phone:</strong> {booking.phone}</span>
                        </div>
                        <div className="detail-row">
                          <span><strong>Destination:</strong> {booking.tour_destination}</span>
                          <span><strong>Preferred Date:</strong> {formatDate(booking.preferred_date)}</span>
                          <span><strong>People:</strong> {booking.number_of_people}</span>
                          <span><strong>Total:</strong> ${booking.total_amount}</span>
                        </div>
                        {booking.special_requirements && (
                          <div className="special-requirements">
                            <strong>Special Requirements:</strong> {booking.special_requirements}
                          </div>
                        )}
                      </div>
                      
                      <div className="booking-actions">
                        <button 
                          className="btn-confirm" 
                          onClick={() => handleBookingSelect(booking)}
                        >
                          Confirm Booking
                        </button>
                        <button 
                          className="btn-edit" 
                          onClick={() => handleEditBooking(booking)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn-delete" 
                          onClick={() => handleDeleteBooking(booking.id, booking.booking_reference)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-bookings">
                  <p>No pending booking requests.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="schedule-management">
              <h2>Confirmed Bookings Schedule</h2>
              
              {confirmedBookings.length > 0 ? (
                <div className="schedule-list">
                  {confirmedBookings.map(booking => (
                    <div key={booking.id} className="schedule-item">
                      <div className="schedule-date">
                        <div className="date">
                          {formatDate(booking.confirmed_date || booking.preferred_date)}
                        </div>
                        {booking.confirmed_time && (
                          <div className="time">
                            {formatTime(booking.confirmed_time)}
                          </div>
                        )}
                      </div>
                      
                      <div className="schedule-details">
                        <h4>{booking.tour_title}</h4>
                        <p><strong>Customer:</strong> {booking.name} ({booking.email})</p>
                        <p><strong>Phone:</strong> {booking.phone}</p>
                        <p><strong>People:</strong> {booking.number_of_people} | <strong>Total:</strong> ${booking.total_amount}</p>
                        <p><strong>Reference:</strong> {booking.booking_reference}</p>
                        {booking.meeting_point && (
                          <p><strong>Meeting Point:</strong> {booking.meeting_point}</p>
                        )}
                        {booking.additional_notes && (
                          <p><strong>Notes:</strong> {booking.additional_notes}</p>
                        )}
                      </div>

                      <div className="schedule-actions">
                        <button 
                          className="btn-edit" 
                          onClick={() => handleEditBooking(booking)}
                        >
                          Edit
                        </button>
                        
                        <select 
                          value={booking.status} 
                          onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                          className="status-select"
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="pending">Pending</option>
                        </select>
                        
                        <button 
                          className="btn-delete" 
                          onClick={() => handleDeleteBooking(booking.id, booking.booking_reference)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-schedule">
                  <p>No confirmed bookings scheduled.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tours' && (
            <div className="tours-management">
              <h2>Tours Management</h2>
              <div className="tours-table">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Destination</th>
                      <th>Duration</th>
                      <th>Price</th>
                      <th>Featured</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tours.map(tour => (
                      <tr key={tour.id}>
                        <td>{tour.title}</td>
                        <td>{tour.destination}</td>
                        <td>{tour.duration}</td>
                        <td>${tour.price}</td>
                        <td>{tour.featured ? '⭐' : '-'}</td>
                        <td>
                          <button className="btn-edit">Edit</button>
                          <button className="btn-delete">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="contacts-management">
              <h2>Contact Messages</h2>
              <div className="contacts-list">
                {contacts.map(contact => (
                  <div key={contact.id} className="contact-item">
                    <div className="contact-header">
                      <h4>{contact.name}</h4>
                      <span className="contact-date">
                        {new Date(contact.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p><strong>Email:</strong> {contact.email}</p>
                    <p><strong>Subject:</strong> {contact.subject}</p>
                    <p><strong>Message:</strong> {contact.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="gallery-management">
              <h2>Gallery Management</h2>
              <div className="gallery-grid">
                {gallery.map(image => (
                  <div key={image.id} className="gallery-admin-item">
                    <img 
                      src={image.image || 'https://via.placeholder.com/200x150?text=Gallery+Image'} 
                      alt={image.title}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200x150?text=Gallery+Image';
                      }}
                    />
                    <div className="gallery-admin-info">
                      <h4>{image.title}</h4>
                      <p>{image.description}</p>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDeleteGalleryImage(image.id, image.title)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Booking Confirmation Modal */}
        {selectedBooking && (
          <div className="modal-overlay">
            <div className="booking-modal">
              <div className="modal-header">
                <h3>Confirm Booking - {selectedBooking.booking_reference}</h3>
                <button 
                  className="close-btn"
                  onClick={() => setSelectedBooking(null)}
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-content">
                <div className="booking-summary">
                  <h4>Booking Details</h4>
                  <p><strong>Customer:</strong> {selectedBooking.name}</p>
                  <p><strong>Tour:</strong> {selectedBooking.tour_title}</p>
                  <p><strong>Requested Date:</strong> {formatDate(selectedBooking.preferred_date)}</p>
                  <p><strong>People:</strong> {selectedBooking.number_of_people}</p>
                  <p><strong>Total Amount:</strong> ${selectedBooking.total_amount}</p>
                </div>

                <form onSubmit={handleConfirmationSubmit} className="confirmation-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Confirmed Date *</label>
                      <input
                        type="date"
                        value={confirmationForm.confirmed_date}
                        onChange={(e) => setConfirmationForm({
                          ...confirmationForm,
                          confirmed_date: e.target.value
                        })}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Confirmed Time</label>
                      <input
                        type="time"
                        value={confirmationForm.confirmed_time}
                        onChange={(e) => setConfirmationForm({
                          ...confirmationForm,
                          confirmed_time: e.target.value
                        })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Final Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={confirmationForm.final_price}
                      onChange={(e) => setConfirmationForm({
                        ...confirmationForm,
                        final_price: e.target.value
                      })}
                      placeholder="Enter final price"
                    />
                  </div>

                  <div className="form-group">
                    <label>Meeting Point</label>
                    <input
                      type="text"
                      value={confirmationForm.meeting_point}
                      onChange={(e) => setConfirmationForm({
                        ...confirmationForm,
                        meeting_point: e.target.value
                      })}
                      placeholder="e.g., Hotel lobby, Main entrance, etc."
                    />
                  </div>

                  <div className="form-group">
                    <label>Additional Notes</label>
                    <textarea
                      value={confirmationForm.additional_notes}
                      onChange={(e) => setConfirmationForm({
                        ...confirmationForm,
                        additional_notes: e.target.value
                      })}
                      placeholder="Any additional information for the customer..."
                      rows="3"
                    ></textarea>
                  </div>

                  <div className="modal-actions">
                    <button type="button" onClick={() => setSelectedBooking(null)} className="btn-cancel">
                      Cancel
                    </button>
                    <button type="submit" className="btn-confirm">
                      Confirm Booking & Send Email
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Booking Modal */}
        {editingBooking && (
          <div className="modal-overlay">
            <div className="booking-modal">
              <div className="modal-header">
                <h3>Edit Booking - {editingBooking.booking_reference}</h3>
                <button 
                  className="close-btn"
                  onClick={() => setEditingBooking(null)}
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-content">
                <div className="booking-summary">
                  <h4>Customer Information</h4>
                  <p><strong>Name:</strong> {editingBooking.name}</p>
                  <p><strong>Email:</strong> {editingBooking.email}</p>
                  <p><strong>Phone:</strong> {editingBooking.phone}</p>
                  <p><strong>Tour:</strong> {editingBooking.tour_title}</p>
                </div>

                <form onSubmit={handleEditSubmit} className="confirmation-form">
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        status: e.target.value
                      })}
                      required
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Date</label>
                      <input
                        type="date"
                        value={editForm.confirmed_date}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          confirmed_date: e.target.value
                        })}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Time</label>
                      <input
                        type="time"
                        value={editForm.confirmed_time}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          confirmed_time: e.target.value
                        })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Final Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.final_price}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        final_price: e.target.value
                      })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Meeting Point</label>
                    <input
                      type="text"
                      value={editForm.meeting_point}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        meeting_point: e.target.value
                      })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Additional Notes</label>
                    <textarea
                      value={editForm.additional_notes}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        additional_notes: e.target.value
                      })}
                      rows="3"
                    ></textarea>
                  </div>

                  <div className="modal-actions">
                    <button type="button" onClick={() => setEditingBooking(null)} className="btn-cancel">
                      Cancel
                    </button>
                    <button type="submit" className="btn-confirm">
                      Update Booking
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
