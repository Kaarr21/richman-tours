// src/components/Destinations/DestinationModal.jsx
import React, { useState } from 'react'
import { 
  XMarkIcon, 
  MapPinIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  PhotoIcon 
} from '@heroicons/react/24/outline'

const DestinationModal = ({ destination, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  if (!isOpen || !destination) return null

  const {
    name,
    county,
    region,
    description,
    latitude,
    longitude,
    images = []
  } = destination

  // Sample images if none provided (you can replace with actual images)
  const displayImages = images.length > 0 ? images : [
    {
      id: 1,
      url: destination.image || `https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80`,
      caption: `Beautiful view of ${name}`
    }
  ]

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

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === displayImages.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? displayImages.length - 1 : prev - 1
    )
  }

  const openGoogleMaps = () => {
    if (latitude && longitude) {
      window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank')
    } else {
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(name + ' ' + county)}`, '_blank')
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image Section */}
            <div className="relative">
              {displayImages.length > 0 ? (
                <>
                  <img
                    src={displayImages[currentImageIndex].url || displayImages[currentImageIndex].image}
                    alt={displayImages[currentImageIndex].caption || name}
                    className="w-full h-64 lg:h-96 object-cover"
                  />
                  
                  {displayImages.length > 1 && (
                    <>
                      {/* Previous Button */}
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                      >
                        <ChevronLeftIcon className="h-5 w-5" />
                      </button>
                      
                      {/* Next Button */}
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                      >
                        <ChevronRightIcon className="h-5 w-5" />
                      </button>
                      
                      {/* Image Counter */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {displayImages.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-64 lg:h-96 bg-gray-200 flex items-center justify-center">
                  <PhotoIcon className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="p-6 lg:p-8">
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {name}
                </h2>
                
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPinIcon className="h-5 w-5 mr-2" />
                  <span>{county}, {getRegionDisplay(region)}</span>
                </div>
                
                <span className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                  {getRegionDisplay(region)}
                </span>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  About This Destination
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Location Coordinates */}
              {(latitude && longitude) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Location
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Latitude: {latitude}°<br />
                    Longitude: {longitude}°
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={openGoogleMaps}
                  className="w-full bg-gradient-to-r from-primary-600 to-safari-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  View on Google Maps
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full bg-gray-100 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>

              {/* Image Thumbnails */}
              {displayImages.length > 1 && (
                <div className="mt-6">
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {displayImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                          index === currentImageIndex 
                            ? 'border-primary-500' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={img.url || img.image}
                          alt={`${name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DestinationModal
