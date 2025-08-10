// src/contexts/BookingContext.jsx
import React, { createContext, useContext, useState } from 'react'
import { bookingAPI } from '../services/api'

const BookingContext = createContext()

export const useBooking = () => {
  const context = useContext(BookingContext)
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider')
  }
  return context
}

export const BookingProvider = ({ children }) => {
  const [currentBooking, setCurrentBooking] = useState(null)
  const [bookingStep, setBookingStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createBooking = async (bookingData) => {
    try {
      setLoading(true)
      setError(null)
      const response = await bookingAPI.createBooking(bookingData)
      setCurrentBooking(response.data)
      return response.data
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create booking'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getBookingByReference = async (reference, email) => {
    try {
      setLoading(true)
      const response = await bookingAPI.getBookingByReference(reference, email)
      return response.data
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Booking not found')
    } finally {
      setLoading(false)
    }
  }

  const submitInquiry = async (inquiryData) => {
    try {
      setLoading(true)
      const response = await bookingAPI.submitInquiry(inquiryData)
      return response.data
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to submit inquiry')
    } finally {
      setLoading(false)
    }
  }

  const subscribeToNewsletter = async (email, name = '') => {
    try {
      const response = await bookingAPI.subscribeNewsletter({ email, name })
      return response.data
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to subscribe')
    }
  }

  const nextStep = () => {
    setBookingStep(prev => prev + 1)
  }

  const prevStep = () => {
    setBookingStep(prev => Math.max(1, prev - 1))
  }

  const resetBooking = () => {
    setCurrentBooking(null)
    setBookingStep(1)
    setError(null)
  }

  const value = {
    currentBooking,
    bookingStep,
    loading,
    error,
    createBooking,
    getBookingByReference,
    submitInquiry,
    subscribeToNewsletter,
    nextStep,
    prevStep,
    resetBooking,
    setError
  }

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  )
}
