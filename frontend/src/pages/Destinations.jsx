// src/pages/Destinations.jsx
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { 
  FunnelIcon, 
  MagnifyingGlassIcon,
  MapPinIcon 
} from '@heroicons/react/24/outline'
import { useTour } from '../contexts/TourContext'
import DestinationCard from '../components/Destinations/DestinationCard'
import DestinationModal from '../components/Destinations/DestinationModal'
import LoadingSpinner from '../components/Common/LoadingSpinner'

const Destinations = () => {
  const [searchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDestination, setSelectedDestination] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filteredDestinations, setFilteredDestinations] = useState([])
  const [regionFilter, setRegionFilter] = useState('')
  const [countyFilter, setCountyFilter] = useState('')
  
  const { destinations, loading, error } = useTour()

  // Initialize filters from URL params
  useEffect(() => {
    const region = searchParams.get('region') || ''
    setRegionFilter(region)
  }, [searchParams])

  // Filter destinations based on search and filters
  useEffect(() => {
    let filtered = [...destinations]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(dest => 
        dest.name.toLowerCase().includes(query) ||
        dest.county.toLowerCase().includes(query) ||
        dest.description.toLowerCase().includes(query)
      )
    }

    // Apply region filter
    if (regionFilter) {
      filtered = filtered.filter(dest => dest.region === regionFilter)
    }

    // Apply county filter
    if (countyFilter) {
      filtered = filtered.filter(dest => dest.county === countyFilter)
    }

    setFilteredDestinations(filtered)
  }, [destinations, searchQuery, regionFilter, countyFilter])

  const handleSearch = (e) => {
    e.preventDefault()
  }

  const clearAllFilters = () => {
    setSearchQuery('')
    setRegionFilter('')
    setCountyFilter('')
  }

  const handleDestinationClick = (destination) => {
    setSelectedDestination(destination)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedDestination(null)
  }

  // Get unique regions and counties for filters
  const regions = [...new Set(destinations.map(dest => dest.region))]
  const counties = [...new Set(destinations.map(dest => dest.county))]

  const getRegionDisplay = (region) => {
    const regionMap = {
      'central': 'Central Kenya',
      'coast': 'Coast',
      'eastern': 'Eastern Kenya',
      'nairobi': 'Nairobi',
      'northern': 'Northern Kenya',
      'nyanza': 'Nyanza',
      'rift_valley': 'Rift Valley',
      'western': 'Western Kenya',
    }
    return regionMap[region] || region
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Destinations</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-heading text-gray-900 mb-4">
            Destinations Richard Has Explored
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the amazing places Richard has taken travelers to across Kenya. 
            Click on any destination to see photos and learn more about these incredible locations.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative max-w-lg mx-auto">
              <input
                type="text"
                placeholder="Search destinations, counties, or descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </form>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <FunnelIcon className="h-5 w-5" />
              <span>Filters</span>
            </button>
            
            {/* Active Filters Count */}
            {(regionFilter || countyFilter || searchQuery) && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Clear All Filters
              </button>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Region Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Region
                  </label>
                  <select
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Regions</option>
                    {regions.map((region) => (
                      <option key={region} value={region}>
                        {getRegionDisplay(region)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* County Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    County
                  </label>
                  <select
                    value={countyFilter}
                    onChange={(e) => setCountyFilter(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Counties</option>
                    {counties.sort().map((county) => (
                      <option key={county} value={county}>
                        {county}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredDestinations.length} of {destinations.length} destinations
            {(regionFilter || countyFilter || searchQuery) && (
              <span className="ml-2">
                {regionFilter && <span className="inline-block bg-primary-100 text-primary-800 px-2 py-1 rounded text-xs mr-1">
                  {getRegionDisplay(regionFilter)}
                </span>}
                {countyFilter && <span className="inline-block bg-primary-100 text-primary-800 px-2 py-1 rounded text-xs mr-1">
                  {countyFilter}
                </span>}
                {searchQuery && <span className="inline-block bg-primary-100 text-primary-800 px-2 py-1 rounded text-xs">
                  "{searchQuery}"
                </span>}
              </span>
            )}
          </p>
        </div>

        {/* Destinations Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : filteredDestinations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDestinations.map((destination) => (
              <DestinationCard 
                key={destination.id} 
                destination={destination} 
                onClick={handleDestinationClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <MapPinIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No destinations found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or filters
            </p>
            <button
              onClick={clearAllFilters}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Destination Modal */}
        <DestinationModal 
          destination={selectedDestination}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      </div>
    </div>
  )
}

export default Destinations
