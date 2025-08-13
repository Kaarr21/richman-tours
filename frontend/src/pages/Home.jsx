// src/pages/Home.jsx
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  StarIcon,
  MapPinIcon,
  CalendarDaysIcon,
  UsersIcon,
  TruckIcon,
  ShieldCheckIcon,
  ClockIcon,
  CameraIcon
} from '@heroicons/react/24/outline'
import { useTour } from '../contexts/TourContext'
import DestinationCard from '../components/Destinations/DestinationCard'
import DestinationModal from '../components/Destinations/DestinationModal'
import NewsletterSignup from "../components/Common/NewsletterSignup"
import LoadingSpinner from "../components/Common/LoadingSpinner"

const Home = () => {
  const { destinations, loading } = useTour()
  const [selectedDestination, setSelectedDestination] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Get featured destinations (you can add is_featured field to destinations or just take first 6)
  const featuredDestinations = destinations?.filter(dest => dest.is_featured).slice(0, 6) || 
                              destinations?.slice(0, 6) || []

  const stats = [
    { label: 'Happy Travelers', value: '2000+', icon: UsersIcon },
    { label: 'Destinations Visited', value: '50+', icon: MapPinIcon },
    { label: 'Years Experience', value: '10+', icon: ClockIcon },
    { label: 'Counties Explored', value: '25+', icon: TruckIcon },
  ]

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Safe & Secure',
      description: 'Your safety is our top priority with experienced guides and reliable vehicles.'
    },
    {
      icon: CalendarDaysIcon,
      title: 'Flexible Booking',
      description: 'Easy booking process with flexible payment options and free cancellation.'
    },
    {
      icon: TruckIcon,
      title: 'Comfortable Travel',
      description: 'Modern, well-maintained vehicles for a comfortable journey across Kenya.'
    },
    {
      icon: CameraIcon,
      title: 'Memorable Experiences',
      description: 'Create lasting memories with unique experiences and breathtaking destinations.'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      location: 'Nairobi',
      rating: 5,
      comment: 'Amazing experience with Richman Tours! Richard was an excellent guide and showed us hidden gems across Kenya.',
      destination: 'Maasai Mara'
    },
    {
      name: 'Michael Smith',
      location: 'Mombasa',
      rating: 5,
      comment: 'Professional service and great local knowledge. Richard knows the best spots and their stories.',
      destination: 'Mount Kenya'
    },
    {
      name: 'Amina Hassan',
      location: 'Kisumu',
      rating: 5,
      comment: 'The destinations Richard took us to were breathtaking. Each place had its own unique beauty and story.',
      destination: 'Lake Nakuru'
    }
  ]

  const handleDestinationClick = (destination) => {
    setSelectedDestination(destination)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedDestination(null)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80)'
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-bold font-heading mb-6">
            Discover
            <span className="bg-gradient-to-r from-accent-400 to-safari-400 bg-clip-text text-transparent">
              {' '}Kenya's{' '}
            </span>
            Hidden Gems
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto">
            Explore the incredible destinations Richard has discovered across Kenya. From pristine wilderness to cultural treasures, experience the best of our beautiful country.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/destinations"
              className="bg-gradient-to-r from-primary-600 to-safari-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              Explore Destinations
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              Contact Richard
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce-gentle">
          <div className="flex flex-col items-center">
            <span className="text-sm mb-2">Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <stat.icon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Destinations Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold font-heading text-gray-900 mb-4">
              Places Richard Has Taken Travelers
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the amazing destinations Richard has explored with previous guests. Each location has been personally visited and comes with unique stories and experiences.
            </p>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredDestinations.map((destination, index) => (
                <div
                  key={destination.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <DestinationCard 
                    destination={destination} 
                    onClick={handleDestinationClick}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12 animate-fade-in">
            <Link
              to="/destinations"
              className="inline-block bg-gradient-to-r from-primary-600 to-safari-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
            >
              View All Destinations
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold font-heading text-gray-900 mb-4">
              Why Travel with Richard?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Local expertise, personalized service, and unforgettable experiences across Kenya
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <feature.icon className="h-16 w-16 text-primary-600 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold font-heading text-gray-900 mb-4">
              What Travelers Say About Richard
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hear from guests who have explored Kenya's destinations with Richard as their guide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="bg-white p-6 rounded-lg shadow-md animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.comment}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                  <p className="text-sm text-primary-600">Visited {testimonial.destination}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-safari-600">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-fade-in">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Explore Kenya with Richard?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Let Richard show you the hidden gems and incredible destinations across Kenya. 
              Each journey is personalized to create memories that will last a lifetime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/destinations"
                className="bg-white text-primary-600 px-8 py-3 rounded-full font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
              >
                Browse Destinations
              </Link>
              <Link
                to="/contact"
                className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-primary-600 transition-all duration-300"
              >
                Plan Your Journey
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <NewsletterSignup />

      {/* Destination Modal */}
      <DestinationModal 
        destination={selectedDestination}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  )
}

export default Home
