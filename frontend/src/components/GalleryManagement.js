// frontend/src/components/GalleryManagement.js
// Enhanced Gallery Management with CRUD operations
import React, { useState } from 'react';

const GalleryManagement = ({ 
  gallery, 
  onDeleteImage, 
  onAddImage, 
  onUpdateImage, 
  loading 
}) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    image: null
  });
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    image: null
  });
  const [uploadLoading, setUploadLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Handle file upload for new image
  const handleFileChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      if (isEdit) {
        setEditForm({ ...editForm, image: file });
      } else {
        setUploadForm({ ...uploadForm, image: file });
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => setPreviewImage(e.target.result);
        reader.readAsDataURL(file);
      }
    }
  };

  // Handle new image upload
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    
    if (!uploadForm.title.trim()) {
      alert('Please enter a title');
      return;
    }
    
    if (!uploadForm.image) {
      alert('Please select an image');
      return;
    }

    setUploadLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('title', uploadForm.title.trim());
      formData.append('description', uploadForm.description.trim());
      formData.append('image', uploadForm.image);

      await onAddImage(formData);
      
      // Reset form and close modal
      setUploadForm({ title: '', description: '', image: null });
      setPreviewImage(null);
      setIsUploadModalOpen(false);
      
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  // Handle image edit
  const handleEditImage = (image) => {
    setEditingImage(image);
    setEditForm({
      title: image.title,
      description: image.description || '',
      image: null
    });
    setIsEditModalOpen(true);
  };

  // Handle edit submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editForm.title.trim()) {
      alert('Please enter a title');
      return;
    }

    setUploadLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('title', editForm.title.trim());
      formData.append('description', editForm.description.trim());
      
      if (editForm.image) {
        formData.append('image', editForm.image);
      }

      await onUpdateImage(editingImage.id, formData);
      
      // Reset form and close modal
      setEditForm({ title: '', description: '', image: null });
      setEditingImage(null);
      setIsEditModalOpen(false);
      
      alert('Image updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
      alert(`Update failed: ${error.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  // Close modals
  const closeUploadModal = () => {
    setUploadForm({ title: '', description: '', image: null });
    setPreviewImage(null);
    setIsUploadModalOpen(false);
  };

  const closeEditModal = () => {
    setEditForm({ title: '', description: '', image: null });
    setEditingImage(null);
    setIsEditModalOpen(false);
  };

  return (
    <div className="gallery-management">
      <div className="gallery-header">
        <h2>Gallery Management</h2>
        <button 
          className="btn-upload" 
          onClick={() => setIsUploadModalOpen(true)}
          disabled={loading}
        >
          + Upload New Image
        </button>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading gallery...</p>
        </div>
      ) : gallery.length > 0 ? (
        <div className="gallery-grid">
          {gallery.map(image => (
            <div key={image.id} className="gallery-admin-item">
              <div className="image-container">
                <img 
                  src={image.image || 'https://via.placeholder.com/200x150?text=Gallery+Image'} 
                  alt={image.title}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/200x150?text=Gallery+Image';
                  }}
                />
                <div className="image-overlay">
                  <button 
                    className="btn-edit-overlay"
                    onClick={() => handleEditImage(image)}
                  >
                    ✏️ Edit
                  </button>
                </div>
              </div>
              
              <div className="gallery-admin-info">
                <h4>{image.title}</h4>
                {image.description && <p>{image.description}</p>}
                <small>Added: {new Date(image.created_at).toLocaleDateString()}</small>
                
                <div className="gallery-admin-actions">
                  <button 
                    className="btn-edit"
                    onClick={() => handleEditImage(image)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => onDeleteImage(image.id, image.title)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-gallery">
          <div className="empty-state">
            <span className="empty-icon">🖼️</span>
            <h3>No gallery images available</h3>
            <p>Upload your first image to showcase your tours and destinations.</p>
            <button 
              className="btn-upload-empty" 
              onClick={() => setIsUploadModalOpen(true)}
            >
              Upload First Image
            </button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="modal-overlay">
          <div className="upload-modal">
            <div className="modal-header">
              <h3>Upload New Image</h3>
              <button className="close-btn" onClick={closeUploadModal}>✕</button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="upload-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({
                    ...uploadForm,
                    title: e.target.value
                  })}
                  placeholder="Enter image title..."
                  required
                  maxLength="200"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({
                    ...uploadForm,
                    description: e.target.value
                  })}
                  placeholder="Enter image description (optional)..."
                  rows="3"
                  maxLength="500"
                />
              </div>

              <div className="form-group">
                <label>Image File *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
                <small>Accepted formats: JPG, PNG, GIF (Max 5MB)</small>
              </div>

              {previewImage && (
                <div className="image-preview">
                  <label>Preview:</label>
                  <img src={previewImage} alt="Preview" />
                </div>
              )}

              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={closeUploadModal} 
                  className="btn-cancel"
                  disabled={uploadLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-upload-submit"
                  disabled={uploadLoading}
                >
                  {uploadLoading ? 'Uploading...' : 'Upload Image'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingImage && (
        <div className="modal-overlay">
          <div className="upload-modal">
            <div className="modal-header">
              <h3>Edit Image - {editingImage.title}</h3>
              <button className="close-btn" onClick={closeEditModal}>✕</button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="upload-form">
              <div className="current-image-preview">
                <label>Current Image:</label>
                <img 
                  src={editingImage.image} 
                  alt={editingImage.title}
                  className="current-image"
                />
              </div>

              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    title: e.target.value
                  })}
                  placeholder="Enter image title..."
                  required
                  maxLength="200"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    description: e.target.value
                  })}
                  placeholder="Enter image description (optional)..."
                  rows="3"
                  maxLength="500"
                />
              </div>

              <div className="form-group">
                <label>Replace Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, true)}
                />
                <small>Leave empty to keep current image. Max 5MB.</small>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={closeEditModal} 
                  className="btn-cancel"
                  disabled={uploadLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-upload-submit"
                  disabled={uploadLoading}
                >
                  {uploadLoading ? 'Updating...' : 'Update Image'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryManagement;
