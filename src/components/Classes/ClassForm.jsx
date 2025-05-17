import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';

const ClassForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    class_name: '',
    course_id: '',
    semester: '',
    academic_year: '',
    start_date: '',
    end_date: '',
    schedule_info: '',
    location: '',
    max_students: 30,
    status: 'Upcoming',
    notes: ''
  });
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCourses();
    
    if (isEditMode) {
      fetchClass();
    } else {
      // Set default academic year to current year
      const currentYear = new Date().getFullYear();
      setFormData(prev => ({
        ...prev,
        academic_year: currentYear.toString()
      }));
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

  const fetchClass = async () => {
    try {
      const response = await api.get(`/classes/read.php?id=${id}`);
      
      if (response.data) {
        setFormData({
          class_name: response.data.class_name,
          course_id: response.data.course_id || '',
          semester: response.data.semester || '',
          academic_year: response.data.academic_year || '',
          start_date: response.data.start_date ? formatDateForInput(response.data.start_date) : '',
          end_date: response.data.end_date ? formatDateForInput(response.data.end_date) : '',
          schedule_info: response.data.schedule_info || '',
          location: response.data.location || '',
          max_students: response.data.max_students || 30,
          status: response.data.status || 'Upcoming',
          notes: response.data.notes || ''
        });
      } else {
        setError('Class not found');
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load class. Please try again later.');
      setLoading(false);
      console.error('Error fetching class:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'number' ? parseInt(value, 10) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Validation
      if (!formData.class_name.trim() || !formData.semester.trim() || !formData.academic_year.trim()) {
        setError('Class name, semester, and academic year are required');
        setSaving(false);
        return;
      }
      
      if (isEditMode) {
        await api.post('/classes/update.php', {
          class_id: id,
          ...formData
        });
      } else {
        await api.post('/classes/create.php', formData);
      }
      
      navigate('/classes');
    } catch (err) {
      setError(`Failed to ${isEditMode ? 'update' : 'create'} class. Please try again later.`);
      setSaving(false);
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} class:`, err);
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
                <i className="fas fa-chalkboard me-2"></i>
                {isEditMode ? 'Edit Class' : 'Add New Class'}
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
                  <label htmlFor="class_name" className="form-label">Class Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="class_name"
                    name="class_name"
                    value={formData.class_name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., CS101-A, Introduction to Programming - Section 1"
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="course_id" className="form-label">Course</label>
                  <select
                    className="form-select"
                    id="course_id"
                    name="course_id"
                    value={formData.course_id}
                    onChange={handleChange}
                  >
                    <option value="">Select a course</option>
                    {courses.map(course => (
                      <option key={course.course_id} value={course.course_id}>
                        {course.course_code} - {course.course_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="semester" className="form-label">Semester *</label>
                    <select
                      className="form-select"
                      id="semester"
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a semester</option>
                      <option value="Spring">Spring</option>
                      <option value="Summer">Summer</option>
                      <option value="Fall">Fall</option>
                      <option value="Winter">Winter</option>
                    </select>
                  </div>
                  
                  <div className="col-md-6">
                    <label htmlFor="academic_year" className="form-label">Academic Year *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="academic_year"
                      name="academic_year"
                      value={formData.academic_year}
                      onChange={handleChange}
                      required
                      placeholder="e.g., 2023"
                    />
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="start_date" className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      id="start_date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label htmlFor="end_date" className="form-label">End Date</label>
                    <input
                      type="date"
                      className="form-control"
                      id="end_date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="schedule_info" className="form-label">Schedule Information</label>
                  <input
                    type="text"
                    className="form-control"
                    id="schedule_info"
                    name="schedule_info"
                    value={formData.schedule_info}
                    onChange={handleChange}
                    placeholder="e.g., Mon/Wed/Fri 10:00 AM - 11:30 AM"
                  />
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="location" className="form-label">Location</label>
                    <input
                      type="text"
                      className="form-control"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g., Building A, Room 101"
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label htmlFor="max_students" className="form-label">Maximum Students</label>
                    <input
                      type="number"
                      className="form-control"
                      id="max_students"
                      name="max_students"
                      value={formData.max_students}
                      onChange={handleChange}
                      min="1"
                      max="500"
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="status" className="form-label">Status</label>
                  <select
                    className="form-select"
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="notes" className="form-label">Notes</label>
                  <textarea
                    className="form-control"
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Additional notes about this class..."
                  ></textarea>
                </div>
                
                <div className="d-flex justify-content-end gap-2 mt-4">
                  <Link to="/classes" className="btn btn-outline-secondary">
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
                      isEditMode ? 'Update Class' : 'Create Class'
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

export default ClassForm;
