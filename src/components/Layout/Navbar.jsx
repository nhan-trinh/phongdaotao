import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          <i className="fas fa-graduation-cap me-2"></i>
          Training Department
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarMain"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarMain">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                <i className="fas fa-home me-1"></i> Dashboard
              </Link>
            </li>
            <li className="nav-item dropdown">
              <a 
                className="nav-link dropdown-toggle" 
                href="#" 
                id="reportsDropdown" 
                role="button" 
                data-bs-toggle="dropdown"
              >
                <i className="fas fa-chart-bar me-1"></i> Reports
              </a>
              <ul className="dropdown-menu" aria-labelledby="reportsDropdown">
                <li>
                  <Link className="dropdown-item" to="/reports/grades">
                    Grades Report
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/reports/test-scores">
                    Test Scores Report
                  </Link>
                </li>
              </ul>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/notifications">
                <i className="fas fa-bell me-1"></i> Notifications
              </Link>
            </li>
          </ul>

          {/* Bỏ phần user login dropdown nếu không dùng auth */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
