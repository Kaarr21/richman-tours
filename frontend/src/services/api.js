// frontend/src/services/api.js - Updated with proper authentication handling
import { apiCall, publicApiCall } from './authApi';

// Error handling helper
const handleApiError = (error, operation) => {
  console.error(`Error ${operation}:`, error);
  throw error; // Re-throw the processed error from apiCall
};

// Tours API (Public endpoints)
export const getTours = async (params = {}) => {
  try {
    return await publicApiCall({
      method: 'get',
      url: '/tours/',
      params
    });
  } catch (error) {
    handleApiError(error, 'fetching tours');
  }
};

export const getFeaturedTours = async () => {
  try {
    return await publicApiCall({
      method: 'get',
      url: '/tours/featured/'
    });
  } catch (error) {
    handleApiError(error, 'fetching featured tours');
  }
};

export const getTour = async (id) => {
  try {
    return await publicApiCall({
      method: 'get',
      url: `/tours/${id}/`
    });
  } catch (error) {
    handleApiError(error, 'fetching tour');
  }
};

// Admin-only tour operations
export const createTour = async (tourData) => {
  try {
    return await apiCall({
      method: 'post',
      url: '/tours/',
      data: tourData
    });
  } catch (error) {
    handleApiError(error, 'creating tour');
  }
};

export const updateTour = async (id, tourData) => {
  try {
    return await apiCall({
      method: 'patch',
      url: `/tours/${id}/`,
      data: tourData
    });
  } catch (error) {
    handleApiError(error, 'updating tour');
  }
};

export const deleteTour = async (id) => {
  try {
    await apiCall({
      method: 'delete',
      url: `/tours/${id}/`
    });
    return true;
  } catch (error) {
    handleApiError(error, 'deleting tour');
  }
};

// Booking API
export const submitBooking = async (bookingData) => {
  try {
    // Public endpoint - no auth required
    return await publicApiCall({
      method: 'post',
      url: '/bookings/',
      data: bookingData
    });
  } catch (error) {
    handleApiError(error, 'submitting booking');
  }
};

// Admin booking operations
export const getBookings = async (params = {}) => {
  try {
    return await apiCall({
      method: 'get',
      url: '/bookings/',
      params
    });
  } catch (error) {
    handleApiError(error, 'fetching bookings');
  }
};

export const getBooking = async (id) => {
  try {
    return await apiCall({
      method: 'get',
      url: `/bookings/${id}/`
    });
  } catch (error) {
    handleApiError(error, 'fetching booking');
  }
};

export const updateBooking = async (bookingId, updateData) => {
  try {
    return await apiCall({
      method: 'patch',
      url: `/bookings/${bookingId}/`,
      data: updateData
    });
  } catch (error) {
    handleApiError(error, 'updating booking');
  }
};

export const deleteBooking = async (bookingId) => {
  try {
    await apiCall({
      method: 'delete',
      url: `/bookings/${bookingId}/`
    });
    return true;
  } catch (error) {
    handleApiError(error, 'deleting booking');
  }
};

export const getPendingBookings = async () => {
  try {
    return await apiCall({
      method: 'get',
      url: '/bookings/pending/'
    });
  } catch (error) {
    handleApiError(error, 'fetching pending bookings');
  }
};

export const getConfirmedBookings = async () => {
  try {
    return await apiCall({
      method: 'get',
      url: '/bookings/confirmed/'
    });
  } catch (error) {
    handleApiError(error, 'fetching confirmed bookings');
  }
};

export const confirmBooking = async (bookingId, confirmationData) => {
  try {
    return await apiCall({
      method: 'patch',
      url: `/bookings/${bookingId}/confirm/`,
      data: confirmationData
    });
  } catch (error) {
    handleApiError(error, 'confirming booking');
  }
};

// Gallery API
export const getGalleryImages = async (params = {}) => {
  try {
    // Public endpoint
    return await publicApiCall({
      method: 'get',
      url: '/gallery/',
      params
    });
  } catch (error) {
    handleApiError(error, 'fetching gallery images');
  }
};

export const getGalleryImage = async (id) => {
  try {
    return await publicApiCall({
      method: 'get',
      url: `/gallery/${id}/`
    });
  } catch (error) {
    handleApiError(error, 'fetching gallery image');
  }
};

