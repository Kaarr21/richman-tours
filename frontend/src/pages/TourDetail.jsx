// src/pages/TourDetail.jsx
import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  StarIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  CheckIcon,
  XMarkIcon,
  CameraIcon,
  HeartIcon,
  ShareIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { useTour } from '../contexts/TourContext'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import { formatCurrency } from '../services/api'

const TourDetail = () => {
  const { slug } = useParams()
  const { getTourBySlug } = useTour()
  const [tour, setTour] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)

  useEffect(() => {
    const fetchTour = async () => {
      try {
        setLoading(true)
        const tourData = await getTourBySlug(slug)
        setTour(tourData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchTour()
    }
  }, [slug, getTourBySlug])

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

  const nextImage = () => {
    if (tour?.images?.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % tour.images.length)
    }
  }

  const prevImage = () => {
    if (tour?.images?.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + tour.images.length) % tour.images.length)
    }
  }

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    // Here you would typically save to localStorage or send to API
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: tour?.title,
        text: `Check out this amazing tour: ${tour?.title}`,
        url: window.location.href,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (loading) return <LoadingSpinner text="Loading tour details..." />

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tour Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link 
            to="/tours" 
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Browse All Tours
          </Link>
        </div>
      </div>
    )
  }

  if (!tour) return null

  const allImages = tour.images?.length > 0 
    ? [{ image: tour.featured_image, caption: 'Featured Image' }, ...tour.images]
    : [{ image: tour.featured_image, caption: 'Featured Image' }]

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'itinerary', label: 'Itinerary' },
    { id: 'includes', label: 'What\'s Included' },
    { id: 'reviews', label: `Reviews (${tour.total_reviews})` }
  ]

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Hero Section with Image Gallery */}
      <section className="relative">
        <div className="relative h-96 md:h-[500px] overflow-hidden">
          <img
            src={allImages[currentImageIndex]?.image || tour.featured_image}
            alt={allImages[currentImageIndex]?.caption || tour.title}
            className="w-full h-full object-cover"
          />
          
          {/* Image Navigation */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition-colors"
              >
                <ChevronLeftIcon className="h-6 w-6 text-gray-800" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition-colors"
              >
                <ChevronRightIcon className="h-6 w-6 text-gray-800" />
              </button>
              
              {/* Image Counter */}
              <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                <CameraIcon className="inline h-4 w-4 mr-1" />
                {currentImageIndex + 1} / {allImages.length}
              </div>
            </>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30" />
          
          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="container mx-auto">
              <div className="flex items-center space-x-2 mb-2">
                <span className="bg-primary-600 px-3 py-1 rounded-full text-sm">
                  {tour.category?.name}
                </span>
                {tour.is_featured && (
                  <span className="bg-accent-500 px-3 py-1 rounded-full text-sm">
                    Featured
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-sm capitalize ${getDifficultyColor(tour.difficulty)}`}>
                  {tour.difficulty}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">
                {tour.title}
              </h1>
              <div className="flex items-center space-x-6 text-lg">
                <div className="flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-1" />
                  <span>
                    {tour.destinations?.slice(0, 2).map(dest => dest.name).join(', ')}
                    {tour.destinations?.length > 2 && ` +${tour.destinations.length - 2} more`}
                  </span>
                </div>
                {tour.rating > 0 && (
                  <div className="flex items-center">
                    <StarIcon className="h-5 w-5 mr-1 fill-current text-yellow-400" />
                    <span>{tour.rating.toFixed(1)} ({tour.total_reviews} reviews)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Quick Info */}
              <div className="bg-gray-50 p-6 rounded-lg mb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <ClockIcon className="h-6 w-6 text-primary-600 mx-auto mb-2" />
                    <div className="text-sm text-gray-600">Duration</div>
                    <div className="font-semibold">
                      {tour.duration_days} day{tour.duration_days !== 1 ? 's' : ''}
                      {tour.duration_nights > 0 && `, ${tour.duration_nights} night${tour.duration_nights !== 1 ? 's' : ''}`}
                    </div>
                  </div>
                  <div className="text-center">
                    <UsersIcon className="h-6 w-6 text-primary-600 mx-auto mb-2" />
                    <div className="text-sm text-gray-600">Group Size</div>
                    <div className="font-semibold">Max {tour.max_group_size}</div>
                  </div>
                  <div className="text-center">
                    <CalendarDaysIcon className="h-6 w-6 text-primary-600 mx-auto mb-2" />
                    <div className="text-sm text-gray-600">Min Age</div>
                    <div className="font-semibold">{tour.min_age}+ years</div>
                  </div>
                  <div className="text-center">
                    <CurrencyDollarIcon className="h-6 w-6 text-primary-600 mx-auto mb-2" />
                    <div className="text-sm text-gray-600">Price</div>
                    <div className="font-semibold">{formatCurrency(tour.price)}</div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-8">
                <nav className="-mb-px flex space-x-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="mb-8">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Tour Description</h3>
                      <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                        {tour.description}
                      </p>
                    </div>

                    {tour.highlights_list?.length > 0 && (
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Tour Highlights</h3>
                        <ul className="space-y-2">
                          {tour.highlights_list.map((highlight, index) => (
                            <li key={index} className="flex items-start">
                              <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600">{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Destinations</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tour.destinations?.map((destination) => (
                          <div key={destination.id} className="border rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900">{destination.name}</h4>
                            <p className="text-sm text-gray-600">{destination.county}, {destination.region}</p>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {destination.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'itinerary' && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Day by Day Itinerary</h3>
                    {tour.itinerary?.length > 0 ? (
                      <div className="space-y-6">
                        {tour.itinerary.map((day) => (
                          <div key={day.id} className="border-l-4 border-primary-200 pl-6 pb-6">
                            <div className="flex items-center mb-2">
                              <div className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                                {day.day_number}
                              </div>
                              <h4 className="text-xl font-semibold text-gray-900">{day.title}</h4>
                            </div>
                            <p className="text-gray-600 mb-3 whitespace-pre-line">{day.description}</p>
                            {(day.accommodation || day.meals) && (
                              <div className="bg-gray-50 p-3 rounded-lg">
                                {day.accommodation && (
                                  <p className="text-sm text-gray-600 mb-1">
                                    <strong>Accommodation:</strong> {day.accommodation}
                                  </p>
                                )}
                                {day.meals && (
                                  <p className="text-sm text-gray-600">
                                    <strong>Meals:</strong> {day.meals}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">Detailed itinerary will be provided upon booking.</p>
                    )}
                  </div>
                )}

                {activeTab === 'includes' && (
                  <div className="space-y-8">
                    {tour.includes_list?.length > 0 && (
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">What's Included</h3>
                        <ul className="space-y-2">
                          {tour.includes_list.map((item, index) => (
                            <li key={index} className="flex items-start">
                              <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {tour.excludes_list?.length > 0 && (
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">What's Not Included</h3>
                        <ul className="space-y-2">
                          {tour.excludes_list.map((item, index) => (
                            <li key={index} className="flex items-start">
                              <XMarkIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h3>
                    {tour.reviews?.length > 0 ? (
                      <div className="space-y-6">
                        {tour.reviews.map((review) => (
                          <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                            <div className="flex items-center mb-3">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <StarIcon
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="ml-2 font-medium text-gray-900">{review.name}</span>
                              <span className="ml-2 text-gray-500">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                            <p className="text-gray-600">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No reviews yet. Be the first to review this tour!</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Booking Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-primary-600 mb-2">
                    {formatCurrency(tour.price)}
                  </div>
                  <p className="text-gray-600">per person</p>
                </div>

                <div className="space-y-4 mb-6">
                  <Link
                    to={`/book/${tour.slug}`}
                    className="w-full bg-gradient-to-r from-primary-600 to-safari-600 text-white text-center py-3 px-4 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 block"
                  >
                    Book This Tour
                  </Link>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={toggleWishlist}
                      className="flex-1 border-2 border-gray-200 text-gray-600 py-2 px-3 rounded-lg hover:border-red-300 hover:text-red-500 transition-colors flex items-center justify-center"
                    >
                      {isWishlisted ? (
                        <HeartIconSolid className="h-5 w-5 text-red-500" />
                      ) : (
                        <HeartIcon className="h-5 w-5" />
                      )}
                      <span className="ml-1">Save</span>
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex-1 border-2 border-gray-200 text-gray-600 py-2 px-3 rounded-lg hover:border-primary-300 hover:text-primary-500 transition-colors flex items-center justify-center"
                    >
                      <ShareIcon className="h-5 w-5" />
                      <span className="ml-1">Share</span>
                    </button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Have Questions?</h4>
                  <div className="space-y-2 text-sm">
                    <Link
                      to="/contact"
                      className="block text-primary-600 hover:text-primary-700"
                    >
                      Contact our travel experts
                    </Link>
                    <a
                      href="tel:+254700123456"
                      className="block text-primary-600 hover:text-primary-700"
                    >
                      Call: +254 700 123 456
                    </a>
                    <a
                      href="mailto:info@richmantours.co.ke"
                      className="block text-primary-600 hover:text-primary-700"
                    >
                      Email: info@richmantours.co.ke
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Tours */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold font-heading text-gray-900 mb-8 text-center">
            You Might Also Like
          </h2>
          <div className="text-center">
            <Link
              to="/tours"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Browse More Tours
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default TourDetail
