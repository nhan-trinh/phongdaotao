import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';

const RegulationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'General',
    description: '',
    content: '',
    effective_date: '',
    expiry_date: '',
    is_active: true,
    file_reference: ''
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchRegulation();
    } else {
      // Set default effective date to today
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        effective_date: today
      }));
    }
  }, [id]);

  const fetchRegulation = async () => {
    try {
      const response = await api.get(`/regulations/read.php?id=${id}`);
      
      if (response.data) {
        setFormData({
          title: response.data.title,
          category: response.data.category || 'General',
          description: response.data.description || '',
          content: response.data.content || '',
          effective_date: response.data.effective_date ? formatDateForInput(response.data.effective_date) : '',
          expiry_date: response.data.expiry_date ? formatDateForInput(response.data.expiry_date) : '',
          is_active: response.data.is_active === '1' || response.data.is_active === true,
          file_reference: response.data.file_reference || ''
        });
      } else {
        setError('Regulation not found');
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load regulation. Please try again later.');
      setLoading(false);
      console.error('Error fetching regulation:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Validation
      if (!formData.title.trim() || !formData.category || !formData.description.trim()) {
        setError('Title, category, and description are required');
        setSaving(false);
        return;
      }
      
      if (isEditMode) {
        await api.post('/regulations/update.php', {
          regulation_id: id,
          ...formData,
          is_active: formData.is_active ? 1 : 0
        });
      } else {
        await api.post('/regulations/create.php', {
          ...formData,
          is_active: formData.is_active ? 1 : 0
        });
      }
      
      navigate('/regulations');
    } catch (err) {
      setError(`Failed to ${isEditMode ? 'update' : 'create'} regulation. Please try again later.`);
      setSaving(false);
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} regulation:`, err);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading regulation data...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <i className="fas fa-gavel me-2"></i>
                {isEditMode ? 'Edit Regulation' : 'Add New Regulation'}
              </h4>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Academic Integrity Policy"
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="category" className="form-label">Category *</label>
                  <select
                    className="form-select"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="General">General</option>
                    <option value="Grading">Grading</option>
                    <option value="Attendance">Attendance</option>
                    <option value="Examination">Examination</option>
                    <option value="Registration">Registration</option>
                    <option value="Graduation">Graduation</option>
                    <option value="Academic Conduct">Academic Conduct</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description *</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    required
                    placeholder="Brief description of the regulation..."
                  ></textarea>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="content" className="form-label">Content</label>
                  <textarea
                    className="form-control"
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows="10"
                    placeholder="Full content of the regulation..."
                  ></textarea>
                  <div className="form-text">
                    You can use basic formatting: Bold text with **bold**, italic with *italic*.
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="effective_date" className="form-label">Effective Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      id="effective_date"
                      name="effective_date"
                      value={formData.effective_date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label htmlFor="expiry_date" className="form-label">Expiry Date</label>
                    <input
                      type="date"
                      className="form-control"
                      id="expiry_date"
                      name="expiry_date"
                      value={formData.expiry_date}
                      onChange={handleChange}
                    />
                    <div className="form-text">
                      Leave empty if the regulation doesn't expire
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="file_reference" className="form-label">File Reference</label>
                  <input
                    type="text"
                    className="form-control"
                    id="file_reference"
                    name="file_reference"
                    value={formData.file_reference}
                    onChange={handleChange}
                    placeholder="e.g., /documents/policies/academic_integrity.pdf"
                  />
                  <div className="form-text">
                    Link to official document if available
                  </div>
                </div>
                
                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="is_active"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="is_active">Active Regulation</label>
                  <div className="form-text">
                    Inactive regulations won't be visible to users
                  </div>
                </div>
                
                <div className="d-flex justify-content-end gap-2 mt-4">
                  <Link to="/regulations" className="btn btn-outline-secondary">
                    Cancel
                  </Link>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {isEditMode ? 'Updating...' : 'Create Regulation'}
                      </>
                    ) : (
                      isEditMode ? 'Update Regulation' : 'Create Regulation'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to format date for input field
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

export default RegulationForm;
