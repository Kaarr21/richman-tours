// src/contexts/TourContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react'
import { tourAPI } from '../services/api'

const TourContext = createContext()

export const useTour = () => {
  const context = useContext(TourContext)
  if (!context) {
    throw new Error('useTour must be used within a TourProvider')
  }
  return context
}

export const TourProvider = ({ children }) => {
  const [tours, setTours] = useState([])
  const [featuredTours, setFeaturedTours] = useState([])
  const [categories, setCategories] = useState([])
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    category: '',
    region: '',
    price_min: '',
    price_max: '',
    difficulty: '',
    search: ''
  })

  // Fetch categories and destinations on mount
  useEffect(() => {
    fetchInitialData()
  }, [])

  // Fetch tours when filters change
  useEffect(() => {
    fetchTours()
  }, [filters])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const [categoriesRes, destinationsRes, featuredRes] = await Promise.all([
        tourAPI.getCategories(),
        tourAPI.getDestinations(),
        tourAPI.getFeaturedTours()
      ])
      
      setCategories(categoriesRes.data)
      setDestinations(destinationsRes.data)
      setFeaturedTours(featuredRes.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const fetchTours = async () => {
    try {
      setLoading(true)
      const response = await tourAPI.getTours(filters)
      setTours(response.data.results || response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tours')
    } finally {
      setLoading(false)
    }
  }

  const getTourBySlug = async (slug) => {
    try {
      const response = await tourAPI.getTourBySlug(slug)
      return response.data
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to fetch tour')
    }
  }

  const searchTours = async (query) => {
    try {
      setLoading(true)
      const response = await tourAPI.searchTours(query)
      setTours(response.data.results)
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      region: '',
      price_min: '',
      price_max: '',
      difficulty: '',
      search: ''
    })
  }

  const value = {
    tours,
    featuredTours,
    categories,
    destinations,
    loading,
    error,
    filters,
    getTourBySlug,
    searchTours,
    updateFilters,
    clearFilters,
    fetchTours
  }

  return (
    <TourContext.Provider value={value}>
      {children}
    </TourContext.Provider>
  )
}
