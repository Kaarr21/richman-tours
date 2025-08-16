// Enhanced Admin.js with full CRUD gallery management
import React, { useState, useEffect } from 'react';
import { 
  getStats, 
  getGalleryImages, 
  getPendingBookings,
  getConfirmedBookings,
  confirmBooking,
  updateBooking,
  deleteBooking,
  createGalleryImage,
  updateGalleryImage,
  deleteGalleryImage
} from '../services/api';
import GalleryManagement from '../components/GalleryManagement';
import '../styles/Admin.css';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [gallery, setGallery] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [error, setError] = useState(null);

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
      setError(null);
      
      // Use Promise.allSettled to handle individual API failures gracefully
      const results = await Promise.allSettled([
        getStats(),
        getGalleryImages(),
        getPendingBookings(),
        getConfirmedBookings()
      ]);

      // Handle each result with proper fallbacks
      const [statsResult, galleryResult, pendingResult, confirmedResult] = results;

      // Set stats with fallback
      if (statsResult.status === 'fulfilled') {
        setStats(statsResult.value || {});
      } else {
        console.error('Error fetching stats:', statsResult.reason);
        setStats({});
      }

      // Set gallery with fallback to empty array
      if (galleryResult.status === 'fulfilled') {
        setGallery(Array.isArray(galleryResult.value) ? galleryResult.value : []);
      } else {
        console.error('Error fetching gallery:', galleryResult.reason);
        setGallery([]);
      }

      // Set pending bookings with fallback to empty array
      if (pendingResult.status === 'fulfilled') {
        setPendingBookings(Array.isArray(pendingResult.value) ? pendingResult.value : []);
      } else {
        console.error('Error fetching pending bookings:', pendingResult.reason);
        setPendingBookings([]);
      }

      // Set confirmed bookings with fallback to empty array
      if (confirmedResult.status === 'fulfilled') {
        setConfirmedBookings(Array.isArray(confirmedResult.value) ? confirmedResult.value : []);
      } else {
        console.error('Error fetching confirmed bookings:', confirmedResult.reason);
        setConfirmedBookings([]);
      }

      // Check if any critical errors occurred
      const failedCount = results.filter(result => result.status === 'rejected').length;
      if (failedCount > 0) {
        setError(`Warning: ${failedCount} API call(s) failed. Some data may not be available.`);
      }

    } catch (error) {
      console.error('Error in fetchData:', error);
      setError('Failed to load admin data. Please check your connection and try again.');
      // Ensure all arrays are initialized even on complete failure
      setStats({});
      setGallery([]);
      setPendingBookings([]);
      setConfirmedBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Gallery Management Functions
  const handleAddGalleryImage = async (imageData) => {
    try {
      setGalleryLoading(true);
      const newImage = await createGalleryImage(imageData);
      setGallery(prevGallery => [newImage, ...prevGallery]);
      return newImage;
    } catch (error) {
      console.error('Error adding gallery image:', error);
      throw error;
    } finally {
      setGalleryLoading(false);
    }
  };

  const handleUpdateGalleryImage = async (imageId, imageData) => {
    try {
      setGalleryLoading(true);
      const updatedImage = await updateGalleryImage(imageId, imageData);
      setGallery(prevGallery => 
        prevGallery.map(image => 
          image.id === imageId ? updatedImage : image
        )
      );
      return updatedImage;
    } catch (error) {
      console.error('Error updating gallery image:', error);
      throw error;
    } finally {
      setGalleryLoading(false);
    }
  };

  const handleDeleteGalleryImage = async (imageId, imageTitle) => {
    if (window.confirm(`Are you sure you want to delete the image "${imageTitle}"? This action cannot be undone.`)) {
      try {
        setGalleryLoading(true);
        await deleteGalleryImage(imageId);
        setGallery(prevGallery => prevGallery.filter(image => image.id !== imageId));
        alert('Gallery image deleted successfully!');
      } catch (error) {
        console.error('Error deleting gallery image:', error);
        alert(`Error deleting gallery image: ${error.message || 'Please try again.'}`);
      } finally {
        setGalleryLoading(false);
      }
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
    return (
      <div className="admin">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading admin panel...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin">
      <div className="container">
        <div className="page-header">
          <h1>Admin Panel</h1>
          <p>Manage bookings, gallery, and monitor your business.</p>
          {error && (
            <div className="error-banner">
              <span>⚠️ {error}</span>
              <button onClick={fetchData} className="retry-btn">Retry</button>
            </div>
          )}
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
                <div className="stat-card cancelled">
                  <h3>Cancelled Bookings</h3>
                  <p className="stat-number">{stats.cancelled_bookings || 0}</p>
                </div>
                <div className="stat-card revenue">
                  <h3>Total Revenue</h3>
                  <p className="stat-number">${stats.total_revenue || 0}</p>
                </div>
                <div className="stat-card monthly-revenue">
                  <h3>Monthly Revenue</h3>
                  <p className="stat-number">${stats.monthly_revenue || 0}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions">
                <h3>Quick Actions</h3>
                <div className="action-buttons">
                  <button 
                    className="action-btn pending" 
                    onClick={() => setActiveTab('bookings')}
                  >
                    View Pending Bookings ({pendingBookings.length})
                  </button>
                  <button 
                    className="action-btn schedule" 
                    onClick={() => setActiveTab('schedule')}
                  >
                    View Today's Schedule
                  </button>
                  <button 
                    className="action-btn gallery" 
                    onClick={() => setActiveTab('gallery')}
                  >
                    Manage Gallery ({gallery.length} images)
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="recent-activity">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  {pendingBookings.slice(0, 3).map(booking => (
                    <div key={booking.id} className="activity-item">
                      <span className="activity-icon">📅</span>
                      <div className="activity-details">
                        <p><strong>New booking from {booking.name}</strong></p>
                        <p>{booking.tour_title} - {formatDate(booking.preferred_date)}</p>
                        <small>{new Date(booking.created_at).toLocaleDateString()}</small>
                      </div>
                    </div>
                  ))}
                  {pendingBookings.length === 0 && (
                    <p className="no-activity">No recent booking activity</p>
                  )}
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
                  <div className="empty-state">
                    <span className="empty-icon">📅</span>
                    <h3>No pending booking requests</h3>
                    <p>All caught up! New bookings will appear here when customers make requests.</p>
                  </div>
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
                  <div className="empty-state">
                    <span className="empty-icon">🗓️</span>
                    <h3>No confirmed bookings scheduled</h3>
                    <p>Confirmed bookings will appear here with their scheduled dates and times.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'gallery' && (
            <GalleryManagement
              gallery={gallery}
              onDeleteImage={handleDeleteGalleryImage}
              onAddImage={handleAddGalleryImage}
              onUpdateImage={handleUpdateGalleryImage}
              loading={galleryLoading}
            />
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
