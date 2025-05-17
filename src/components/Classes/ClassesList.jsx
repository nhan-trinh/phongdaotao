import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

const ClassesList = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [sortField, setSortField] = useState('start_date');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/classes/read.php');
      
      if (response.data.records) {
        setClasses(response.data.records);
      } else {
        setClasses([]);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load classes. Please try again later.');
      setLoading(false);
      console.error('Error fetching classes:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await api.post('/classes/delete.php', { class_id: id });
        setClasses(classes.filter(cls => cls.class_id !== id));
      } catch (err) {
        setError('Failed to delete class. Please try again later.');
        console.error('Error deleting class:', err);
      }
    }
  };

  const handleSort = (field) => {
    const direction = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(direction);
  };

  // Get unique years and semesters for filters
  const years = ['all', ...new Set(classes.map(cls => cls.academic_year).filter(Boolean))].sort();
  const semesters = ['all', ...new Set(classes.map(cls => cls.semester).filter(Boolean))].sort();

  // Filter and sort classes
  const filteredClasses = classes.filter(cls => {
    const matchesSearch = 
      cls.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cls.course_name && cls.course_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSemester = semesterFilter === 'all' || cls.semester === semesterFilter;
    const matchesYear = yearFilter === 'all' || cls.academic_year === yearFilter;
    
    return matchesSearch && matchesSemester && matchesYear;
  }).sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Handle special cases for sorting
    if (sortField === 'start_date' || sortField === 'end_date') {
      aValue = new Date(aValue || '2099-01-01');
      bValue = new Date(bValue || '2099-01-01');
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClasses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading classes...</p>
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
          <i className="fas fa-chalkboard me-2"></i>
          Classes Management
        </h2>
        <Link to="/classes/add" className="btn btn-primary">
          <i className="fas fa-plus me-2"></i>
          Add New Class
        </Link>
      </div>
      
      <div className="card mb-4">
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search classes..."
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
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
              >
                <option value="all">All Semesters</option>
                {semesters.filter(s => s !== 'all').map(semester => (
                  <option key={semester} value={semester}>
                    {semester}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
              >
                <option value="all">All Years</option>
                {years.filter(y => y !== 'all').map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2 text-md-end">
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setSearchTerm('');
                  setSemesterFilter('all');
                  setYearFilter('all');
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>
          
          {currentItems.length === 0 ? (
            <div className="alert alert-info">
              {(searchTerm || semesterFilter !== 'all' || yearFilter !== 'all')
                ? "No classes found matching your criteria."
                : "No classes available. Click 'Add New Class' to create one."}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th 
                      onClick={() => handleSort('class_name')} 
                      style={{ cursor: 'pointer' }}
                    >
                      Class Name {sortField === 'class_name' && (
                        <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th>Course</th>
                    <th 
                      onClick={() => handleSort('semester')} 
                      style={{ cursor: 'pointer' }}
                    >
                      Semester {sortField === 'semester' && (
                        <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th 
                      onClick={() => handleSort('academic_year')} 
                      style={{ cursor: 'pointer' }}
                    >
                      Year {sortField === 'academic_year' && (
                        <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th 
                      onClick={() => handleSort('start_date')} 
                      style={{ cursor: 'pointer' }}
                    >
                      Start Date {sortField === 'start_date' && (
                        <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map(cls => (
                    <tr key={cls.class_id}>
                      <td>{cls.class_name}</td>
                      <td>{cls.course_name || 'Not assigned'}</td>
                      <td>{cls.semester}</td>
                      <td>{cls.academic_year}</td>
                      <td>{formatDate(cls.start_date)}</td>
                      <td>
                        <span className={`badge bg-${getStatusBadge(cls.status)}`}>
                          {cls.status}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <Link
                            to={`/classes/edit/${cls.class_id}`}
                            className="btn btn-outline-primary"
                            title="Edit Class"
                          >
                            <i className="fas fa-edit"></i>
                          </Link>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(cls.class_id)}
                            title="Delete Class"
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
  if (!dateString) return 'Not set';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const getStatusBadge = (status) => {
  if (!status) return 'secondary';
  
  switch (status.toLowerCase()) {
    case 'active':
      return 'success';
    case 'upcoming':
      return 'info';
    case 'completed':
      return 'secondary';
    case 'cancelled':
      return 'danger';
    default:
      return 'secondary';
  }
};

export default ClassesList;
