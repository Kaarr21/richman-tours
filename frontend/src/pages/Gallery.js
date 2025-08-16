// src/pages/Gallery.js - Fixed useEffect dependencies
import React, { useState, useEffect, useCallback } from 'react';
import { getGalleryImages } from '../services/api';
import '../styles/Gallery.css';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

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

  const openModal = (image, index) => {
    setSelectedImage(image);
    setCurrentIndex(index);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setCurrentIndex(0);
  };

  // Use useCallback to memoize navigation functions
  const nextImage = useCallback(() => {
    if (images.length === 0) return;
    const newIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(newIndex);
    setSelectedImage(images[newIndex]);
  }, [currentIndex, images]);

  const prevImage = useCallback(() => {
    if (images.length === 0) return;
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    setSelectedImage(images[newIndex]);
  }, [currentIndex, images]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!selectedImage) return;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          nextImage();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevImage();
          break;
        case 'Escape':
          e.preventDefault();
          closeModal();
          break;
        default:
          break;
      }
    };

    if (selectedImage) {
      document.addEventListener('keydown', handleKeyPress);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage, nextImage, prevImage]); // Now dependencies are properly included

  // Handle image load error
  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/300x200?text=Gallery+Image';
  };

  if (loading) {
    return (
      <div className="gallery">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading gallery...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gallery">
      <div className="container">
        <div className="page-header">
          <h1>Photo Gallery</h1>
          <p>Explore breathtaking moments from our tours and destinations around the world.</p>
        </div>

        {images.length > 0 ? (
          <>
            <div className="gallery-stats">
              <p>{images.length} {images.length === 1 ? 'image' : 'images'} in gallery</p>
            </div>

            <div className="gallery-grid">
              {images.map((image, index) => (
                <div 
                  key={image.id} 
                  className="gallery-item"
                  onClick={() => openModal(image, index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openModal(image, index);
                    }
                  }}
                  aria-label={`View ${image.title}`}
                >
                  <div className="image-wrapper">
                    <img 
                      src={image.image || 'https://via.placeholder.com/300x200?text=Gallery+Image'} 
                      alt={image.title}
                      onError={handleImageError}
                      loading="lazy"
                    />
                    <div className="image-number">
                      {index + 1}
                    </div>
                  </div>
                  <div className="gallery-overlay">
                    <h3>{image.title}</h3>
                    {image.description && <p>{image.description}</p>}
                    <span className="view-icon">🔍</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="no-images">
            <div className="empty-state">
              <span className="empty-icon">🖼️</span>
              <h3>No images available</h3>
              <p>The gallery is currently empty. Check back soon for amazing photos!</p>
            </div>
          </div>
        )}

        {/* Enhanced Modal for full-size image */}
        {selectedImage && (
          <div className="modal" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-counter">
                  {currentIndex + 1} of {images.length}
                </div>
                <button 
                  className="close" 
                  onClick={closeModal}
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>
              
              <div className="modal-image-container">
                {images.length > 1 && (
                  <button 
                    className="nav-btn prev-btn" 
                    onClick={prevImage}
                    aria-label="Previous image"
                  >
                    &#8249;
                  </button>
                )}
                
                <img 
                  src={selectedImage.image} 
                  alt={selectedImage.title}
                  className="modal-image"
                  onError={handleImageError}
                />
                
                {images.length > 1 && (
                  <button 
                    className="nav-btn next-btn" 
                    onClick={nextImage}
                    aria-label="Next image"
                  >
                    &#8250;
                  </button>
                )}
              </div>
              
              <div className="modal-info">
                <h3>{selectedImage.title}</h3>
                {selectedImage.description && <p>{selectedImage.description}</p>}
                <div className="modal-meta">
                  <small>
                    Added: {new Date(selectedImage.created_at).toLocaleDateString()}
                  </small>
                </div>
              </div>

              {/* Thumbnail navigation for multiple images */}
              {images.length > 1 && (
                <div className="thumbnail-nav">
                  {images.map((img, idx) => (
                    <button
                      key={img.id}
                      className={`thumbnail ${idx === currentIndex ? 'active' : ''}`}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setSelectedImage(img);
                      }}
                      aria-label={`Go to image ${idx + 1}: ${img.title}`}
                    >
                      <img 
                        src={img.image} 
                        alt={img.title}
                        onError={handleImageError}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
