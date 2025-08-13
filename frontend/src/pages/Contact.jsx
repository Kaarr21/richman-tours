// src/pages/Contact.jsx
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import { useBooking } from '../contexts/BookingContext'

const Contact = () => {
  const { submitInquiry, loading } = useBooking()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    tour_interest: '',
    travel_date: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const contactInfo = [
    {
      icon: PhoneIcon,
      title: 'Phone',
      details: ['+254 700 123 456', '+254 722 987 654'],
      description: '24/7 Emergency Support Available'
    },
    {
      icon: EnvelopeIcon,
      title: 'Email',
      details: ['info@richmantours.co.ke', 'bookings@richmantours.co.ke'],
      description: 'We respond within 2 hours'
    },
    {
      icon: MapPinIcon,
      title: 'Office Location',
      details: ['Nairobi, Kenya'],
      description: 'Visit us by appointment'
    },
    {
      icon: GlobeAltIcon,
      title: 'Website',
      details: ['www.richmantours.co.ke'],
      description: 'Book tours online 24/7'
    }
  ]

  const businessHours = [
    { day: 'Monday - Friday', hours: '8:00 AM - 6:00 PM' },
    { day: 'Saturday', hours: '9:00 AM - 4:00 PM' },
    { day: 'Sunday', hours: '10:00 AM - 2:00 PM' },
    { day: 'Holidays', hours: 'Emergency calls only' }
  ]

  const faqs = [
    {
      question: 'What is included in your tour packages?',
      answer: 'Our tour packages typically include transportation, accommodation (where applicable), meals as specified, park fees, professional guide services, and all activities mentioned in the itinerary. Specific inclusions vary by tour - check individual tour pages for details.'
    },
    {
      question: 'Do you offer custom tours?',
      answer: 'Absolutely! We specialize in creating personalized experiences. Contact us with your preferences, dates, and budget, and we\'ll design a custom itinerary just for you.'
    },
    {
      question: 'What should I bring on a safari?',
      answer: 'Essential items include comfortable clothing in neutral colors, a hat, sunscreen, insect repellent, comfortable walking shoes, camera with extra batteries, and binoculars. We provide a detailed packing list upon booking.'
    },
    {
      question: 'Is it safe to travel in Kenya?',
      answer: 'Kenya is generally safe for tourists, especially when traveling with reputable tour operators like us. We prioritize safety and follow all necessary precautions to ensure your well-being throughout your journey.'
    },
    {
      question: 'When is the best time to visit Kenya?',
      answer: 'Kenya is a year-round destination. The best time depends on your interests - July to October for the Great Migration, December to March for fewer crowds and good weather, and April to June for lower prices and green landscapes.'
    }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await submitInquiry(formData)
      setSubmitted(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        tour_interest: '',
        travel_date: ''
      })
    } catch (error) {
      console.error('Failed to submit inquiry:', error)
    }
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-safari-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-5xl font-bold font-heading mb-6">
              Get in Touch
            </h1>
            <p className="text-xl leading-relaxed">
              Have questions about our tours? Want to plan a custom adventure? 
              We're here to help make your Kenyan experience unforgettable.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <div key={info.title} className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <info.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{info.title}</h3>
                {info.details.map((detail, idx) => (
                  <p key={idx} className="text-gray-600 mb-1">{detail}</p>
                ))}
                <p className="text-sm text-gray-500">{info.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form and Business Hours */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              
              {submitted ? (
                <div className="text-center py-8">
                  <ChatBubbleLeftRightIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-600 mb-4">
                    Thank you for contacting us. We'll get back to you within 2 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Interested Tour
                      </label>
                      <select
                        name="tour_interest"
                        value={formData.tour_interest}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Select a tour type</option>
                        <option value="safari">Safari Tours</option>
                        <option value="cultural">Cultural Tours</option>
                        <option value="adventure">Adventure Tours</option>
                        <option value="beach">Beach Tours</option>
                        <option value="mountain">Mountain Tours</option>
                        <option value="custom">Custom Tour</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Travel Date
                      </label>
                      <input
                        type="date"
                        name="travel_date"
                        value={formData.travel_date}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Tell us about your travel plans, group size, special requirements, or any questions you have..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary-600 to-safari-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>

            {/* Business Hours and Additional Info */}
            <div className="space-y-8">
              {/* Business Hours */}
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex items-center mb-6">
                  <ClockIcon className="h-8 w-8 text-primary-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">Business Hours</h2>
                </div>
                <div className="space-y-3">
                  {businessHours.map((schedule) => (
                    <div key={schedule.day} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="font-medium text-gray-900">{schedule.day}</span>
                      <span className="text-gray-600">{schedule.hours}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                  <p className="text-primary-700 font-medium">
                    🚨 Emergency Support: Available 24/7 for guests on active tours
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
                <div className="space-y-4">
                  <Link
                    to="/tours"
                    className="block w-full bg-primary-600 text-white text-center py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                  >
                    Browse All Tours
                  </Link>
                  <Link
                    to="/booking/check"
                    className="block w-full border-2 border-primary-600 text-primary-600 text-center py-3 px-4 rounded-lg font-medium hover:bg-primary-50 transition-colors"
                  >
                    Check Booking Status
                  </Link>
                  <a
                    href="tel:+254700123456"
                    className="block w-full bg-green-600 text-white text-center py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Call Now: +254 700 123 456
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-heading text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Quick answers to common questions about our tours and services
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <details key={index} className="bg-white rounded-lg shadow-md">
                <summary className="cursor-pointer p-6 font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                  {faq.question}
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section (Placeholder) */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-heading text-gray-900 mb-4">
              Visit Our Office
            </h2>
            <p className="text-xl text-gray-600">
              Located in the heart of Nairobi - schedule an appointment to meet with us
            </p>
          </div>
          <div className="bg-gray-300 h-96 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPinIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600">Interactive Map Coming Soon</p>
              <p className="text-gray-500">Nairobi, Kenya</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact
