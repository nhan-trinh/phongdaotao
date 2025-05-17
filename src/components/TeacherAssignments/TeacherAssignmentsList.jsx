import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

const TeacherAssignmentsList = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [teacherFilter, setTeacherFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/teacher-assignments/read.php');
      
      if (response.data.records) {
        setAssignments(response.data.records);
      } else {
        setAssignments([]);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load teacher assignments. Please try again later.');
      setLoading(false);
      console.error('Error fetching teacher assignments:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher assignment?')) {
      try {
        await api.post('/teacher-assignments/delete.php', { assignment_id: id });
        setAssignments(assignments.filter(assignment => assignment.assignment_id !== id));
      } catch (err) {
        setError('Failed to delete teacher assignment. Please try again later.');
        console.error('Error deleting teacher assignment:', err);
      }
    }
  };

  // Get unique lists for filters
  const teachers = ['all', ...new Set(assignments.map(a => a.teacher_name).filter(Boolean))].sort();
  const semesters = ['all', ...new Set(assignments
    .map(a => a.semester)
    .filter(Boolean))].sort();
  const years = ['all', ...new Set(assignments
    .map(a => a.academic_year)
    .filter(Boolean))].sort();

  // Filter assignments based on search term and filters
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      (assignment.teacher_name && assignment.teacher_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (assignment.class_name && assignment.class_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (assignment.course_name && assignment.course_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTeacher = teacherFilter === 'all' || assignment.teacher_name === teacherFilter;
    const matchesSemester = semesterFilter === 'all' || assignment.semester === semesterFilter;
    const matchesYear = yearFilter === 'all' || assignment.academic_year === yearFilter;
    
    return matchesSearch && matchesTeacher && matchesSemester && matchesYear;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAssignments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading teacher assignments...</p>
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
          <i className="fas fa-chalkboard-teacher me-2"></i>
          Teacher Assignments
        </h2>
        <Link to="/teacher-assignments/add" className="btn btn-primary">
          <i className="fas fa-plus me-2"></i>
          Assign Teacher
        </Link>
      </div>
      
      <div className="card mb-4">
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-3">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search..."
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
                value={teacherFilter}
                onChange={(e) => setTeacherFilter(e.target.value)}
              >
                <option value="all">All Teachers</option>
                {teachers.filter(t => t !== 'all').map(teacher => (
                  <option key={teacher} value={teacher}>
                    {teacher}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
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
            <div className="col-md-2">
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
                  setTeacherFilter('all');
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
              {(searchTerm || teacherFilter !== 'all' || semesterFilter !== 'all' || yearFilter !== 'all')
                ? "No teacher assignments found matching your criteria."
                : "No teacher assignments available. Click 'Assign Teacher' to create one."}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Teacher</th>
                    <th>Class</th>
                    <th>Course</th>
                    <th>Semester</th>
                    <th>Year</th>
                    <th>Assignment Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map(assignment => (
                    <tr key={assignment.assignment_id}>
                      <td>{assignment.teacher_name}</td>
                      <td>{assignment.class_name}</td>
                      <td>{assignment.course_name}</td>
                      <td>{assignment.semester}</td>
                      <td>{assignment.academic_year}</td>
                      <td>
                        <span className={`badge bg-${getAssignmentTypeBadge(assignment.assignment_type)}`}>
                          {assignment.assignment_type}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <Link
                            to={`/teacher-assignments/edit/${assignment.assignment_id}`}
                            className="btn btn-outline-primary"
                            title="Edit Assignment"
                          >
                            <i className="fas fa-edit"></i>
                          </Link>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(assignment.assignment_id)}
                            title="Delete Assignment"
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

// Helper function for badge color
const getAssignmentTypeBadge = (type) => {
  if (!type) return 'secondary';
  
  switch (type.toLowerCase()) {
    case 'primary':
      return 'primary';
    case 'substitute':
      return 'warning';
    case 'assistant':
      return 'info';
    case 'guest lecturer':
      return 'success';
    default:
      return 'secondary';
  }
};

export default TeacherAssignmentsList;
