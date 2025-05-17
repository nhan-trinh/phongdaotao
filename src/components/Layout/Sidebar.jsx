import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  
  // Helper function to check if a path is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="sidebar bg-light">
      <div className="d-flex flex-column p-3">
        <ul className="nav nav-pills flex-column mb-auto">
          <li className="nav-item mb-1">
            <Link 
              to="/courses" 
              className={`nav-link ${isActive('/courses') ? 'active' : ''}`}
            >
              <i className="fas fa-book me-2"></i>
              Courses
            </Link>
          </li>
          <li className="nav-item mb-1">
            <Link 
              to="/curriculum" 
              className={`nav-link ${isActive('/curriculum') ? 'active' : ''}`}
            >
              <i className="fas fa-list-alt me-2"></i>
              Curriculum
            </Link>
          </li>
          <li className="nav-item mb-1">
            <Link 
              to="/classes" 
              className={`nav-link ${isActive('/classes') ? 'active' : ''}`}
            >
              <i className="fas fa-chalkboard me-2"></i>
              Classes
            </Link>
          </li>
          <li className="nav-item mb-1">
            <Link 
              to="/teacher-assignments" 
              className={`nav-link ${isActive('/teacher-assignments') ? 'active' : ''}`}
            >
              <i className="fas fa-chalkboard-teacher me-2"></i>
              Teacher Assignments
            </Link>
          </li>
          <li className="nav-item mb-1">
            <Link 
              to="/schedule" 
              className={`nav-link ${isActive('/schedule') ? 'active' : ''}`}
            >
              <i className="fas fa-calendar-alt me-2"></i>
              Teaching Schedule
            </Link>
          </li>
          
          <li className="sidebar-heading mt-3 mb-1 text-muted">
            <span>Registrations</span>
          </li>
          <li className="nav-item mb-1">
            <Link 
              to="/course-registrations" 
              className={`nav-link ${isActive('/course-registrations') ? 'active' : ''}`}
            >
              <i className="fas fa-clipboard-list me-2"></i>
              Course Registrations
            </Link>
          </li>
          <li className="nav-item mb-1">
            <Link 
              to="/retake-exam-registrations" 
              className={`nav-link ${isActive('/retake-exam-registrations') ? 'active' : ''}`}
            >
              <i className="fas fa-file-alt me-2"></i>
              Retake Exam Registrations
            </Link>
          </li>
          <li className="nav-item mb-1">
            <Link 
              to="/retake-course-registrations" 
              className={`nav-link ${isActive('/retake-course-registrations') ? 'active' : ''}`}
            >
              <i className="fas fa-redo me-2"></i>
              Retake Course Registrations
            </Link>
          </li>
          
          <li className="sidebar-heading mt-3 mb-1 text-muted">
            <span>Administration</span>
          </li>
          <li className="nav-item mb-1">
            <Link 
              to="/regulations" 
              className={`nav-link ${isActive('/regulations') ? 'active' : ''}`}
            >
              <i className="fas fa-gavel me-2"></i>
              Regulations
            </Link>
          </li>
          <li className="nav-item mb-1">
            <Link 
              to="/notifications/add" 
              className={`nav-link ${isActive('/notifications/add') ? 'active' : ''}`}
            >
              <i className="fas fa-paper-plane me-2"></i>
              Send Notifications
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
