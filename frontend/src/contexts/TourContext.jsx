// src/contexts/TourContext.jsx - Updated to handle destinations properly
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

  // Sample destinations data (you can replace this with API calls)
  const sampleDestinations = [
    {
      id: 1,
      name: "Maasai Mara National Reserve",
      slug: "maasai-mara-national-reserve",
      county: "Narok",
      region: "rift_valley",
      description: "World-famous for the Great Migration and Big Five wildlife. Richard has guided countless visitors through this spectacular ecosystem, witnessing the annual wildebeest migration, incredible predator-prey interactions, and the rich Maasai culture.",
      latitude: -1.4061,
      longitude: 35.0117,
      is_featured: true,
      image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      images_count: 5,
      images: [
        {
          id: 1,
          url: "https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
          caption: "Lions resting under acacia trees during the golden hour"
        },
        {
          id: 2,
          url: "https://images.unsplash.com/photo-1549366021-9f761d040a94?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
          caption: "The Great Migration - thousands of wildebeest crossing the Mara River"
        },
        {
          id: 3,
          url: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
          caption: "Maasai warriors in traditional attire during a cultural visit"
        },
        {
          id: 4,
          url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
          caption: "Elephants at sunset against the dramatic Mara sky"
        },
        {
          id: 5,
          url: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
          caption: "Leopard resting on a tree branch during an evening game drive"
        }
      ]
    },
    {
      id: 2,
      name: "Amboseli National Park",
      slug: "amboseli-national-park",
      county: "Kajiado",
      region: "rift_valley",
      description: "Best place to view Mount Kilimanjaro and large elephant herds. Richard knows the secret spots where Kilimanjaro's snow-capped peak creates the perfect backdrop for wildlife photography.",
      latitude: -2.6527,
      longitude: 37.2606,
      is_featured: true,
      image: "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      images_count: 3,
      images: [
        {
          id: 1,
          url: "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
          caption: "Elephants with Mount Kilimanjaro in the background"
        },
        {
          id: 2,
          url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
          caption: "Large elephant herd crossing the Amboseli plains"
        },
        {
          id: 3,
          url: "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
          caption: "Sunrise over Mount Kilimanjaro from Amboseli"
        }
      ]
    },
    {
      id: 3,
      name: "Diani Beach",
      slug: "diani-beach",
      county: "Kwale",
      region: "coast",
      description: "Pristine white sand beaches and coral reefs. Richard has shown visitors the hidden coves, the best snorkeling spots, and introduced them to the local coastal culture.",
      latitude: -4.2949,
      longitude: 39.5797,
      is_featured: true,
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      images_count: 3,
      images: [
        {
          id: 1,
          url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
          caption: "Crystal clear turquoise waters of Diani Beach"
        },
        {
          id: 2,
          url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
          caption: "Traditional dhow sailing at sunset"
        },
        {
          id: 3,
          url: "https://images.unsplash.com/photo-1571501679680-de32f1e7aad4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
          caption: "Pristine white sand beach stretching into the distance"
        }
      ]
    }
  ]

  // Load data on mount
  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // For now, use sample data instead of API calls
      // Later you can replace this with: const destinationsRes = await tourAPI.getDestinations()
      setDestinations(sampleDestinations)
      
      // Still fetch categories for any remaining tour functionality
      const categoriesRes = await tourAPI.getCategories()
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : [])
      
    } catch (err) {
      console.error('Error fetching initial data:', err)
      setError(err.response?.data?.message || 'Failed to fetch data')
      setDestinations(sampleDestinations) // Fallback to sample data
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const getDestinationBySlug = (slug) => {
    return destinations.find(dest => dest.slug === slug)
  }

  const value = {
    destinations,
    categories,
    loading,
    error,
    getDestinationBySlug,
    // Keep existing tour functionality for backward compatibility
    tours,
    featuredTours
  }

  return (
    <TourContext.Provider value={value}>
      {children}
    </TourContext.Provider>
  )
}

export default TourContext
