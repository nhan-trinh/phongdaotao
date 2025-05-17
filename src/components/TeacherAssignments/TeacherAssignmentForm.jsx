import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';

const TeacherAssignmentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    teacher_id: '',
    class_id: '',
    assignment_type: 'Primary',
    start_date: '',
    end_date: '',
    hours_per_week: '',
    notes: ''
  });
  
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTeachersAndClasses();
    
    if (isEditMode) {
      fetchAssignment();
    }
  }, [id]);

  const fetchTeachersAndClasses = async () => {
    try {
      setLoadingData(true);
      
      // In a real application, there would be separate endpoints for teachers
      // For this example, we'll simulate it
      // Fetch teachers (placeholder)
      const teachersResponse = {
        data: {
          records: [
            { teacher_id: '1', name: 'John Smith', department: 'Computer Science' },
            { teacher_id: '2', name: 'Mary Johnson', department: 'Mathematics' },
            { teacher_id: '3', name: 'David Lee', department: 'Physics' },
            { teacher_id: '4', name: 'Sarah Williams', department: 'English' },
            { teacher_id: '5', name: 'Robert Brown', department: 'History' }
          ]
        }
      };
      
      const classesResponse = await api.get('/classes/read.php');
      
      setTeachers(teachersResponse.data.records);
      
      if (classesResponse.data.records) {
        setClasses(classesResponse.data.records);
      } else {
        setClasses([]);
      }
      
      setLoadingData(false);
    } catch (err) {
      setError('Failed to load required data. Please try again later.');
      setLoadingData(false);
      console.error('Error fetching data:', err);
    }
  };

  const fetchAssignment = async () => {
    try {
      const response = await api.get(`/teacher-assignments/read.php?id=${id}`);
      
      if (response.data) {
        setFormData({
          teacher_id: response.data.teacher_id || '',
          class_id: response.data.class_id || '',
          assignment_type: response.data.assignment_type || 'Primary',
          start_date: response.data.start_date ? formatDateForInput(response.data.start_date) : '',
          end_date: response.data.end_date ? formatDateForInput(response.data.end_date) : '',
          hours_per_week: response.data.hours_per_week || '',
          notes: response.data.notes || ''
        });
      } else {
        setError('Teacher assignment not found');
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load teacher assignment. Please try again later.');
      setLoading(false);
      console.error('Error fetching teacher assignment:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Validation
      if (!formData.teacher_id || !formData.class_id || !formData.assignment_type) {
        setError('Teacher, class, and assignment type are required');
        setSaving(false);
        return;
      }
      
      if (isEditMode) {
        await api.post('/teacher-assignments/update.php', {
          assignment_id: id,
          ...formData
        });
      } else {
        await api.post('/teacher-assignments/create.php', formData);
      }
      
      navigate('/teacher-assignments');
    } catch (err) {
      setError(`Failed to ${isEditMode ? 'update' : 'create'} teacher assignment. Please try again later.`);
      setSaving(false);
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} teacher assignment:`, err);
    }
  };

  if (loading || loadingData) {
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
                <i className="fas fa-chalkboard-teacher me-2"></i>
                {isEditMode ? 'Edit Teacher Assignment' : 'Assign Teacher to Class'}
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
                  <label htmlFor="teacher_id" className="form-label">Teacher *</label>
                  <select
                    className="form-select"
                    id="teacher_id"
                    name="teacher_id"
                    value={formData.teacher_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a teacher</option>
                    {teachers.map(teacher => (
                      <option key={teacher.teacher_id} value={teacher.teacher_id}>
                        {teacher.name} - {teacher.department}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="class_id" className="form-label">Class *</label>
                  <select
                    className="form-select"
                    id="class_id"
                    name="class_id"
                    value={formData.class_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a class</option>
                    {classes.map(cls => (
                      <option key={cls.class_id} value={cls.class_id}>
                        {cls.class_name} ({cls.semester} {cls.academic_year})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="assignment_type" className="form-label">Assignment Type *</label>
                  <select
                    className="form-select"
                    id="assignment_type"
                    name="assignment_type"
                    value={formData.assignment_type}
                    onChange={handleChange}
                    required
                  >
                    <option value="Primary">Primary Instructor</option>
                    <option value="Substitute">Substitute Teacher</option>
                    <option value="Assistant">Teaching Assistant</option>
                    <option value="Guest Lecturer">Guest Lecturer</option>
                  </select>
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
                  <label htmlFor="hours_per_week" className="form-label">Hours per Week</label>
                  <input
                    type="number"
                    className="form-control"
                    id="hours_per_week"
                    name="hours_per_week"
                    value={formData.hours_per_week}
                    onChange={handleChange}
                    step="0.5"
                    min="0"
                    placeholder="e.g., 3.5"
                  />
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
                    placeholder="Additional notes about this assignment..."
                  ></textarea>
                </div>
                
                <div className="d-flex justify-content-end gap-2 mt-4">
                  <Link to="/teacher-assignments" className="btn btn-outline-secondary">
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
                        {isEditMode ? 'Updating...' : 'Create Assignment'}
                      </>
                    ) : (
                      isEditMode ? 'Update Assignment' : 'Create Assignment'
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

export default TeacherAssignmentForm;
