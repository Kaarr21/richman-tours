// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tours API
export const getTours = async () => {
  try {
    const response = await api.get('/tours/');
    return response.data;
  } catch (error) {
    console.error('Error fetching tours:', error);
    throw error;
  }
};

export const getFeaturedTours = async () => {
  try {
    const response = await api.get('/tours/featured/');
    return response.data;
  } catch (error) {
    console.error('Error fetching featured tours:', error);
    throw error;
  }
};

export const getTour = async (id) => {
  try {
    const response = await api.get(`/tours/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tour:', error);
    throw error;
  }
};

// Gallery API
export const getGalleryImages = async () => {
  try {
    const response = await api.get('/gallery/');
    return response.data;
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    throw error;
  }
};

// Contact API
export const submitContact = async (contactData) => {
  try {
    const response = await api.post('/contacts/', contactData);
    return response.data;
  } catch (error) {
    console.error('Error submitting contact:', error);
    throw error;
  }
};

export const getContacts = async () => {
  try {
    const response = await api.get('/contacts/');
    return response.data;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
};

// Testimonials API
export const getTestimonials = async () => {
  try {
    const response = await api.get('/testimonials/');
    return response.data;
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    throw error;
  }
};

// Stats API
export const getStats = async () => {
  try {
    const response = await api.get('/stats/');
    return response.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

export default api;