// Admin gallery operations
export const createGalleryImage = async (imageData) => {
  try {
    return await apiCall({
      method: 'post',
      url: '/gallery/',
      data: imageData,
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  } catch (error) {
    handleApiError(error, 'creating gallery image');
  }
};

export const updateGalleryImage = async (id, imageData) => {
  try {
    return await apiCall({
      method: 'patch',
      url: `/gallery/${id}/`,
      data: imageData,
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  } catch (error) {
    handleApiError(error, 'updating gallery image');
  }
};

export const deleteGalleryImage = async (id) => {
  try {
    await apiCall({
      method: 'delete',
      url: `/gallery/${id}/`
    });
    return true;
  } catch (error) {
    handleApiError(error, 'deleting gallery image');
  }
};

// Contact API
export const submitContact = async (contactData) => {
  try {
    // Public endpoint
    return await publicApiCall({
      method: 'post',
      url: '/contacts/',
      data: contactData
    });
  } catch (error) {
    handleApiError(error, 'submitting contact');
  }
};

export const getContacts = async (params = {}) => {
  try {
    return await apiCall({
      method: 'get',
      url: '/contacts/',
      params
    });
  } catch (error) {
    handleApiError(error, 'fetching contacts');
  }
};

// Testimonials API
export const getTestimonials = async (params = {}) => {
  try {
    // Public endpoint
    return await publicApiCall({
      method: 'get',
      url: '/testimonials/',
      params
    });
  } catch (error) {
    handleApiError(error, 'fetching testimonials');
  }
};

export const createTestimonial = async (testimonialData) => {
  try {
    return await apiCall({
      method: 'post',
      url: '/testimonials/',
      data: testimonialData
    });
  } catch (error) {
    handleApiError(error, 'creating testimonial');
  }
};

// Admin Statistics and Analytics (Admin only)
export const getStats = async () => {
  try {
    return await apiCall({
      method: 'get',
      url: '/stats/'
    });
  } catch (error) {
    handleApiError(error, 'fetching stats');
  }
};

export const getAnalyticsDashboard = async (period = '30d') => {
  try {
    return await apiCall({
      method: 'get',
      url: '/analytics/dashboard/',
      params: { period }
    });
  } catch (error) {
    handleApiError(error, 'fetching analytics dashboard');
  }
};

export const getDashboardSummary = async () => {
  try {
    return await apiCall({
      method: 'get',
      url: '/dashboard/summary/'
    });
  } catch (error) {
    handleApiError(error, 'fetching dashboard summary');
  }
};

// Email API (Admin only)
export const sendCustomEmail = async (emailData) => {
  try {
    return await apiCall({
      method: 'post',
      url: '/notifications/send-email/',
      data: emailData
    });
  } catch (error) {
    handleApiError(error, 'sending custom email');
  }
};

export const sendBulkEmail = async (emailData) => {
  try {
    return await apiCall({
      method: 'post',
      url: '/notifications/bulk-email/',
      data: emailData
    });
  } catch (error) {
    handleApiError(error, 'sending bulk email');
  }
};

// Export and Reporting (Admin only)
export const exportBookings = async (format = 'csv') => {
  try {
    return await apiCall({
      method: 'get',
      url: '/bookings/export/',
      params: { format },
      responseType: 'blob'
    });
  } catch (error) {
    handleApiError(error, 'exporting bookings');
  }
};

export const getRevenueReport = async (period = 'month') => {
  try {
    return await apiCall({
      method: 'get',
      url: '/reports/revenue/',
      params: { period }
    });
  } catch (error) {
    handleApiError(error, 'fetching revenue report');
  }
};

// Calendar API (Admin only)
export const getBookingCalendar = async (startDate, endDate) => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    return await apiCall({
      method: 'get',
      url: '/bookings/calendar/',
      params
    });
  } catch (error) {
    handleApiError(error, 'fetching booking calendar');
  }
};

// Health Check (Public)
export const getHealthCheck = async () => {
  try {
    return await publicApiCall({
      method: 'get',
      url: '/health/'
    });
  } catch (error) {
    handleApiError(error, 'health check');
  }
};

// Bulk operations (Admin only)
export const bulkActionBookings = async (action, bookingIds, updateData = {}) => {
  try {
    return await apiCall({
      method: 'post',
      url: '/bookings/bulk-action/',
      data: {
        action,
        booking_ids: bookingIds,
        update_data: updateData
      }
    });
  } catch (error) {
    handleApiError(error, 'performing bulk booking action');
  }
};

export const bulkUpdateTours = async (tourIds, updateData) => {
  try {
    return await apiCall({
      method: 'post',
      url: '/tours/bulk_update/',
      data: {
        tour_ids: tourIds,
        update_data: updateData
      }
    });
  } catch (error) {
    handleApiError(error, 'bulk updating tours');
  }
};

export const bulkDeleteTours = async (tourIds) => {
  try {
    return await apiCall({
      method: 'post',
      url: '/tours/bulk_delete/',
      data: {
        tour_ids: tourIds
      }
    });
  } catch (error) {
    handleApiError(error, 'bulk deleting tours');
  }
};
