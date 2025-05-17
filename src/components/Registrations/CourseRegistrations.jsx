import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

const CourseRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [processing, setProcessing] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, [statusFilter]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/course-registrations/read.php?status=${statusFilter}`);
      
      if (response.data.records) {
        setRegistrations(response.data.records);
      } else {
        setRegistrations([]);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load course registrations. Please try again later.');
      setLoading(false);
      console.error('Error fetching course registrations:', err);
    }
  };

  const handleApprove = async (id) => {
    try {
      setProcessing(true);
      await api.post('/course-registrations/approve.php', {
        registration_id: id,
        status: 'approved'
      });
      
      setRegistrations(registrations.filter(reg => reg.registration_id !== id));
      setProcessing(false);
    } catch (err) {
      setError('Failed to approve registration. Please try again later.');
      setProcessing(false);
      console.error('Error approving registration:', err);
    }
  };

  const handleReject = async (id) => {
    try {
      setProcessing(true);
      await api.post('/course-registrations/approve.php', {
        registration_id: id,
        status: 'rejected'
      });
      
      setRegistrations(registrations.filter(reg => reg.registration_id !== id));
      setProcessing(false);
    } catch (err) {
      setError('Failed to reject registration. Please try again later.');
      setProcessing(false);
      console.error('Error rejecting registration:', err);
    }
  };

  const handleBulkAction = async (action) => {
    if (!selectedIds.length) return;
    
    if (window.confirm(`Are you sure you want to ${action} the selected registrations?`)) {
      try {
        setProcessing(true);
        
        // For each selected ID, make an API call
        const promises = selectedIds.map(id => 
          api.post('/course-registrations/approve.php', {
            registration_id: id,
            status: action === 'approve' ? 'approved' : 'rejected'
          })
        );
        
        await Promise.all(promises);
        
        setRegistrations(registrations.filter(reg => !selectedIds.includes(reg.registration_id)));
        setSelectedIds([]);
        setSelectAll(false);
        setProcessing(false);
      } catch (err) {
        setError(`Failed to ${action} registrations. Please try again later.`);
        setProcessing(false);
        console.error(`Error ${action}ing registrations:`, err);
      }
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRegistrations.map(reg => reg.registration_id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectItem = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Filter registrations based on search term
  const filteredRegistrations = registrations.filter(reg => 
    reg.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.class_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRegistrations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading course registrations...</p>
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
          <i className="fas fa-clipboard-list me-2"></i>
          Course Registrations
        </h2>
      </div>
      
      <div className="card mb-4">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${statusFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setStatusFilter('pending')}
              >
                Pending Approval
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${statusFilter === 'approved' ? 'active' : ''}`}
                onClick={() => setStatusFilter('approved')}
              >
                Approved
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${statusFilter === 'rejected' ? 'active' : ''}`}
                onClick={() => setStatusFilter('rejected')}
              >
                Rejected
              </button>
            </li>
          </ul>
        </div>
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
                  placeholder="Search by student, course or class..."
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
            {statusFilter === 'pending' && selectedIds.length > 0 && (
              <div className="col-md-6 text-md-end">
                <button
                  className="btn btn-success me-2"
                  onClick={() => handleBulkAction('approve')}
                  disabled={processing}
                >
                  <i className="fas fa-check me-1"></i>
                  Approve Selected
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleBulkAction('reject')}
                  disabled={processing}
                >
                  <i className="fas fa-times me-1"></i>
                  Reject Selected
                </button>
              </div>
            )}
          </div>
          
          {currentItems.length === 0 ? (
            <div className="alert alert-info">
              {searchTerm 
                ? "No registrations found matching your search criteria." 
                : `No ${statusFilter} registrations available.`}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    {statusFilter === 'pending' && (
                      <th>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAll}
                            id="selectAll"
                          />
                          <label className="form-check-label" htmlFor="selectAll">
                            Select All
                          </label>
                        </div>
                      </th>
                    )}
                    <th>Student</th>
                    <th>Course</th>
                    <th>Class</th>
                    <th>Requested Date</th>
                    <th>Status</th>
                    {statusFilter === 'pending' && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map(reg => (
                    <tr key={reg.registration_id}>
                      {statusFilter === 'pending' && (
                        <td>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={selectedIds.includes(reg.registration_id)}
                              onChange={() => handleSelectItem(reg.registration_id)}
                              id={`select-${reg.registration_id}`}
                            />
                          </div>
                        </td>
                      )}
                      <td>{reg.student_name}</td>
                      <td>{reg.course_name}</td>
                      <td>{reg.class_name}</td>
                      <td>{new Date(reg.request_date).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge bg-${getStatusBadge(reg.status)}`}>
                          {reg.status}
                        </span>
                      </td>
                      {statusFilter === 'pending' && (
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-success"
                              onClick={() => handleApprove(reg.registration_id)}
                              disabled={processing}
                              title="Approve Registration"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleReject(reg.registration_id)}
                              disabled={processing}
                              title="Reject Registration"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        </td>
                      )}
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

// Helper function for badge color
const getStatusBadge = (status) => {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'success';
    case 'rejected':
      return 'danger';
    case 'pending':
      return 'warning';
    default:
      return 'secondary';
  }
};

export default CourseRegistrations;
