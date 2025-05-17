import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

const CurriculumList = () => {
  const [curriculumList, setCurriculumList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchCurriculum();
  }, []);

  const fetchCurriculum = async () => {
    try {
      setLoading(true);
      const response = await api.get('/curriculum/read.php');
      
      if (response.data.records) {
        setCurriculumList(response.data.records);
      } else {
        setCurriculumList([]);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load curriculum data. Please try again later.');
      setLoading(false);
      console.error('Error fetching curriculum:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this curriculum item?')) {
      try {
        await api.post('/curriculum/delete.php', { curriculum_id: id });
        setCurriculumList(curriculumList.filter(item => item.curriculum_id !== id));
      } catch (err) {
        setError('Failed to delete curriculum item. Please try again later.');
        console.error('Error deleting curriculum item:', err);
      }
    }
  };

  // Filter curriculum items based on search term and filter
  const filteredItems = curriculumList.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && item.type.toLowerCase() === filter.toLowerCase();
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading curriculum data...</p>
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
          <i className="fas fa-list-alt me-2"></i>
          Curriculum Management
        </h2>
        <Link to="/curriculum/add" className="btn btn-primary">
          <i className="fas fa-plus me-2"></i>
          Add Curriculum Item
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
                  placeholder="Search curriculum..."
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
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Curriculum Types</option>
                <option value="framework">Framework</option>
                <option value="lesson">Lesson</option>
                <option value="resource">Learning Resource</option>
                <option value="material">Course Material</option>
                <option value="equipment">Course Equipment</option>
              </select>
            </div>
            <div className="col-md-3 text-md-end">
              <span className="me-2">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredItems.length)} of {filteredItems.length} items
              </span>
            </div>
          </div>
          
          {currentItems.length === 0 ? (
            <div className="alert alert-info">
              {searchTerm || filter !== 'all'
                ? "No curriculum items found matching your criteria."
                : "No curriculum items available. Click 'Add Curriculum Item' to create one."}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Course</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map(item => (
                    <tr key={item.curriculum_id}>
                      <td>
                        <span className={`badge bg-${getBadgeColor(item.type)}`}>
                          {item.type}
                        </span>
                      </td>
                      <td>{item.title}</td>
                      <td>
                        {item.description.length > 50
                          ? `${item.description.substring(0, 50)}...`
                          : item.description}
                      </td>
                      <td>{item.course_name || 'N/A'}</td>
                      <td>{formatDate(item.created_at)}</td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <Link
                            to={`/curriculum/edit/${item.curriculum_id}`}
                            className="btn btn-outline-primary"
                            title="Edit Curriculum Item"
                          >
                            <i className="fas fa-edit"></i>
                          </Link>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(item.curriculum_id)}
                            title="Delete Curriculum Item"
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
const getBadgeColor = (type) => {
  switch (type.toLowerCase()) {
    case 'framework':
      return 'primary';
    case 'lesson':
      return 'success';
    case 'resource':
      return 'info';
    case 'material':
      return 'warning';
    case 'equipment':
      return 'secondary';
    default:
      return 'secondary';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

export default CurriculumList;
