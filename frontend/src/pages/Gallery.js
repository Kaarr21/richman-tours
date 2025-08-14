

// src/pages/Gallery.js
import React, { useState, useEffect } from 'react';
import { getGalleryImages } from '../services/api';
import '../styles/Gallery.css';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const data = await getGalleryImages();
        setImages(data);
      } catch (error) {
        console.error('Error fetching gallery images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const openModal = (image) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  if (loading) {
    return <div className="loading">Loading gallery...</div>;
  }

  return (
    <div className="gallery">
      <div className="container">
        <div className="page-header">
          <h1>Photo Gallery</h1>
          <p>Explore breathtaking moments from our tours and destinations around the world.</p>
        </div>

        {images.length > 0 ? (
          <div className="gallery-grid">
            {images.map(image => (
              <div 
                key={image.id} 
                className="gallery-item"
                onClick={() => openModal(image)}
              >
                <img 
                  src={image.image || 'https://via.placeholder.com/300x200?text=Gallery+Image'} 
                  alt={image.title}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=Gallery+Image';
                  }}
                />
                <div className="gallery-overlay">
                  <h3>{image.title}</h3>
                  <p>{image.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-images">
            <p>No images available in the gallery.</p>
          </div>
        )}

        {/* Modal for full-size image */}
        {selectedImage && (
          <div className="modal" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <span className="close" onClick={closeModal}>&times;</span>
              <img 
                src={selectedImage.image} 
                alt={selectedImage.title}
                className="modal-image"
              />
              <div className="modal-info">
                <h3>{selectedImage.title}</h3>
                <p>{selectedImage.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
