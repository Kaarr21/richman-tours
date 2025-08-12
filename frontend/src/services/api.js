// src/services/api.js
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      // Optionally redirect to login
    }
    return Promise.reject(error)
  }
)

// Tours API
export const tourAPI = {
  getTours: (filters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    return api.get(`/tours/?${params}`)
  },

  getFeaturedTours: () => api.get('/tours/featured/'),
  
  getTourBySlug: (slug) => api.get(`/tours/${slug}/`),
  
  getCategories: () => api.get('/tours/categories/'),
  
  getDestinations: () => api.get('/tours/destinations/'),
  
  searchTours: (query) => api.get(`/tours/search/?q=${encodeURIComponent(query)}`),
  
  getTourStats: () => api.get('/tours/stats/'),
  
  getTourReviews: (slug) => api.get(`/tours/${slug}/reviews/`),
  
  submitReview: (slug, reviewData) => api.post(`/tours/${slug}/reviews/`, reviewData),
}

// Bookings API
export const bookingAPI = {
  createBooking: (bookingData) => api.post('/bookings/', bookingData),
  
  getBookingByReference: (reference, email) => 
    api.get(`/bookings/check/?booking_reference=${reference}&email=${email}`),
  
  getBookingDetail: (reference) => api.get(`/bookings/${reference}/`),
  
  getUserBookings: (email) => api.get(`/bookings/customer/bookings/?email=${email}`),
  
  submitInquiry: (inquiryData) => api.post('/bookings/inquiries/', inquiryData),
  
  submitContactForm: (contactData) => api.post('/bookings/contact/', contactData),
  
  subscribeNewsletter: (data) => api.post('/bookings/newsletter/subscribe/', data),
  
  unsubscribeNewsletter: (email) => api.post('/bookings/newsletter/unsubscribe/', { email }),
  
  createPayment: (paymentData) => api.post('/bookings/payments/create/', paymentData),
  
  getBookingStats: () => api.get('/bookings/stats/'),
}

// Users API
export const userAPI = {
  register: (userData) => api.post('/users/register/', userData),
  
  login: (credentials) => api.post('/users/login/', credentials),
  
  getProfile: () => api.get('/users/profile/'),
  
  updateProfile: (profileData) => api.put('/users/profile/', profileData),
  
  changePassword: (passwordData) => api.post('/users/change-password/', passwordData),
  
  getUserDashboard: () => api.get('/users/dashboard/'),
}

// Utility functions
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    localStorage.setItem('access_token', token)
  } else {
    delete api.defaults.headers.common['Authorization']
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }
}

export const getAuthToken = () => {
  return localStorage.getItem('access_token')
}

export const isAuthenticated = () => {
  return !!getAuthToken()
}

// Format currency
export const formatCurrency = (amount, currency = 'KSh') => {
  return `${currency} ${new Intl.NumberFormat().format(amount)}`
}

// Format date
export const formatDate = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
  return new Date(dateString).toLocaleDateString('en-US', options)
}

// Calculate days between dates
export const daysBetween = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000
  const firstDate = new Date(date1)
  const secondDate = new Date(date2)
  return Math.round(Math.abs((firstDate - secondDate) / oneDay))
}

export default api
