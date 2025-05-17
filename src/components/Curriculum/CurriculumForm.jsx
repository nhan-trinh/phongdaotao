import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';

const CurriculumForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'lesson',
    course_id: '',
    content: '',
    file_path: '',
    is_active: true
  });
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCourses();
    
    if (isEditMode) {
      fetchCurriculumItem();
    }
  }, [id]);

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const response = await api.get('/courses/read.php');
      
      if (response.data.records) {
        setCourses(response.data.records);
      } else {
        setCourses([]);
      }
      
      setLoadingCourses(false);
    } catch (err) {
      setError('Failed to load courses. Please try again later.');
      setLoadingCourses(false);
      console.error('Error fetching courses:', err);
    }
  };

  const fetchCurriculumItem = async () => {
    try {
      const response = await api.get(`/curriculum/read.php?id=${id}`);
      
      if (response.data) {
        setFormData({
          title: response.data.title,
          description: response.data.description || '',
          type: response.data.type || 'lesson',
          course_id: response.data.course_id || '',
          content: response.data.content || '',
          file_path: response.data.file_path || '',
          is_active: response.data.is_active === '1' || response.data.is_active === true
        });
      } else {
        setError('Curriculum item not found');
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load curriculum item. Please try again later.');
      setLoading(false);
      console.error('Error fetching curriculum item:', err);
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
      if (!formData.title.trim() || !formData.type) {
        setError('Title and type are required');
        setSaving(false);
        return;
      }
      
      if (isEditMode) {
        await api.post('/curriculum/update.php', {
          curriculum_id: id,
          ...formData,
          is_active: formData.is_active ? 1 : 0
        });
      } else {
        await api.post('/curriculum/create.php', {
          ...formData,
          is_active: formData.is_active ? 1 : 0
        });
      }
      
      navigate('/curriculum');
    } catch (err) {
      setError(`Failed to ${isEditMode ? 'update' : 'create'} curriculum item. Please try again later.`);
      setSaving(false);
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} curriculum item:`, err);
    }
  };
  
  if (loading || loadingCourses) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading data...</p>
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
                <i className="fas fa-list-alt me-2"></i>
                {isEditMode ? 'Edit Curriculum Item' : 'Add Curriculum Item'}
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
                    placeholder="Enter title"
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="type" className="form-label">Type *</label>
                  <select
                    className="form-select"
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="framework">Curriculum Framework</option>
                    <option value="lesson">Lesson</option>
                    <option value="resource">Learning Resource</option>
                    <option value="material">Course Material</option>
                    <option value="equipment">Course Equipment</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="course_id" className="form-label">Associated Course</label>
                  <select
                    className="form-select"
                    id="course_id"
                    name="course_id"
                    value={formData.course_id}
                    onChange={handleChange}
                  >
                    <option value="">Select a course (optional)</option>
                    {courses.map(course => (
                      <option key={course.course_id} value={course.course_id}>
                        {course.course_code} - {course.course_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Description..."
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
                    rows="5"
                    placeholder="Content or details..."
                  ></textarea>
                  <div className="form-text">
                    For frameworks, this could be guidelines. For lessons, this could be an outline.
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="file_path" className="form-label">File Reference</label>
                  <input
                    type="text"
                    className="form-control"
                    id="file_path"
                    name="file_path"
                    value={formData.file_path}
                    onChange={handleChange}
                    placeholder="e.g., /resources/lesson1.pdf"
                  />
                  <div className="form-text">
                    Enter a reference to an existing file if applicable
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
                  <label className="form-check-label" htmlFor="is_active">Active</label>
                  <div className="form-text">Inactive items won't be visible to users</div>
                </div>
                
                <div className="d-flex justify-content-end gap-2 mt-4">
                  <Link to="/curriculum" className="btn btn-outline-secondary">
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
                        {isEditMode ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      isEditMode ? 'Update Item' : 'Create Item'
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

export default CurriculumForm;
