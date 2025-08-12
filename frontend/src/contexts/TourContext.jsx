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
      setError(null)
      
      const [categoriesRes, destinationsRes, featuredRes] = await Promise.all([
        tourAPI.getCategories(),
        tourAPI.getDestinations(),
        tourAPI.getFeaturedTours()
      ])
      
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : [])
      setDestinations(Array.isArray(destinationsRes.data) ? destinationsRes.data : [])
      setFeaturedTours(Array.isArray(featuredRes.data) ? featuredRes.data : [])
    } catch (err) {
      console.error('Error fetching initial data:', err)
      setError(err.response?.data?.message || 'Failed to fetch data')
      // Set empty arrays as fallback
      setCategories([])
      setDestinations([])
      setFeaturedTours([])
    } finally {
      setLoading(false)
    }
  }

  const fetchTours = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await tourAPI.getTours(filters)
      const toursData = response.data.results || response.data || []
      setTours(Array.isArray(toursData) ? toursData : [])
    } catch (err) {
      console.error('Error fetching tours:', err)
      setError(err.response?.data?.message || 'Failed to fetch tours')
      setTours([])
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
      setError(null)
      
      const response = await tourAPI.searchTours(query)
      const searchResults = response.data.results || response.data || []
      setTours(Array.isArray(searchResults) ? searchResults : [])
    } catch (err) {
      console.error('Error searching tours:', err)
      setError(err.response?.data?.message || 'Search failed')
      setTours([])
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

export default TourContext
