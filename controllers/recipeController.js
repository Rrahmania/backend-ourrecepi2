import React, { useState } from 'react';
import './ResepiForm.css';
import { useAuth } from '../context/AuthContext';

const RecipeForm = () => { 
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: [''],
    steps: [''],
    categories: [],
    image: null
  });
  
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Daftar kategori yang tersedia
  const availableCategories = [
    'Ayam', 'Daging', 'Sayur', 'Aneka Minuman', 'Makanan Ringan', 'Mie',
    'Aneka Nasi', 'Pudding & Dessert', 'Hidangan Laut', 'Makanan Sehat', 'Salad'
  ];

  // --- HANDLER LOGIC ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (category) => {
    setFormData(prev => {
      const currentCategories = prev.categories;
      const isSelected = currentCategories.includes(category);
      if (isSelected) {
        return { ...prev, categories: currentCategories.filter(cat => cat !== category) };
      } else if (currentCategories.length < 3) {
        return { ...prev, categories: [...currentCategories, category] };
      }
      return prev;
    });
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const handleStepChange = (index, value) => {
    const newSteps = [...formData.steps];
    newSteps[index] = value;
    setFormData(prev => ({ ...prev, steps: newSteps }));
  };

  const addIngredient = () => setFormData(prev => ({ ...prev, ingredients: [...prev.ingredients, ''] }));
  const addStep = () => setFormData(prev => ({ ...prev, steps: [...prev.steps, ''] }));

  const removeIngredient = (index) => {
    if (formData.ingredients.length > 1) {
      const newIngredients = formData.ingredients.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, ingredients: newIngredients }));
    }
  };

  const removeStep = (index) => {
    if (formData.steps.length > 1) {
      const newSteps = formData.steps.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, steps: newSteps }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Fungsi konversi File ke Base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (formData.categories.length === 0) {
      alert('Pilih minimal 1 kategori!');
      setLoading(false);
      return;
    }

    if (!token) {
      alert('Anda harus login untuk menambah resep!');
      setLoading(false);
      return;
    }
    
    try {
      // 2. Persiapkan data resep (match backend field names)
      const newRecipe = {
        title: formData.title,
        category: formData.categories[0] || 'Umum', // Backend expects single category, use first one
        image: '', // TODO: Implement image upload separately
        description: formData.description,
        ingredients: formData.ingredients.filter(ing => ing.trim() !== ''),
        instructions: formData.steps.filter(step => step.trim() !== '').join('\n') // Join steps into text
      };

      // 3. Kirim ke backend API
      const API_URL = import.meta.env.VITE_API_URL || 'https://backend-ourrecepi2.onrender.com/api';
      const response = await fetch(`${API_URL}/recipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newRecipe)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Gagal menyimpan resep (${response.status})`);
      }

      const savedRecipe = await response.json();

      // 4. Reset form
      setFormData({
        title: '', description: '', ingredients: [''], steps: [''], categories: [], image: null
      });
      setImagePreview(null);

      // 5. Alert & redirect
      alert('Resep berhasil ditambahkan!');
      window.location.href = `/resep/${savedRecipe.id}`;
      
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert(`Terjadi kesalahan: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recipe-form-container">
      <h2>Tambah Resep Baru</h2>
      <form onSubmit={handleSubmit} className="recipe-form">
        
        {/* 1. Judul Resep */}
        <div className="form-group">
          <label htmlFor="title">Judul Resep *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            placeholder="Masukkan judul resep..."
          />
        </div>

        {/* 2. Deskripsi Resep */}
        <div className="form-group">
          <label htmlFor="description">Deskripsi Resep *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows="4"
            placeholder="Deskripsikan resep Anda..."
          />
        </div>

        {/* 3. Kategori */}
        <div className="form-group">
          <label>Kategori * (Maksimal 3)</label>
          <div className="categories-container">
            <div className="categories-grid">
              {availableCategories.map(category => (
                <label key={category} className="category-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.categories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                    disabled={formData.categories.length >= 3 && !formData.categories.includes(category)}
                  />
                  <span className="checkbox-custom"></span>
                  {category}
                </label>
              ))}
            </div>
            <div className="categories-selected">
              <strong>Kategori terpilih: </strong>
              {formData.categories.length > 0 ? (
                formData.categories.join(', ')
              ) : (
                <span className="no-category">Belum memilih kategori</span>
              )}
              <span className="categories-count">
                ({formData.categories.length}/3)
              </span>
            </div>
          </div>
        </div>

        {/* 4. Bahan-bahan */}
        <div className="form-group">
          <label>Bahan-bahan *</label>
          {formData.ingredients.map((ingredient, index) => (
            <div key={index} className="dynamic-field">
              <input
                type="text"
                value={ingredient}
                onChange={(e) => handleIngredientChange(index, e.target.value)}
                placeholder={`Bahan ${index + 1}...`}
                required={index === 0}
              />
              {formData.ingredients.length > 1 && (
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removeIngredient(index)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button type="button" className="add-btn" onClick={addIngredient}>
            + Tambah Bahan
          </button>
        </div>

        {/* 5. Langkah-langkah */}
        <div className="form-group">
          <label>Langkah-langkah *</label>
          {formData.steps.map((step, index) => (
            <div key={index} className="dynamic-field">
              <textarea
                value={step}
                onChange={(e) => handleStepChange(index, e.target.value)}
                placeholder={`Langkah ${index + 1}...`}
                rows="3"
                required={index === 0}
              />
              {formData.steps.length > 1 && (
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removeStep(index)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button type="button" className="add-btn" onClick={addStep}>
            + Tambah Langkah
          </button>
        </div>

        {/* 6. Upload Foto */}
        <div className="form-group">
          <label>Foto Makanan</label>
          <div className="image-upload-section">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
            /> 
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={() => {
                    setImagePreview(null);
                    setFormData(prev => ({ ...prev, image: null }));
                  }}
                >
                  Hapus Foto
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 7. Submit Button */}
        <button type="submit" className="submit-btn" disabled={loading}> 
          {loading ? 'Menyimpan...' : 'Simpan Resep'}
        </button>
        {loading && <p>Mohon tunggu, resep sedang diunggah...</p>} 
      </form>
    </div>
  );
}; 

export default RecipeForm;
