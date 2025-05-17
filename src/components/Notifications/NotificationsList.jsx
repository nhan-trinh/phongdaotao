import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

const NotificationsList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [targetFilter, setTargetFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications/read.php');
      
      if (response.data.records) {
        setNotifications(response.data.records);
      } else {
        setNotifications([]);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load notifications. Please try again later.');
      setLoading(false);
      console.error('Error fetching notifications:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        // In a real application, there would be a delete endpoint
        // For this example, we'll just remove it from the state
        setNotifications(notifications.filter(notification => notification.notification_id !== id));
      } catch (err) {
        setError('Failed to delete notification. Please try again later.');
        console.error('Error deleting notification:', err);
      }
    }
  };

  const handleSort = (field) => {
    const direction = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(direction);
  };

  // Get unique target groups for filter
  const targetGroups = ['all', ...new Set(notifications.map(notification => notification.target_group).filter(Boolean))].sort();

  // Filter notifications based on search term and target group
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTarget = targetFilter === 'all' || notification.target_group === targetFilter;
    
    return matchesSearch && matchesTarget;
  }).sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Handle dates for sorting
    if (sortField === 'created_at' || sortField === 'send_date') {
      aValue = new Date(aValue || '1970-01-01');
      bValue = new Date(bValue || '1970-01-01');
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredNotifications.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger mt-4" role="alert">
        <h4 className="alert-heading">Error!</h4>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="fas fa-bell me-2"></i>
          Notifications
        </h2>
        <Link to="/notifications/add" className="btn btn-primary">
          <i className="fas fa-paper-plane me-2"></i>
          Send New Notification
        </Link>
      </div>
      
      <div className="card mb-4">
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setSearchTerm('')}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={targetFilter}
                onChange={(e) => setTargetFilter(e.target.value)}
              >
                <option value="all">All Target Groups</option>
                {targetGroups.filter(g => g !== 'all').map((group, index) => (
                  <option key={index} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3 text-md-end">
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setSearchTerm('');
                  setTargetFilter('all');
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>
          
          {currentItems.length === 0 ? (
            <div className="alert alert-info">
              {(searchTerm || targetFilter !== 'all')
                ? "No notifications found matching your criteria."
                : "No notifications available. Click 'Send New Notification' to create one."}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th 
                      onClick={() => handleSort('title')} 
                      style={{ cursor: 'pointer' }}
                    >
                      Title {sortField === 'title' && (
                        <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th>Message</th>
                    <th>Target Group</th>
                    <th 
                      onClick={() => handleSort('created_at')} 
                      style={{ cursor: 'pointer' }}
                    >
                      Created At {sortField === 'created_at' && (
                        <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th 
                      onClick={() => handleSort('send_date')} 
                      style={{ cursor: 'pointer' }}
                    >
                      Send Date {sortField === 'send_date' && (
                        <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map(notification => (
                    <tr key={notification.notification_id}>
                      <td>{notification.title}</td>
                      <td>
                        {notification.message.length > 50
                          ? `${notification.message.substring(0, 50)}...`
                          : notification.message}
                      </td>
                      <td>
                        <span className={`badge bg-${getTargetBadge(notification.target_group)}`}>
                          {notification.target_group}
                        </span>
                      </td>
                      <td>{formatDate(notification.created_at)}</td>
                      <td>{formatDate(notification.send_date)}</td>
                      <td>
                        <span className={`badge bg-${getStatusBadge(notification.status)}`}>
                          {notification.status}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            title="View Notification"
                            onClick={() => {}} // Would open a modal in a full implementation
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(notification.notification_id)}
                            title="Delete Notification"
                            disabled={notification.status === 'Sent'}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <nav>
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                </li>
                
                {[...Array(totalPages).keys()].map(number => (
                  <li
                    key={number + 1}
                    className={`page-item ${currentPage === number + 1 ? 'active' : ''}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => paginate(number + 1)}
                    >
                      {number + 1}
                    </button>
                  </li>
                ))}
                
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getTargetBadge = (target) => {
  if (!target) return 'secondary';
  
  switch (target.toLowerCase()) {
    case 'students':
      return 'primary';
    case 'teachers':
      return 'info';
    case 'staff':
      return 'warning';
    case 'administrators':
      return 'danger';
    case 'all':
      return 'dark';
    default:
      return 'secondary';
  }
};

const getStatusBadge = (status) => {
  if (!status) return 'secondary';
  
  switch (status.toLowerCase()) {
    case 'sent':
      return 'success';
    case 'scheduled':
      return 'warning';
    case 'draft':
      return 'info';
    case 'failed':
      return 'danger';
    default:
      return 'secondary';
  }
};

export default NotificationsList;
