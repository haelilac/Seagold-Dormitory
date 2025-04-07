import React, { useState, useEffect } from 'react';
import './GalleryAdmin.css';
import { getAuthToken } from "../../utils/auth";

const AdminGallery = () => {
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newImage, setNewImage] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [editMode, setEditMode] = useState(null); // Holds the ID of the image being edited
  const [activeCategory, setActiveCategory] = useState('ALL');

  useEffect(() => {
    fetchImages();
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    const predefinedCategories = [
      'ROOMS',
      'HALLWAY',
      'CANTEEN',
      "MEN'S BATHROOM",
      "WOMEN'S BATHROOM",
    ];
    setCategories(predefinedCategories);
  };
  const fetchImages = async () => {
    try {
      const response = await fetch('https://seagold-laravel-production.up.railway.app/api/gallery', {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      const data = await response.json();
      setImages(data.images || []);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };
  
  const handleImageUpload = async () => {
    const formData = new FormData();
    formData.append('image', newImage);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
  
    try {
      const response = await fetch('https://seagold-laravel-production.up.railway.app/api/gallery/upload', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      if (response.ok) {
        alert('Image uploaded successfully!');
        fetchImages();
        resetForm();
      } else {
        alert('Failed to upload image.');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };
  
  const handleImageDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
  
    try {
      const response = await fetch(`https://seagold-laravel-production.up.railway.app/api/gallery/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      if (response.ok) {
        alert('Image deleted successfully!');
        fetchImages();
      } else {
        const error = await response.json();
        alert(`Failed to delete image: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };
  
const handleImageEdit = async (id) => {
  if (!category) {
    alert('Please select a category.');
    return;
  }

  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description);
  formData.append('category', category);

  try {
    const response = await fetch(`https://seagold-laravel-production.up.railway.app/api/gallery/${id}`, {
      method: 'POST', // Change to 'PUT' if Laravel route is defined as PUT
      body: formData,
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    if (response.ok) {
      alert('Image updated successfully!');
      fetchImages();
      setEditMode(null);
      resetForm();
    } else {
      alert('Failed to update image.');
    }
  } catch (error) {
    console.error('Error updating image:', error);
  }
};

  
  const resetForm = () => {
    setNewImage(null);
    setTitle('');
    setDescription('');
    setCategory('');
    setEditMode(null);
  };

  return (
    <div className="admin-gallery">
      <h2>Manage Gallery</h2>

      {/* Image Upload Form */}
      <form
        className="upload-form"
        onSubmit={(e) => {
            e.preventDefault();
            if (editMode) {
            handleImageEdit(editMode);
            } else {
            handleImageUpload();
            }
        }}
        >

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter image title"
            />
          </div>
        <div className="form-group">
          <label htmlFor="image">Select Image</label>
          <input type="file" id="image" onChange={(e) => setNewImage(e.target.files[0])} required={!editMode} />
        </div>
        </div>

        <div className="form-row">
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} required>
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter image description"
          ></textarea>
        </div>
        </div>

      {/* Image Gallery */}
      <div className="gallery-grid">
      {images
        .filter((img) => activeCategory === 'ALL' || img.category === activeCategory)
        .map((img) => (

          <div key={img.id} className="gallery-card">
            <img src={img.image_url} alt={img.title} />
            <div className="gallery-info">
              <h4>{img.title}</h4>
              <p>{img.description}</p>
              <p>Category: {img.category}</p>
            </div>
            <div className="gallery-actions">
              <button className="edit-action" onClick={() => {
                setEditMode(img.id);
                setTitle(img.title);
                setDescription(img.description);
                setCategory(img.category);
              }}>
                Edit
              </button>
              <button className="delete-action" onClick={() => handleImageDelete(img.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <button className= "upload-action"type="submit">{editMode ? 'Update Image' : 'Upload Image'}</button>
      </form>
      <div className="category-filter">
        <button
          onClick={() => setActiveCategory('ALL')}
          className={activeCategory === 'ALL' ? 'active-category' : ''}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={activeCategory === cat ? 'active-category' : ''}
          >
            {cat}
          </button>
        ))}
      </div>
      
    </div>
  );
};

export default AdminGallery;