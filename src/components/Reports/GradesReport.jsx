import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Chart from 'chart.js/auto';

const GradesReport = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseFilter, setCourseFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [years, setYears] = useState([]);
  const [chartInstances, setChartInstances] = useState({
    gradeDistribution: null,
    averageGrades: null
  });

  useEffect(() => {
    fetchGrades();
  }, []);

  useEffect(() => {
    renderCharts();
    
    // Cleanup charts when component unmounts
    return () => {
      Object.values(chartInstances).forEach(chart => {
        if (chart) chart.destroy();
      });
    };
  }, [grades, courseFilter, classFilter, semesterFilter, yearFilter]);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const response = await api.get('/grades/read.php');
      
      if (response.data.records) {
        setGrades(response.data.records);
        
        // Extract unique values for filters
        const uniqueCourses = ['all', ...new Set(response.data.records.map(grade => grade.course_name))];
        const uniqueClasses = ['all', ...new Set(response.data.records.map(grade => grade.class_name))];
        const uniqueSemesters = ['all', ...new Set(response.data.records.map(grade => grade.semester))];
        const uniqueYears = ['all', ...new Set(response.data.records.map(grade => grade.academic_year))];
        
        setCourses(uniqueCourses);
        setClasses(uniqueClasses);
        setSemesters(uniqueSemesters);
        setYears(uniqueYears);
      } else {
        setGrades([]);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load grades. Please try again later.');
      setLoading(false);
      console.error('Error fetching grades:', err);
    }
  };

  const renderCharts = () => {
    // Filter grades based on selected filters
    const filteredGrades = grades.filter(grade => {
      return (courseFilter === 'all' || grade.course_name === courseFilter) &&
             (classFilter === 'all' || grade.class_name === classFilter) &&
             (semesterFilter === 'all' || grade.semester === semesterFilter) &&
             (yearFilter === 'all' || grade.academic_year === yearFilter);
    });

    renderGradeDistributionChart(filteredGrades);
    renderAverageGradesChart(filteredGrades);
  };

  const renderGradeDistributionChart = (filteredGrades) => {
    // Setup grade ranges
    const gradeRanges = {
      'A (90-100)': 0,
      'B (80-89)': 0,
      'C (70-79)': 0,
      'D (60-69)': 0,
      'F (0-59)': 0
    };

    // Count grades in each range
    filteredGrades.forEach(grade => {
      const numericGrade = parseFloat(grade.final_grade);
      
      if (!isNaN(numericGrade)) {
        if (numericGrade >= 90) gradeRanges['A (90-100)']++;
        else if (numericGrade >= 80) gradeRanges['B (80-89)']++;
        else if (numericGrade >= 70) gradeRanges['C (70-79)']++;
        else if (numericGrade >= 60) gradeRanges['D (60-69)']++;
        else gradeRanges['F (0-59)']++;
      }
    });

    // If chart already exists, destroy it
    if (chartInstances.gradeDistribution) {
      chartInstances.gradeDistribution.destroy();
    }

    // Create chart
    const ctx = document.getElementById('gradeDistributionChart');
    if (ctx) {
      const newChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(gradeRanges),
          datasets: [{
            label: 'Number of Students',
            data: Object.values(gradeRanges),
            backgroundColor: [
              'rgba(75, 192, 192, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(255, 159, 64, 0.7)',
              'rgba(255, 99, 132, 0.7)'
            ],
            borderColor: [
              'rgba(75, 192, 192, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(255, 99, 132, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
                precision: 0
              },
              title: {
                display: true,
                text: 'Number of Students'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Grade Range'
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Grade Distribution',
              font: {
                size: 16
              }
            },
            legend: {
              display: false
            }
          }
        }
      });
      
      setChartInstances(prev => ({
        ...prev,
        gradeDistribution: newChart
      }));
    }
  };

  const renderAverageGradesChart = (filteredGrades) => {
    // Group by course or class depending on what's selected
    let groupBy = 'course_name';
    let groupTitle = 'Course';
    
    if (courseFilter !== 'all' && classFilter === 'all') {
      groupBy = 'class_name';
      groupTitle = 'Class';
    } else if (courseFilter === 'all' && classFilter !== 'all') {
      groupBy = 'course_name';
      groupTitle = 'Course';
    }
    
    // Calculate average grades by group
    const groupedGrades = {};
    filteredGrades.forEach(grade => {
      const key = grade[groupBy];
      if (!key) return;
      
      if (!groupedGrades[key]) {
        groupedGrades[key] = {
          sum: 0,
          count: 0
        };
      }
      
      const numericGrade = parseFloat(grade.final_grade);
      if (!isNaN(numericGrade)) {
        groupedGrades[key].sum += numericGrade;
        groupedGrades[key].count++;
      }
    });
    
    // Calculate averages
    const labels = [];
    const data = [];
    
    Object.entries(groupedGrades).forEach(([key, value]) => {
      if (value.count > 0) {
        labels.push(key);
        data.push((value.sum / value.count).toFixed(2));
      }
    });
    
    // If chart already exists, destroy it
    if (chartInstances.averageGrades) {
      chartInstances.averageGrades.destroy();
    }
    
    // Create chart
    const ctx = document.getElementById('averageGradesChart');
    if (ctx) {
      const newChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Average Grade',
            data: data,
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: 'Average Grade'
              }
            },
            x: {
              title: {
                display: true,
                text: groupTitle
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: `Average Grades by ${groupTitle}`,
              font: {
                size: 16
              }
            }
          }
        }
      });
      
      setChartInstances(prev => ({
        ...prev,
        averageGrades: newChart
      }));
    }
  };

  const calculateOverallStats = (filteredGrades) => {
    if (filteredGrades.length === 0) {
      return { average: 'N/A', highest: 'N/A', lowest: 'N/A', count: 0 };
    }
    
    let sum = 0;
    let highest = -Infinity;
    let lowest = Infinity;
    let validCount = 0;
    
    filteredGrades.forEach(grade => {
      const numericGrade = parseFloat(grade.final_grade);
      if (!isNaN(numericGrade)) {
        sum += numericGrade;
        highest = Math.max(highest, numericGrade);
        lowest = Math.min(lowest, numericGrade);
        validCount++;
      }
    });
    
    return {
      average: validCount > 0 ? (sum / validCount).toFixed(2) : 'N/A',
      highest: highest !== -Infinity ? highest.toFixed(2) : 'N/A',
      lowest: lowest !== Infinity ? lowest.toFixed(2) : 'N/A',
      count: validCount
    };
  };

  // Filter grades based on selected filters
  const filteredGrades = grades.filter(grade => {
    return (courseFilter === 'all' || grade.course_name === courseFilter) &&
           (classFilter === 'all' || grade.class_name === classFilter) &&
           (semesterFilter === 'all' || grade.semester === semesterFilter) &&
           (yearFilter === 'all' || grade.academic_year === yearFilter);
  });

  // Calculate statistics
  const stats = calculateOverallStats(filteredGrades);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading grades data...</p>
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
          <i className="fas fa-chart-bar me-2"></i>
          Grades Report
        </h2>
        <button 
          className="btn btn-outline-primary"
          onClick={() => window.print()}
        >
          <i className="fas fa-print me-2"></i>
          Print Report
        </button>
      </div>
      
      <div className="card mb-4">
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-3 mb-3">
              <label className="form-label">Course</label>
              <select
                className="form-select"
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
              >
                {courses.map((course, index) => (
                  <option key={index} value={course}>
                    {course === 'all' ? 'All Courses' : course}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-3 mb-3">
              <label className="form-label">Class</label>
              <select
                className="form-select"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
              >
                {classes.map((cls, index) => (
                  <option key={index} value={cls}>
                    {cls === 'all' ? 'All Classes' : cls}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-3 mb-3">
              <label className="form-label">Semester</label>
              <select
                className="form-select"
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
              >
                {semesters.map((semester, index) => (
                  <option key={index} value={semester}>
                    {semester === 'all' ? 'All Semesters' : semester}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-3 mb-3">
              <label className="form-label">Year</label>
              <select
                className="form-select"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
              >
                {years.map((year, index) => (
                  <option key={index} value={year}>
                    {year === 'all' ? 'All Years' : year}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="row mb-4">
            <div className="col-12">
              <div className="card">
                <div className="card-header bg-light">
                  <h5 className="card-title mb-0">Summary Statistics</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3">
                      <div className="text-center">
                        <h3 className="text-primary">{stats.average}</h3>
                        <p className="text-muted">Average Grade</p>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center">
                        <h3 className="text-success">{stats.highest}</h3>
                        <p className="text-muted">Highest Grade</p>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center">
                        <h3 className="text-danger">{stats.lowest}</h3>
                        <p className="text-muted">Lowest Grade</p>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-center">
                        <h3>{stats.count}</h3>
                        <p className="text-muted">Total Students</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-header bg-light">
                  <h5 className="card-title mb-0">Grade Distribution</h5>
                </div>
                <div className="card-body">
                  <div style={{ height: '300px' }}>
                    <canvas id="gradeDistributionChart"></canvas>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-header bg-light">
                  <h5 className="card-title mb-0">Average Grades by Course/Class</h5>
                </div>
                <div className="card-body">
                  <div style={{ height: '300px' }}>
                    <canvas id="averageGradesChart"></canvas>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header bg-light">
                  <h5 className="card-title mb-0">Detailed Grades</h5>
                </div>
                <div className="card-body">
                  {filteredGrades.length === 0 ? (
                    <div className="alert alert-info">
                      No grades found matching your filter criteria.
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead>
                          <tr>
                            <th>Student</th>
                            <th>Course</th>
                            <th>Class</th>
                            <th>Semester</th>
                            <th>Year</th>
                            <th>Grade</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredGrades.slice(0, 10).map((grade, index) => (
                            <tr key={index}>
                              <td>{grade.student_name}</td>
                              <td>{grade.course_name}</td>
                              <td>{grade.class_name}</td>
                              <td>{grade.semester}</td>
                              <td>{grade.academic_year}</td>
                              <td>
                                <span className={`badge bg-${getGradeBadge(grade.final_grade)}`}>
                                  {grade.final_grade}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {filteredGrades.length > 10 && (
                        <div className="text-center mt-2">
                          <span className="text-muted">
                            Showing 10 of {filteredGrades.length} results
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for grade badge color
const getGradeBadge = (grade) => {
  if (!grade) return 'secondary';
  
  const numericGrade = parseFloat(grade);
  if (isNaN(numericGrade)) {
    // Handle letter grades
    if (grade.toLowerCase() === 'a') return 'success';
    if (grade.toLowerCase() === 'b') return 'primary';
    if (grade.toLowerCase() === 'c') return 'info';
    if (grade.toLowerCase() === 'd') return 'warning';
    if (grade.toLowerCase() === 'f') return 'danger';
    return 'secondary';
  }
  
  // Handle numeric grades
  if (numericGrade >= 90) return 'success';
  if (numericGrade >= 80) return 'primary';
  if (numericGrade >= 70) return 'info';
  if (numericGrade >= 60) return 'warning';
  return 'danger';
};

export default GradesReport;
