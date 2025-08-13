// src/pages/About.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import {
  UserGroupIcon,
  TruckIcon,
  ShieldCheckIcon,
  HeartIcon,
  MapPinIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  StarIcon
} from '@heroicons/react/24/outline'

const About = () => {
  const team = [
    {
      name: 'Richard Muchiri',
      position: 'Founder & Lead Guide',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
      description: 'With over 10 years of experience guiding tours across Kenya, Richard founded Richman Tours to share his passion for Kenya\'s natural beauty and rich culture.',
      specialties: ['Wildlife Photography', 'Cultural Tours', 'Adventure Planning']
    },
    {
      name: 'Sarah Wanjiku',
      position: 'Operations Manager',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b494?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
      description: 'Sarah ensures every tour runs smoothly, handling logistics and customer service with attention to detail and genuine care for our guests.',
      specialties: ['Tour Operations', 'Customer Service', 'Logistics Planning']
    },
    {
      name: 'James Kipkorir',
      position: 'Senior Guide & Driver',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
      description: 'James brings extensive knowledge of Kenya\'s wildlife and ecosystems, making every safari an educational and thrilling experience.',
      specialties: ['Wildlife Tracking', 'Safari Driving', 'Conservation Education']
    }
  ]

  const values = [
    {
      icon: HeartIcon,
      title: 'Passion for Kenya',
      description: 'We are deeply passionate about showcasing the incredible beauty, wildlife, and culture of Kenya to visitors from around the world.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Safety First',
      description: 'Your safety and security are our top priorities. We maintain the highest safety standards in all our tours and activities.'
    },
    {
      icon: UserGroupIcon,
      title: 'Personal Service',
      description: 'We believe in creating personal connections and tailoring each experience to meet our guests\' individual interests and needs.'
    },
    {
      icon: GlobeAltIcon,
      title: 'Sustainable Tourism',
      description: 'We are committed to responsible tourism that benefits local communities and helps preserve Kenya\'s natural heritage.'
    }
  ]

  const achievements = [
    { icon: StarIcon, title: '2000+ Happy Travelers', description: 'Guests from over 50 countries' },
    { icon: MapPinIcon, title: '50+ Destinations', description: 'Covering all regions of Kenya' },
    { icon: TruckIcon, title: '500+ Tours Completed', description: 'With 99% satisfaction rate' },
    { icon: AcademicCapIcon, title: '10+ Years Experience', description: 'Deep knowledge of Kenya' }
  ]

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-primary-600 to-safari-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-5xl font-bold font-heading mb-6">
              About Richman Tours & Travel
            </h1>
            <p className="text-xl leading-relaxed">
              We are a passionate team of local guides and travel experts dedicated to 
              showcasing the incredible beauty and rich culture of Kenya through 
              unforgettable, authentic experiences.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold font-heading text-gray-900 mb-6">
                  Our Story
                </h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    Richman Tours & Travel was born from a simple dream: to share the magic of Kenya 
                    with travelers from around the world. Founded by Richard Muchiri in 2014, our 
                    company started as a small operation with one vehicle and a big vision.
                  </p>
                  <p>
                    Growing up in Kenya, Richard developed a deep love for his country's diverse 
                    landscapes, incredible wildlife, and vibrant cultures. After years of working 
                    with various tour operators, he realized that many visitors were missing out 
                    on the authentic, personal experiences that make Kenya truly special.
                  </p>
                  <p>
                    Today, we've grown into a trusted team of local experts who are passionate 
                    about creating meaningful connections between our guests and the land we call home. 
                    Every tour we offer is designed to be more than just sightseeing—it's an 
                    opportunity to understand and appreciate Kenya's natural wonders and cultural heritage.
                  </p>
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80"
                  alt="Kenya Safari"
                  className="rounded-lg shadow-lg"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">10+</div>
                    <div className="text-sm text-gray-600">Years of Experience</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-heading text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              These core values guide everything we do and shape every experience we create
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div 
                key={value.title}
                className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow duration-300"
              >
                <value.icon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-heading text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our experienced team of local guides and travel experts are here to make your 
              Kenyan adventure unforgettable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div 
                key={member.name}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-primary-600 font-medium mb-3">{member.position}</p>
                  <p className="text-gray-600 mb-4">{member.description}</p>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Specialties:</h4>
                    <div className="flex flex-wrap gap-2">
                      {member.specialties.map((specialty) => (
                        <span 
                          key={specialty}
                          className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-heading text-gray-900 mb-4">
              Our Achievements
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're proud of what we've accomplished and the trust our guests have placed in us
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div 
                key={achievement.title}
                className="text-center"
              >
                <achievement.icon className="h-16 w-16 text-primary-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{achievement.title}</h3>
                <p className="text-gray-600">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-safari-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Experience Kenya with Us?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied travelers who have discovered the magic of Kenya 
            through our expert-guided tours and authentic experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/tours"
              className="bg-white text-primary-600 px-8 py-3 rounded-full font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
            >
              Explore Our Tours
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-primary-600 transition-all duration-300"
            >
              Contact Us Today
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
