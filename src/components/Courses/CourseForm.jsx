import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { api } from '../../services/api';

const CourseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = !!id;

  // Receive refreshCourses function from location state
  const refreshCourses = location.state?.refreshCourses;

  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    course_description: '',
    credits: '',
    prerequisites: '',
    department: '',
    is_active: true
  });

  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchCourse();
    }
  }, [id]);

  const fetchCourse = async () => {
    try {
      const response = await api.get(`/courses/read.php?id=${id}`);

      if (response.data) {
        setFormData({
          course_code: response.data.course_code,
          course_name: response.data.course_name,
          course_description: response.data.description || '',
          credits: response.data.credits,
          prerequisites: response.data.prerequisites || '',
          department: response.data.department || '',
          is_active: response.data.is_active === '1' || response.data.is_active === true
        });
      } else {
        setError('Course not found');
      }

      setLoading(false);
    } catch (err) {
      setError('Failed to load course. Please try again later.');
      setLoading(false);
      console.error('Error fetching course:', err);
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

      if (!formData.course_code.trim() || !formData.course_name.trim() || !formData.credits) {
        setError('Course code, name, and credits are required');
        setSaving(false);
        return;
      }

      const payload = {
        ...formData,
        credits: parseInt(formData.credits),
        is_active: formData.is_active ? 1 : 0
      };

      if (isEditMode) {
        await api.post('/courses/update.php', {
          course_id: id,
          ...payload
        });
      } else {
        await api.post('/courses/create.php', payload);
      }

      // Call refreshCourses if it exists
      if (refreshCourses) {
        refreshCourses();
      }

      navigate('/courses');
    } catch (err) {
      setError(`Failed to ${isEditMode ? 'update' : 'create'} course. Please try again later.`);
      setSaving(false);
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} course:`, err);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading course data...</p>
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
                <i className="fas fa-book me-2"></i>
                {isEditMode ? 'Edit Course' : 'Add New Course'}
              </h4>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="course_code" className="form-label">Course Code *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="course_code"
                      name="course_code"
                      value={formData.course_code}
                      onChange={handleChange}
                      required
                      placeholder="e.g., CS101"
                    />
                    <div className="form-text">A unique code for the course</div>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="credits" className="form-label">Credits *</label>
                    <input
                      type="number"
                      className="form-control"
                      id="credits"
                      name="credits"
                      value={formData.credits}
                      onChange={handleChange}
                      required
                      min="0"
                      max="20"
                      placeholder="e.g., 3"
                    />
                    <div className="form-text">Number of credit hours</div>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="course_name" className="form-label">Course Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="course_name"
                    name="course_name"
                    value={formData.course_name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Introduction to Computer Science"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="course_description" className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    id="course_description"
                    name="course_description"
                    value={formData.course_description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Course description..."
                  ></textarea>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="prerequisites" className="form-label">Prerequisites</label>
                    <input
                      type="text"
                      className="form-control"
                      id="prerequisites"
                      name="prerequisites"
                      value={formData.prerequisites}
                      onChange={handleChange}
                      placeholder="e.g., MATH101, CS100"
                    />
                    <div className="form-text">Comma-separated list of prerequisite courses</div>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="department" className="form-label">Department</label>
                    <input
                      type="text"
                      className="form-control"
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g., Computer Science"
                    />
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
                  <label className="form-check-label" htmlFor="is_active">Active Course</label>
                  <div className="form-text">Inactive courses won't be available for registration</div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <Link to="/courses" className="btn btn-outline-secondary">
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
                      isEditMode ? 'Update Course' : 'Create Course'
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

export default CourseForm;