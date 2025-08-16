// src/components/ImageUtils.js - Utility components for handling images
import React, { useState } from 'react';

// Smart Image component that handles errors gracefully
export const SmartImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  className = '',
  fallbackText,
  fallbackIcon = '📷',
  style = {},
  ...props 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Generate a consistent color based on alt text
  const getBackgroundColor = (text) => {
    if (!text) return '#e9ecef';
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#82E0AA', '#F8C471', '#D7BDE2', '#AED6F1'
    ];
    const index = text.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (imageError || !src) {
    return (
      <div 
        className={`image-placeholder ${className}`}
        style={{
          width: width || '100%',
          height: height || '200px',
          backgroundColor: getBackgroundColor(alt),
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '1rem',
          fontWeight: 'bold',
          textAlign: 'center',
          borderRadius: '8px',
          position: 'relative',
          overflow: 'hidden',
          ...style
        }}
        role="img"
        aria-label={alt}
      >
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          {fallbackIcon}
        </div>
        <div style={{ fontSize: '0.9rem', padding: '0 1rem' }}>
          {fallbackText || alt || 'Image'}
        </div>
        
        {/* Subtle decorative background */}
        <div 
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-20%',
            width: '60%',
            height: '60%',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            pointerEvents: 'none'
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: width || '100%', height: height || 'auto' }}>
      {imageLoading && (
        <div 
          className="image-loading-placeholder"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#f8f9fa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            zIndex: 1
          }}
        >
          <div className="loading-spinner" style={{
            width: '30px',
            height: '30px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        style={{
          width: width || '100%',
          height: height || 'auto',
          opacity: imageLoading ? 0 : 1,
          transition: 'opacity 0.3s ease',
          display: 'block',
          ...style
        }}
        onError={handleImageError}
        onLoad={handleImageLoad}
        {...props}
      />
    </div>
  );
};

// Avatar component for user profiles and team members
export const Avatar = ({ 
  name, 
  size = '50px', 
  fontSize, 
  backgroundColor,
  textColor = 'white',
  className = '',
  ...props 
}) => {
  const getInitials = (fullName) => {
    if (!fullName) return '?';
    return fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getColorFromName = (name) => {
    if (backgroundColor) return backgroundColor;
    if (!name) return '#6c757d';
    
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#82E0AA', '#F8C471', '#D7BDE2', '#AED6F1'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const calculatedFontSize = fontSize || `calc(${size} * 0.4)`;

  return (
    <div 
      className={`avatar ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: getColorFromName(name),
        color: textColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: calculatedFontSize,
        fontWeight: 'bold',
        textAlign: 'center',
        userSelect: 'none',
        flexShrink: 0
      }}
      title={name}
      {...props}
    >
      {getInitials(name)}
    </div>
  );
};

// Gallery image component with modal support
export const GalleryImage = ({ 
  image, 
  title,
  description,
  onClick,
  className = '',
  width = '300px',
  height = '200px'
}) => {
  return (
    <div 
      className={`gallery-image ${className}`}
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '12px',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease'
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        const overlay = e.currentTarget.querySelector('.gallery-overlay');
        if (overlay) {
          overlay.style.transform = 'translateY(0)';
        }
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        const overlay = e.currentTarget.querySelector('.gallery-overlay');
        if (overlay) {
          overlay.style.transform = 'translateY(100%)';
        }
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
      }}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={onClick ? 0 : -1}
      role={onClick ? 'button' : 'img'}
    >
      <SmartImage
        src={image}
        alt={title}
        width="100%"
        height="100%"
        style={{ objectFit: 'cover' }}
        fallbackText={title}
        fallbackIcon="🖼️"
      />
      
      {/* Overlay with title and description */}
      {(title || description) && (
        <div 
          className="gallery-overlay"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.8))',
            color: 'white',
            padding: '2rem 1rem 1rem',
            transform: 'translateY(100%)',
            transition: 'transform 0.3s ease'
          }}
        >
          {title && (
            <h4 style={{ 
              margin: '0 0 0.5rem 0', 
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}>
              {title}
            </h4>
          )}
          {description && (
            <p style={{ 
              margin: 0, 
              fontSize: '0.9rem',
              opacity: 0.9,
              lineHeight: '1.4'
            }}>
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// Add CSS for the loading spinner animation
const addSpinnerStyles = () => {
  if (!document.querySelector('#image-utils-styles')) {
    const style = document.createElement('style');
    style.id = 'image-utils-styles';
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
};

// Initialize styles when the module loads
if (typeof document !== 'undefined') {
  addSpinnerStyles();
}

// Utility functions for image handling (these are not React components)
export const imageUtils = {
  // Validate image file
  validateImageFile: (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!file) {
      return { valid: false, error: 'No file selected' };
    }

    if (!validTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Invalid file type. Please select a JPG, PNG, GIF, or WebP image.' 
      };
    }

    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: 'File size too large. Please select an image under 5MB.' 
      };
    }

    return { valid: true, error: null };
  },

  // Create image preview
  createImagePreview: (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'));
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  },

  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Get image dimensions
  getImageDimensions: (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
          aspectRatio: img.naturalWidth / img.naturalHeight
        });
        URL.revokeObjectURL(img.src);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image'));
      };
      
      img.src = URL.createObjectURL(file);
    });
  }
};
