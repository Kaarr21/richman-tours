
// frontend/src/services/api.js - Updated to use the auth API instance
import { api } from './authApi';

// Error handling helper
const handleApiError = (error, operation) => {
  console.error(`Error ${operation}:`, error);
  if (error.response) {
    console.error('Response data:', error.response.data);
    console.error('Response status:', error.response.status);
    throw new Error(error.response.data.detail || error.response.data.message || `Failed to ${operation}`);
  } else if (error.request) {
    throw new Error(`Network error while ${operation}`);
  } else {
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
    // For booking submission, we don't need auth (public endpoint)
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

// Gallery API - Enhanced with full CRUD
export const getGalleryImages = async () => {
  try {
    const response = await api.get('/gallery/');
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching gallery images');
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

export const submitContact = async (contactData) => {
  try {
    // For contact submission, we don't need auth (public endpoint)
    const response = await api.post('/contacts/', contactData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'submitting contact');
  }
};

// Testimonials API
export const getTestimonials = async () => {
  try {
    const response = await api.get('/testimonials/');
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching testimonials');
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

export default api;