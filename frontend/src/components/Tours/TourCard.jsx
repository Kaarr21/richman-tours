// src/components/Layout/Tours/TourCard.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { 
  StarIcon, 
  ClockIcon, 
  MapPinIcon, 
  UsersIcon 
} from '@heroicons/react/24/outline'
import { formatCurrency } from "../../services/api";

const TourCard = ({ tour }) => {
  const {
    id,
    title,
    slug,
    category,
    destinations,
    price,
    duration_days,
    duration_nights,
    featured_image,
    rating,
    total_reviews,
    difficulty,
    is_featured
  } = tour

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800'
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800'
      case 'challenging':
        return 'bg-orange-100 text-orange-800'
      case 'expert':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
      <div className="relative">
        <img
          src={featured_image || `https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`}
          alt={title}
          className="w-full h-48 object-cover"
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {is_featured && (
            <span className="bg-accent-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Featured
            </span>
          )}
          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getDifficultyColor(difficulty)}`}>
            {difficulty}
          </span>
        </div>

        {/* Price Badge */}
        <div className="absolute top-4 right-4">
          <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg">
            <span className="text-lg font-bold text-primary-600">
              {formatCurrency(price)}
            </span>
          </div>
        </div>

        {/* Category Badge */}
        <div className="absolute bottom-4 left-4">
          <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm">
            {category?.name}
          </span>
        </div>
      </div>

      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {title}
        </h3>

        {/* Destinations */}
        <div className="flex items-center text-gray-600 mb-3">
          <MapPinIcon className="h-4 w-4 mr-1" />
          <span className="text-sm">
            {destinations?.slice(0, 2).map(dest => dest.name).join(', ')}
            {destinations?.length > 2 && ` +${destinations.length - 2} more`}
          </span>
        </div>

        {/* Duration and Group Size */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-1" />
            <span>
              {duration_days} day{duration_days !== 1 ? 's' : ''}
              {duration_nights > 0 && `, ${duration_nights} night${duration_nights !== 1 ? 's' : ''}`}
            </span>
          </div>
          <div className="flex items-center">
            <UsersIcon className="h-4 w-4 mr-1" />
            <span>Max 8 guests</span>
          </div>
        </div>

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {rating.toFixed(1)} ({total_reviews} review{total_reviews !== 1 ? 's' : ''})
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Link
            to={`/tours/${slug}`}
            className="flex-1 bg-gray-100 text-gray-800 text-center py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            View Details
          </Link>
          <Link
            to={`/book/${slug}`}
            className="flex-1 bg-gradient-to-r from-primary-600 to-safari-600 text-white text-center py-2 px-4 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  )
}

export default TourCard
