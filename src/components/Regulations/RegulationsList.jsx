import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

const RegulationsList = () => {
  const [regulations, setRegulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortField, setSortField] = useState('effective_date');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    fetchRegulations();
  }, []);

  const fetchRegulations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/regulations/read.php');
      
      if (response.data.records) {
        setRegulations(response.data.records);
      } else {
        setRegulations([]);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load regulations. Please try again later.');
      setLoading(false);
      console.error('Error fetching regulations:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this regulation?')) {
      try {
        await api.post('/regulations/delete.php', { regulation_id: id });
        setRegulations(regulations.filter(reg => reg.regulation_id !== id));
      } catch (err) {
        setError('Failed to delete regulation. Please try again later.');
        console.error('Error deleting regulation:', err);
      }
    }
  };

  const handleSort = (field) => {
    const direction = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(direction);
  };

  // Get unique categories for filter
  const categories = ['all', ...new Set(regulations.map(reg => reg.category).filter(Boolean))].sort();

  // Filter regulations based on search term and category
  const filteredRegulations = regulations.filter(reg => {
    const matchesSearch = 
      reg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || reg.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Handle dates for sorting
    if (sortField === 'effective_date' || sortField === 'created_at') {
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
  const currentItems = filteredRegulations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRegulations.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading regulations...</p>
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
          <i className="fas fa-gavel me-2"></i>
          Academic Regulations
        </h2>
        <Link to="/regulations/add" className="btn btn-primary">
          <i className="fas fa-plus me-2"></i>
          Add New Regulation
        </Link>
      </div>
      
      <div className="card mb-4">
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search regulations..."
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
            <div className="col-md-4">
              <select
                className="form-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.filter(c => c !== 'all').map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3 text-md-end">
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>
          
          {currentItems.length === 0 ? (
            <div className="alert alert-info">
              {(searchTerm || categoryFilter !== 'all')
                ? "No regulations found matching your criteria."
                : "No regulations available. Click 'Add New Regulation' to create one."}
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
                    <th>Category</th>
                    <th 
                      onClick={() => handleSort('effective_date')} 
                      style={{ cursor: 'pointer' }}
                    >
                      Effective Date {sortField === 'effective_date' && (
                        <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map(reg => (
                    <tr key={reg.regulation_id}>
                      <td>{reg.title}</td>
                      <td>
                        <span className={`badge bg-${getCategoryBadge(reg.category)}`}>
                          {reg.category}
                        </span>
                      </td>
                      <td>{formatDate(reg.effective_date)}</td>
                      <td>
                        {reg.description.length > 80
                          ? `${reg.description.substring(0, 80)}...`
                          : reg.description}
                      </td>
                      <td>
                        <span className={`badge bg-${reg.is_active ? 'success' : 'secondary'}`}>
                          {reg.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <Link
                            to={`/regulations/edit/${reg.regulation_id}`}
                            className="btn btn-outline-primary"
                            title="Edit Regulation"
                          >
                            <i className="fas fa-edit"></i>
                          </Link>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(reg.regulation_id)}
                            title="Delete Regulation"
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

const getCategoryBadge = (category) => {
  if (!category) return 'secondary';
  
  switch (category.toLowerCase()) {
    case 'grading':
      return 'primary';
    case 'attendance':
      return 'warning';
    case 'examination':
      return 'danger';
    case 'registration':
      return 'info';
    case 'graduation':
      return 'success';
    default:
      return 'secondary';
  }
};

export default RegulationsList;
