// src/pages/Admin.js
import React, { useState, useEffect } from 'react';
import { getTours, getContacts, getStats, getGalleryImages } from '../services/api';
import '../styles/Admin.css';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [tours, setTours] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, toursData, contactsData, galleryData] = await Promise.all([
        getStats(),
        getTours(),
        getContacts(),
        getGalleryImages()
      ]);
      
      setStats(statsData);
      setTours(toursData);
      setContacts(contactsData);
      setGallery(galleryData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading admin panel...</div>;
  }

  return (
    <div className="admin">
      <div className="container">
        <div className="page-header">
          <h1>Admin Panel</h1>
          <p>Manage your tours, view contacts, and monitor statistics.</p>
        </div>

        <div className="admin-tabs">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''} 
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={activeTab === 'tours' ? 'active' : ''} 
            onClick={() => setActiveTab('tours')}
          >
            Tours
          </button>
          <button 
            className={activeTab === 'contacts' ? 'active' : ''} 
            onClick={() => setActiveTab('contacts')}
          >
            Contacts
          </button>
          <button 
            className={activeTab === 'gallery' ? 'active' : ''} 
            onClick={() => setActiveTab('gallery')}
          >
            Gallery
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'dashboard' && (
            <div className="dashboard">
              <h2>Dashboard Overview</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Tours</h3>
                  <p className="stat-number">{stats.total_tours || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Featured Tours</h3>
                  <p className="stat-number">{stats.featured_tours || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Contacts</h3>
                  <p className="stat-number">{stats.total_contacts || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Unread Messages</h3>
                  <p className="stat-number">{stats.unread_contacts || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Gallery Images</h3>
                  <p className="stat-number">{stats.total_gallery_images || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Testimonials</h3>
                  <p className="stat-number">{stats.total_testimonials || 0}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tours' && (
            <div className="tours-management">
              <h2>Tours Management</h2>
              <div className="tours-table">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Destination</th>
                      <th>Duration</th>
                      <th>Price</th>
                      <th>Featured</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tours.map(tour => (
                      <tr key={tour.id}>
                        <td>{tour.title}</td>
                        <td>{tour.destination}</td>
                        <td>{tour.duration}</td>
                        <td>${tour.price}</td>
                        <td>{tour.featured ? '⭐' : '-'}</td>
                        <td>
                          <button className="btn-edit">Edit</button>
                          <button className="btn-delete">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="contacts-management">
              <h2>Contact Messages</h2>
              <div className="contacts-list">
                {contacts.map(contact => (
                  <div key={contact.id} className="contact-item">
                    <div className="contact-header">
                      <h4>{contact.name}</h4>
                      <span className="contact-date">
                        {new Date(contact.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p><strong>Email:</strong> {contact.email}</p>
                    <p><strong>Subject:</strong> {contact.subject}</p>
                    <p><strong>Message:</strong> {contact.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="gallery-management">
              <h2>Gallery Management</h2>
              <div className="gallery-grid">
                {gallery.map(image => (
                  <div key={image.id} className="gallery-admin-item">
                    <img 
                      src={image.image || 'https://via.placeholder.com/200x150?text=Gallery+Image'} 
                      alt={image.title}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200x150?text=Gallery+Image';
                      }}
                    />
                    <div className="gallery-admin-info">
                      <h4>{image.title}</h4>
                      <p>{image.description}</p>
                      <button className="btn-delete">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;