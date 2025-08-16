// src/services/api.js - Enhanced with full CRUD operations
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error handling helper
const handleApiError = (error, operation) => {
  console.error(`Error ${operation}:`, error);
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('Response data:', error.response.data);
    console.error('Response status:', error.response.status);
    throw new Error(error.response.data.detail || error.response.data.message || `Failed to ${operation}`);
  } else if (error.request) {
    // The request was made but no response was received
    throw new Error(`Network error while ${operation}`);
  } else {
    // Something happened in setting up the request that triggered an Error
    throw new Error(`Error setting up request for ${operation}`);
  }
};

// Tours API
export const getTours = async () => {
  try {
    const response = await api.get('/tours/');
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching tours');
  }
};

export const getFeaturedTours = async () => {
  try {
    const response = await api.get('/tours/featured/');
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching featured tours');
  }
};

export const getTour = async (id) => {
  try {
    const response = await api.get(`/tours/${id}/`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching tour');
  }
};

export const createTour = async (tourData) => {
  try {
    const response = await api.post('/tours/', tourData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'creating tour');
  }
};

export const updateTour = async (id, tourData) => {
  try {
    const response = await api.patch(`/tours/${id}/`, tourData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'updating tour');
  }
};

export const deleteTour = async (id) => {
  try {
    await api.delete(`/tours/${id}/`);
    return true;
  } catch (error) {
    handleApiError(error, 'deleting tour');
  }
};

// Booking API - Enhanced with full CRUD
export const getBookings = async () => {
  try {
    const response = await api.get('/bookings/');
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching bookings');
  }
};

export const getBooking = async (id) => {
  try {
    const response = await api.get(`/bookings/${id}/`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching booking');
  }
};

export const submitBooking = async (bookingData) => {
  try {
    const response = await api.post('/bookings/', bookingData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'submitting booking');
  }
};

export const updateBooking = async (bookingId, updateData) => {
  try {
    const response = await api.patch(`/bookings/${bookingId}/`, updateData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'updating booking');
  }
};

export const deleteBooking = async (bookingId) => {
  try {
    await api.delete(`/bookings/${bookingId}/`);
    return true;
  } catch (error) {
    handleApiError(error, 'deleting booking');
  }
};

export const getPendingBookings = async () => {
  try {
    const response = await api.get('/bookings/pending/');
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching pending bookings');
  }
};

export const getConfirmedBookings = async () => {
  try {
    const response = await api.get('/bookings/confirmed/');
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching confirmed bookings');
  }
};

export const confirmBooking = async (bookingId, confirmationData) => {
  try {
    const response = await api.patch(`/bookings/${bookingId}/confirm/`, confirmationData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'confirming booking');
  }
};

// Bulk operations for bookings
export const bulkUpdateBookings = async (bookingIds, updateData) => {
  try {
    const response = await api.post('/bookings/bulk_update/', {
      booking_ids: bookingIds,
      update_data: updateData
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'bulk updating bookings');
  }
};

export const bulkDeleteBookings = async (bookingIds) => {
  try {
    const response = await api.post('/bookings/bulk_delete/', {
      booking_ids: bookingIds
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'bulk deleting bookings');
  }
};

// Gallery API - Enhanced with full CRUD
export const getGalleryImages = async () => {
  try {
    const response = await api.get('/gallery/');
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching gallery images');
  }
};

export const getGalleryImage = async (id) => {
  try {
    const response = await api.get(`/gallery/${id}/`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching gallery image');
  }
};

export const createGalleryImage = async (imageData) => {
  try {
    const response = await api.post('/gallery/', imageData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'creating gallery image');
  }
};

export const updateGalleryImage = async (id, imageData) => {
  try {
    const response = await api.patch(`/gallery/${id}/`, imageData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'updating gallery image');
  }
};

export const deleteGalleryImage = async (id) => {
  try {
    await api.delete(`/gallery/${id}/`);
    return true;
  } catch (error) {
    handleApiError(error, 'deleting gallery image');
  }
};

// Contact API - Enhanced with full CRUD
export const getContacts = async () => {
  try {
    const response = await api.get('/contacts/');
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching contacts');
  }
};

export const getContact = async (id) => {
  try {
    const response = await api.get(`/contacts/${id}/`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching contact');
  }
};

export const submitContact = async (contactData) => {
  try {
    const response = await api.post('/contacts/', contactData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'submitting contact');
  }
};

export const updateContact = async (id, contactData) => {
  try {
    const response = await api.patch(`/contacts/${id}/`, contactData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'updating contact');
  }
};

export const deleteContact = async (id) => {
  try {
    await api.delete(`/contacts/${id}/`);
    return true;
  } catch (error) {
    handleApiError(error, 'deleting contact');
  }
};

export const markContactAsRead = async (id) => {
  try {
    const response = await api.patch(`/contacts/${id}/`, { read: true });
    return response.data;
  } catch (error) {
    handleApiError(error, 'marking contact as read');
  }
};

// Testimonials API - Enhanced with full CRUD
export const getTestimonials = async () => {
  try {
    const response = await api.get('/testimonials/');
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching testimonials');
  }
};

export const getTestimonial = async (id) => {
  try {
    const response = await api.get(`/testimonials/${id}/`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching testimonial');
  }
};

export const createTestimonial = async (testimonialData) => {
  try {
    const response = await api.post('/testimonials/', testimonialData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'creating testimonial');
  }
};

export const updateTestimonial = async (id, testimonialData) => {
  try {
    const response = await api.patch(`/testimonials/${id}/`, testimonialData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'updating testimonial');
  }
};

export const deleteTestimonial = async (id) => {
  try {
    await api.delete(`/testimonials/${id}/`);
    return true;
  } catch (error) {
    handleApiError(error, 'deleting testimonial');
  }
};

// Stats API
export const getStats = async () => {
  try {
    const response = await api.get('/stats/');
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching stats');
  }
};

// Advanced filtering and search functions
export const searchBookings = async (searchParams) => {
  try {
    const params = new URLSearchParams(searchParams);
    const response = await api.get(`/bookings/?${params}`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'searching bookings');
  }
};

export const getBookingsByDateRange = async (startDate, endDate) => {
  try {
    const response = await api.get(`/bookings/?start_date=${startDate}&end_date=${endDate}`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching bookings by date range');
  }
};

export const getBookingsByStatus = async (status) => {
  try {
    const response = await api.get(`/bookings/?status=${status}`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching bookings by status');
  }
};

// Dashboard analytics
export const getDashboardAnalytics = async (period = '30d') => {
  try {
    const response = await api.get(`/analytics/dashboard/?period=${period}`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching dashboard analytics');
  }
};

export const getRevenueAnalytics = async (period = '30d') => {
  try {
    const response = await api.get(`/analytics/revenue/?period=${period}`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching revenue analytics');
  }
};

// Export functions
export const exportBookings = async (format = 'csv', filters = {}) => {
  try {
    const params = new URLSearchParams({ format, ...filters });
    const response = await api.get(`/bookings/export/?${params}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'exporting bookings');
  }
};

// Notification functions
export const sendCustomEmail = async (emailData) => {
  try {
    const response = await api.post('/notifications/send-email/', emailData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'sending custom email');
  }
};

export const resendBookingConfirmation = async (bookingId) => {
  try {
    const response = await api.post(`/bookings/${bookingId}/resend-confirmation/`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'resending booking confirmation');
  }
};

export default api;
