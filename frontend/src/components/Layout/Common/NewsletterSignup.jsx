// src/components/Common/NewsletterSignup.jsx
import React, { useState } from 'react'
//import { motion } from 'framer-motion'
import { EnvelopeIcon } from '@heroicons/react/24/outline'
import { useBooking } from '../../contexts/BookingContext'

const NewsletterSignup = () => {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { subscribeToNewsletter, loading } = useBooking()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return

    try {
      await subscribeToNewsletter(email, name)
      setIsSubmitted(true)
      setEmail('')
      setName('')
    } catch (error) {
      console.error('Newsletter subscription failed:', error)
    }
  }

  if (isSubmitted) {
    return (
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-safari-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <EnvelopeIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
            <p className="text-gray-300">
              You've successfully subscribed to our newsletter. Get ready for amazing travel inspiration!
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="mt-4 text-safari-400 hover:text-safari-300 transition-colors"
            >
              Subscribe another email
            </button>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <EnvelopeIcon className="w-12 h-12 text-safari-500 mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-white mb-4">
              Stay Updated with Our Latest Tours
            </h3>
            <p className="text-gray-300 mb-8">
              Subscribe to our newsletter and be the first to know about new destinations, 
              special offers, and travel tips from Kenya.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <input
                  type="text"
                  placeholder="Your name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-safari-500"
                />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-safari-500"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading || !email}
                className="bg-gradient-to-r from-safari-600 to-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Subscribing...' : 'Subscribe Now'}
              </button>
            </form>

            <p className="text-sm text-gray-400 mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default NewsletterSignup