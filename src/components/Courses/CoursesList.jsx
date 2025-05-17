import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

const CoursesList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(10);
  const [sortField, setSortField] = useState('course_id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [refreshKey, setRefreshKey] = useState(0); // Thêm state này để trigger refetch

  useEffect(() => {
    fetchCourses();
  }, [refreshKey]); // Thêm refreshKey vào dependencies

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/courses/read.php');

      if (response.data.records) {
        setCourses(response.data.records);
      } else {
        setCourses([]);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load courses. Please try again later.');
      setLoading(false);
      console.error('Error fetching courses:', err);
    }
  };

  // Thêm hàm này để làm mới danh sách
  const refreshCourses = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await api.post('/courses/delete.php', { course_id: id });
        setCourses(courses.filter(course => course.course_id !== id));
      } catch (err) {
        setError('Failed to delete course. Please try again later.');
        console.error('Error deleting course:', err);
      }
    }
  };

  const handleSort = (field) => {
    const direction = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(direction);
    
    const sortedCourses = [...courses].sort((a, b) => {
      if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
      if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    setCourses(sortedCourses);
  };

  // Filter courses based on search term
  const filteredCourses = courses.filter(course => 
    course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.course_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading courses...</p>
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
          <i className="fas fa-book me-2"></i>
          Courses Management
        </h2>
        <Link to="/courses/add" className="btn btn-primary">
          <i className="fas fa-plus me-2"></i>
          Add New Course
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
                  placeholder="Search by course name or code..."
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
            <div className="col-md-6 text-md-end">
              <span className="me-2">
                Showing {indexOfFirstCourse + 1} to {Math.min(indexOfLastCourse, filteredCourses.length)} of {filteredCourses.length} courses
              </span>
            </div>
          </div>
          
          {currentCourses.length === 0 ? (
            <div className="alert alert-info">
              {searchTerm 
                ? "No courses found matching your search criteria." 
                : "No courses available. Click 'Add New Course' to create one."}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('course_code')} style={{ cursor: 'pointer' }}>
                      Code {sortField === 'course_code' && (
                        <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSort('course_name')} style={{ cursor: 'pointer' }}>
                      Name {sortField === 'course_name' && (
                        <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSort('credits')} style={{ cursor: 'pointer' }}>
                      Credits {sortField === 'credits' && (
                        <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCourses.map(course => (
                    <tr key={course.course_id}>
                      <td>{course.course_code}</td>
                      <td>{course.course_name}</td>
                      <td>{course.credits}</td>
                      <td>
                        {course.description.length > 50
                          ? `${course.description.substring(0, 50)}...`
                          : course.description}
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <Link 
                            to={`/courses/edit/${course.course_id}`} 
                            className="btn btn-outline-primary"
                            title="Edit Course"
                          >
                            <i className="fas fa-edit"></i>
                          </Link>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(course.course_id)}
                            title="Delete Course"
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

export default CoursesList;
