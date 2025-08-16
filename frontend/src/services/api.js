// frontend/src/services/api.js - Updated with complete Gallery CRUD
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

// Gallery API - Enhanced with full CRUD operations
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

// Bulk gallery operations
export const bulkDeleteGalleryImages = async (imageIds) => {
  try {
    const response = await api.post('/gallery/bulk_delete/', {
      image_ids: imageIds
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'bulk deleting gallery images');
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

// Advanced Analytics API
export const getAnalyticsDashboard = async (period = '30d') => {
  try {
    const response = await api.get(`/analytics/dashboard/?period=${period}`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching analytics dashboard');
  }
};

// Email API
export const sendCustomEmail = async (emailData) => {
  try {
    const response = await api.post('/notifications/send-email/', emailData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'sending custom email');
  }
};

export const sendBulkEmail = async (emailData) => {
  try {
    const response = await api.post('/send-bulk-email/', emailData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'sending bulk email');
  }
};

// Export and Reporting API
export const exportBookings = async (format = 'csv') => {
  try {
    const response = await api.get(`/bookings/export/?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'exporting bookings');
  }
};

export const getRevenueReport = async (period = 'month') => {
  try {
    const response = await api.get(`/revenue-report/?period=${period}`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching revenue report');
  }
};

// Calendar API
export const getBookingCalendar = async (startDate, endDate) => {
  try {
    let url = '/booking-calendar/';
    const params = new URLSearchParams();
    
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    if (params.toString()) {
      url += '?' + params.toString();
    }
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching booking calendar');
  }
};

// Dashboard Summary API
export const getDashboardSummary = async () => {
  try {
    const response = await api.get('/dashboard-summary/');
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching dashboard summary');
  }
};

// Health Check API
export const getHealthCheck = async () => {
  try {
    const response = await api.get('/health-check/');
    return response.data;
  } catch (error) {
    handleApiError(error, 'health check');
  }
};

// File Upload Helper
export const uploadFile = async (file, type = 'image') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const response = await api.post('/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'uploading file');
  }
};

export default api;
