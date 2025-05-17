import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';

const NotificationForm = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    target_group: 'Students',
    send_immediately: true,
    send_date: '',
    send_time: '',
    priority: 'normal',
    attachment_url: ''
  });
  
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [targetOptions, setTargetOptions] = useState([
    { value: 'Students', label: 'All Students' },
    { value: 'Teachers', label: 'All Teachers' },
    { value: 'Staff', label: 'Administrative Staff' },
    { value: 'Course_CS101', label: 'CS101 - Introduction to Computer Science' },
    { value: 'Course_MATH201', label: 'MATH201 - Calculus II' },
    { value: 'Class_CS101-A', label: 'CS101-A (Spring 2023)' },
    { value: 'Class_MATH201-B', label: 'MATH201-B (Spring 2023)' }
  ]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Notification title is required');
      return false;
    }
    
    if (!formData.message.trim()) {
      setError('Notification message is required');
      return false;
    }
    
    if (!formData.target_group) {
      setError('Please select a target group');
      return false;
    }
    
    if (!formData.send_immediately) {
      if (!formData.send_date) {
        setError('Please select a send date or choose to send immediately');
        return false;
      }
      
      if (!formData.send_time) {
        setError('Please select a send time or choose to send immediately');
        return false;
      }
      
      // Check if scheduled date is in the past
      const scheduledDateTime = new Date(`${formData.send_date}T${formData.send_time}`);
      if (scheduledDateTime < new Date()) {
        setError('Scheduled date and time cannot be in the past');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      
      // Prepare data for API
      const notificationData = {
        ...formData,
        status: formData.send_immediately ? 'Sent' : 'Scheduled',
        created_at: new Date().toISOString(),
        send_date: formData.send_immediately ? 
          new Date().toISOString() : 
          new Date(`${formData.send_date}T${formData.send_time}`).toISOString()
      };
      
      const response = await api.post('/notifications/create.php', notificationData);
      
      if (response.data.message === 'Notification was created.') {
        navigate('/notifications');
      } else {
        setError('Failed to send notification. Please try again.');
        setSaving(false);
      }
    } catch (err) {
      setError('Failed to send notification. Please try again later.');
      setSaving(false);
      console.error('Error sending notification:', err);
    }
  };

  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  // Set default send date and time to now + 1 hour
  const setDefaultDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    
    const dateString = now.toISOString().split('T')[0];
    const timeString = now.toTimeString().slice(0, 5);
    
    setFormData(prev => ({
      ...prev,
      send_date: dateString,
      send_time: timeString
    }));
  };

  // Set default date/time when changing from immediate to scheduled
  React.useEffect(() => {
    if (!formData.send_immediately && !formData.send_date) {
      setDefaultDateTime();
    }
  }, [formData.send_immediately]);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="fas fa-paper-plane me-2"></i>
          Send Notification
        </h2>
        <div>
          <button 
            className="btn btn-outline-primary me-2" 
            onClick={togglePreview}
          >
            {previewMode ? (
              <>
                <i className="fas fa-edit me-2"></i>
                Edit
              </>
            ) : (
              <>
                <i className="fas fa-eye me-2"></i>
                Preview
              </>
            )}
          </button>
          <Link to="/notifications" className="btn btn-outline-secondary">
            <i className="fas fa-arrow-left me-2"></i>
            Back to List
          </Link>
        </div>
      </div>
      
      <div className="row">
        <div className="col-lg-8">
          {!previewMode ? (
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h4 className="mb-0">Notification Details</h4>
              </div>
              <div className="card-body">
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">Notification Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter a clear and concise title"
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="target_group" className="form-label">Target Recipients *</label>
                    <select
                      className="form-select"
                      id="target_group"
                      name="target_group"
                      value={formData.target_group}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select target group</option>
                      {targetOptions.map((option, index) => (
                        <option key={index} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="form-text">
                      Select who should receive this notification
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="message" className="form-label">Notification Message *</label>
                    <textarea
                      className="form-control"
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="6"
                      placeholder="Enter the message content..."
                      required
                    ></textarea>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="priority" className="form-label">Priority</label>
                    <select
                      className="form-select"
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="attachment_url" className="form-label">Attachment URL (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      id="attachment_url"
                      name="attachment_url"
                      value={formData.attachment_url}
                      onChange={handleChange}
                      placeholder="e.g., http://example.com/document.pdf"
                    />
                    <div className="form-text">
                      Enter a URL to an external document or resource (if applicable)
                    </div>
                  </div>
                  
                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="send_immediately"
                      name="send_immediately"
                      checked={formData.send_immediately}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="send_immediately">
                      Send Immediately
                    </label>
                  </div>
                  
                  {!formData.send_immediately && (
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="send_date" className="form-label">Schedule Date *</label>
                        <input
                          type="date"
                          className="form-control"
                          id="send_date"
                          name="send_date"
                          value={formData.send_date}
                          onChange={handleChange}
                          min={new Date().toISOString().split('T')[0]}
                          required={!formData.send_immediately}
                        />
                      </div>
                      
                      <div className="col-md-6">
                        <label htmlFor="send_time" className="form-label">Schedule Time *</label>
                        <input
                          type="time"
                          className="form-control"
                          id="send_time"
                          name="send_time"
                          value={formData.send_time}
                          onChange={handleChange}
                          required={!formData.send_immediately}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <Link to="/notifications" className="btn btn-outline-secondary">
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
                          Sending...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane me-2"></i>
                          {formData.send_immediately ? 'Send Notification' : 'Schedule Notification'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-header bg-info text-white">
                <h4 className="mb-0">Notification Preview</h4>
              </div>
              <div className="card-body">
                <div className="notification-preview">
                  <div className="mb-4 text-center">
                    <span className={`badge bg-${getPriorityBadge(formData.priority)}`}>
                      {formData.priority.toUpperCase()} PRIORITY
                    </span>
                  </div>
                  
                  <h3 className="notification-title mb-3">{formData.title || 'Notification Title'}</h3>
                  
                  <div className="notification-meta mb-3">
                    <small className="text-muted">
                      <strong>To:</strong> {getTargetLabel(formData.target_group, targetOptions)}
                    </small>
                    <br />
                    <small className="text-muted">
                      <strong>When:</strong> {formData.send_immediately 
                        ? 'Immediately'
                        : `${formatDateForDisplay(formData.send_date)} at ${formatTimeForDisplay(formData.send_time)}`
                      }
                    </small>
                  </div>
                  
                  <div className="notification-body p-3 mb-3 bg-light rounded">
                    {formData.message 
                      ? formData.message.split('\n').map((line, i) => (
                          <p key={i} className={i === 0 ? 'mb-2' : i === formData.message.split('\n').length - 1 ? 'mb-0' : 'mb-2'}>
                            {line}
                          </p>
                        ))
                      : 'Notification message will appear here...'
                    }
                  </div>
                  
                  {formData.attachment_url && (
                    <div className="notification-attachment">
                      <div className="d-flex align-items-center p-2 bg-light rounded">
                        <i className="fas fa-paperclip me-2"></i>
                        <a href={formData.attachment_url} target="_blank" rel="noopener noreferrer">
                          {getAttachmentFileName(formData.attachment_url)}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button 
                    className="btn btn-outline-secondary" 
                    onClick={togglePreview}
                  >
                    <i className="fas fa-edit me-2"></i>
                    Edit
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleSubmit}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane me-2"></i>
                        {formData.send_immediately ? 'Send Notification' : 'Schedule Notification'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="card-title mb-0">Tips for Effective Notifications</h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  <i className="fas fa-check-circle text-success me-2"></i>
                  Keep titles clear and concise
                </li>
                <li className="list-group-item">
                  <i className="fas fa-check-circle text-success me-2"></i>
                  Be specific about actions needed
                </li>
                <li className="list-group-item">
                  <i className="fas fa-check-circle text-success me-2"></i>
                  Include relevant dates/deadlines
                </li>
                <li className="list-group-item">
                  <i className="fas fa-check-circle text-success me-2"></i>
                  Only use "Urgent" for time-sensitive matters
                </li>
                <li className="list-group-item">
                  <i className="fas fa-check-circle text-success me-2"></i>
                  Target specific groups when possible
                </li>
              </ul>
            </div>
          </div>
          
          <div className="card mt-4">
            <div className="card-header bg-light">
              <h5 className="card-title mb-0">Recently Sent Notifications</h5>
            </div>
            <div className="card-body p-0">
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  <strong>Registration Deadline Reminder</strong>
                  <p className="mb-0 text-muted small">Sent to All Students, yesterday</p>
                </li>
                <li className="list-group-item">
                  <strong>Faculty Meeting Update</strong>
                  <p className="mb-0 text-muted small">Sent to All Teachers, 2 days ago</p>
                </li>
                <li className="list-group-item">
                  <strong>CS101 Midterm Exam Details</strong>
                  <p className="mb-0 text-muted small">Sent to CS101-A (Spring 2023), 4 days ago</p>
                </li>
              </ul>
              <div className="card-footer text-center">
                <Link to="/notifications" className="text-decoration-none">
                  View All Notifications
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const getPriorityBadge = (priority) => {
  switch (priority) {
    case 'low':
      return 'secondary';
    case 'normal':
      return 'primary';
    case 'high':
      return 'warning';
    case 'urgent':
      return 'danger';
    default:
      return 'primary';
  }
};

const getTargetLabel = (value, options) => {
  const option = options.find(opt => opt.value === value);
  return option ? option.label : value;
};

const formatDateForDisplay = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatTimeForDisplay = (timeString) => {
  if (!timeString) return '';
  
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit'
  });
};

const getAttachmentFileName = (url) => {
  if (!url) return '';
  
  // Extract filename from URL
  const parts = url.split('/');
  return parts[parts.length - 1];
};

export default NotificationForm;
