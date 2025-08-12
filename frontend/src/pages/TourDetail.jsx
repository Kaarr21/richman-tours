// src/pages/TourDetail.jsx
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useTour } from '../contexts/TourContext'
import LoadingSpinner from '../components/Common/LoadingSpinner'

const TourDetail = () => {
  const { slug } = useParams()
  const { getTourBySlug } = useTour()
  const [tour, setTour] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const tourData = await getTourBySlug(slug)
        setTour(tourData)
      } catch (error) {
        console.error('Error fetching tour:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTour()
  }, [slug, getTourBySlug])

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">
          {tour?.title || 'Tour Details'}
        </h1>
        <p>Tour detail page - Coming soon</p>
      </div>
    </div>
  )
}

export default TourDetail
