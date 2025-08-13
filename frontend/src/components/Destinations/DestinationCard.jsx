// src/components/Destinations/DestinationCard.jsx
import React from 'react'
import { MapPinIcon, CameraIcon } from '@heroicons/react/24/outline'

const DestinationCard = ({ destination, onClick }) => {
  const {
    name,
    county,
    region,
    description,
    image,
    images_count = 0
  } = destination

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

  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
      onClick={() => onClick(destination)}
    >
      <div className="relative">
        <img
          src={image || `https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`}
          alt={name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Image Count Badge */}
        {images_count > 0 && (
          <div className="absolute top-4 right-4">
            <div className="bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm flex items-center space-x-1">
              <CameraIcon className="h-4 w-4" />
              <span>{images_count}</span>
            </div>
          </div>
        )}

        {/* Region Badge */}
        <div className="absolute bottom-4 left-4">
          <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm">
            {getRegionDisplay(region)}
          </span>
        </div>
      </div>

      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {name}
        </h3>

        {/* Location */}
        <div className="flex items-center text-gray-600 mb-3">
          <MapPinIcon className="h-4 w-4 mr-1" />
          <span className="text-sm">{county}, Kenya</span>
        </div>

        {/* Description Preview */}
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          {description}
        </p>

        {/* View Details Button */}
        <button className="w-full bg-gradient-to-r from-primary-600 to-safari-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
          View Gallery
        </button>
      </div>
    </div>
  )
}

export default DestinationCard
