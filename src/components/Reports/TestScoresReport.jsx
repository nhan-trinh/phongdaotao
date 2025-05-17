import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Chart from 'chart.js/auto';

const TestScoresReport = () => {
  const [testScores, setTestScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseFilter, setCourseFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [testTypeFilter, setTestTypeFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [testTypes, setTestTypes] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [years, setYears] = useState([]);
  const [chartInstances, setChartInstances] = useState({
    scoreDistribution: null,
    averageScores: null,
    performanceTrend: null
  });

  useEffect(() => {
    fetchTestScores();
  }, []);

  useEffect(() => {
    renderCharts();
    
    // Cleanup charts when component unmounts
    return () => {
      Object.values(chartInstances).forEach(chart => {
        if (chart) chart.destroy();
      });
    };
  }, [testScores, courseFilter, classFilter, testTypeFilter, semesterFilter, yearFilter]);

  const fetchTestScores = async () => {
    try {
      setLoading(true);
      const response = await api.get('/test-scores/read.php');
      
      if (response.data.records) {
        setTestScores(response.data.records);
        
        // Extract unique values for filters
        const uniqueCourses = ['all', ...new Set(response.data.records.map(score => score.course_name))];
        const uniqueClasses = ['all', ...new Set(response.data.records.map(score => score.class_name))];
        const uniqueTestTypes = ['all', ...new Set(response.data.records.map(score => score.test_type))];
        const uniqueSemesters = ['all', ...new Set(response.data.records.map(score => score.semester))];
        const uniqueYears = ['all', ...new Set(response.data.records.map(score => score.academic_year))];
        
        setCourses(uniqueCourses);
        setClasses(uniqueClasses);
        setTestTypes(uniqueTestTypes);
        setSemesters(uniqueSemesters);
        setYears(uniqueYears);
      } else {
        setTestScores([]);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load test scores. Please try again later.');
      setLoading(false);
      console.error('Error fetching test scores:', err);
    }
  };

  const renderCharts = () => {
    // Filter test scores based on selected filters
    const filteredScores = testScores.filter(score => {
      return (courseFilter === 'all' || score.course_name === courseFilter) &&
             (classFilter === 'all' || score.class_name === classFilter) &&
             (testTypeFilter === 'all' || score.test_type === testTypeFilter) &&
             (semesterFilter === 'all' || score.semester === semesterFilter) &&
             (yearFilter === 'all' || score.academic_year === yearFilter);
    });

    renderScoreDistributionChart(filteredScores);
    renderAverageScoresChart(filteredScores);
    renderPerformanceTrendChart(filteredScores);
  };

  const renderScoreDistributionChart = (filteredScores) => {
    // Setup score ranges
    const scoreRanges = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0
    };

    // Count scores in each range
    filteredScores.forEach(score => {
      const numericScore = parseFloat(score.score);
      
      if (!isNaN(numericScore)) {
        if (numericScore <= 20) scoreRanges['0-20']++;
        else if (numericScore <= 40) scoreRanges['21-40']++;
        else if (numericScore <= 60) scoreRanges['41-60']++;
        else if (numericScore <= 80) scoreRanges['61-80']++;
        else scoreRanges['81-100']++;
      }
    });

    // If chart already exists, destroy it
    if (chartInstances.scoreDistribution) {
      chartInstances.scoreDistribution.destroy();
    }

    // Create chart
    const ctx = document.getElementById('scoreDistributionChart');
    if (ctx) {
      const newChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(scoreRanges),
          datasets: [{
            label: 'Number of Students',
            data: Object.values(scoreRanges),
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(255, 159, 64, 0.7)',
              'rgba(255, 205, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(54, 162, 235, 0.7)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(255, 205, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(54, 162, 235, 1)'
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
                text: 'Score Range'
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Test Score Distribution',
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
        scoreDistribution: newChart
      }));
    }
  };

  const renderAverageScoresChart = (filteredScores) => {
    // Group by test type
    const testTypeScores = {};
    
    filteredScores.forEach(score => {
      const testType = score.test_type;
      if (!testType) return;
      
      if (!testTypeScores[testType]) {
        testTypeScores[testType] = {
          sum: 0,
          count: 0
        };
      }
      
      const numericScore = parseFloat(score.score);
      if (!isNaN(numericScore)) {
        testTypeScores[testType].sum += numericScore;
        testTypeScores[testType].count++;
      }
    });
    
    // Calculate averages
    const labels = [];
    const data = [];
    
    Object.entries(testTypeScores).forEach(([key, value]) => {
      if (value.count > 0) {
        labels.push(key);
        data.push((value.sum / value.count).toFixed(2));
      }
    });
    
    // If chart already exists, destroy it
    if (chartInstances.averageScores) {
      chartInstances.averageScores.destroy();
    }
    
    // Create chart
    const ctx = document.getElementById('averageScoresChart');
    if (ctx) {
      const newChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Average Score',
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
                text: 'Average Score'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Test Type'
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Average Scores by Test Type',
              font: {
                size: 16
              }
            }
          }
        }
      });
      
      setChartInstances(prev => ({
        ...prev,
        averageScores: newChart
      }));
    }
  };

  const renderPerformanceTrendChart = (filteredScores) => {
    // Only proceed if we have a specific course and test type selected
    if (courseFilter === 'all' || testTypeFilter === 'all') {
      if (chartInstances.performanceTrend) {
        chartInstances.performanceTrend.destroy();
        setChartInstances(prev => ({
          ...prev,
          performanceTrend: null
        }));
      }
      return;
    }
    
    // Sort scores by date
    const sortedScores = [...filteredScores].sort((a, b) => {
      return new Date(a.test_date) - new Date(b.test_date);
    });
    
    // Group scores by date
    const dateScores = {};
    sortedScores.forEach(score => {
      if (!score.test_date) return;
      
      const date = new Date(score.test_date).toLocaleDateString();
      if (!dateScores[date]) {
        dateScores[date] = {
          sum: 0,
          count: 0
        };
      }
      
      const numericScore = parseFloat(score.score);
      if (!isNaN(numericScore)) {
        dateScores[date].sum += numericScore;
        dateScores[date].count++;
      }
    });
    
    // Calculate averages per date
    const labels = [];
    const data = [];
    
    Object.entries(dateScores).forEach(([date, value]) => {
      if (value.count > 0) {
        labels.push(date);
        data.push((value.sum / value.count).toFixed(2));
      }
    });
    
    // If chart already exists, destroy it
    if (chartInstances.performanceTrend) {
      chartInstances.performanceTrend.destroy();
    }
    
    // Create chart
    const ctx = document.getElementById('performanceTrendChart');
    if (ctx) {
      const newChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Average Score',
            data: data,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1,
            fill: true
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
                text: 'Average Score'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Test Date'
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Performance Trend Over Time',
              font: {
                size: 16
              }
            }
          }
        }
      });
      
      setChartInstances(prev => ({
        ...prev,
        performanceTrend: newChart
      }));
    }
  };

  const calculateOverallStats = (filteredScores) => {
    if (filteredScores.length === 0) {
      return { average: 'N/A', highest: 'N/A', lowest: 'N/A', count: 0, passRate: 'N/A' };
    }
    
    let sum = 0;
    let highest = -Infinity;
    let lowest = Infinity;
    let validCount = 0;
    let passCount = 0;
    const passingThreshold = 60; // Assuming 60% is passing score
    
    filteredScores.forEach(score => {
      const numericScore = parseFloat(score.score);
      if (!isNaN(numericScore)) {
        sum += numericScore;
        highest = Math.max(highest, numericScore);
        lowest = Math.min(lowest, numericScore);
        validCount++;
        
        if (numericScore >= passingThreshold) {
          passCount++;
        }
      }
    });
    
    const passRate = validCount > 0 ? `${((passCount / validCount) * 100).toFixed(2)}%` : 'N/A';
    
    return {
      average: validCount > 0 ? (sum / validCount).toFixed(2) : 'N/A',
      highest: highest !== -Infinity ? highest.toFixed(2) : 'N/A',
      lowest: lowest !== Infinity ? lowest.toFixed(2) : 'N/A',
      count: validCount,
      passRate: passRate
    };
  };

  // Filter test scores based on selected filters
  const filteredScores = testScores.filter(score => {
    return (courseFilter === 'all' || score.course_name === courseFilter) &&
           (classFilter === 'all' || score.class_name === classFilter) &&
           (testTypeFilter === 'all' || score.test_type === testTypeFilter) &&
           (semesterFilter === 'all' || score.semester === semesterFilter) &&
           (yearFilter === 'all' || score.academic_year === yearFilter);
  });

  // Calculate statistics
  const stats = calculateOverallStats(filteredScores);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading test scores data...</p>
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
          <i className="fas fa-chart-line me-2"></i>
          Test Scores Report
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
            <div className="col-md-2 mb-3">
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
            
            <div className="col-md-2 mb-3">
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
            
            <div className="col-md-2 mb-3">
              <label className="form-label">Test Type</label>
              <select
                className="form-select"
                value={testTypeFilter}
                onChange={(e) => setTestTypeFilter(e.target.value)}
              >
                {testTypes.map((type, index) => (
                  <option key={index} value={type}>
                    {type === 'all' ? 'All Test Types' : type}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-2 mb-3">
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
            
            <div className="col-md-2 mb-3">
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
            
            <div className="col-md-2 mb-3 d-flex align-items-end">
              <button 
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setCourseFilter('all');
                  setClassFilter('all');
                  setTestTypeFilter('all');
                  setSemesterFilter('all');
                  setYearFilter('all');
                }}
              >
                Reset Filters
              </button>
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
                    <div className="col">
                      <div className="text-center">
                        <h3 className="text-primary">{stats.average}</h3>
                        <p className="text-muted">Average Score</p>
                      </div>
                    </div>
                    <div className="col">
                      <div className="text-center">
                        <h3 className="text-success">{stats.highest}</h3>
                        <p className="text-muted">Highest Score</p>
                      </div>
                    </div>
                    <div className="col">
                      <div className="text-center">
                        <h3 className="text-danger">{stats.lowest}</h3>
                        <p className="text-muted">Lowest Score</p>
                      </div>
                    </div>
                    <div className="col">
                      <div className="text-center">
                        <h3 className="text-info">{stats.passRate}</h3>
                        <p className="text-muted">Pass Rate</p>
                      </div>
                    </div>
                    <div className="col">
                      <div className="text-center">
                        <h3>{stats.count}</h3>
                        <p className="text-muted">Total Tests</p>
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
                  <h5 className="card-title mb-0">Score Distribution</h5>
                </div>
                <div className="card-body">
                  <div style={{ height: '300px' }}>
                    <canvas id="scoreDistributionChart"></canvas>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-header bg-light">
                  <h5 className="card-title mb-0">Average Scores by Test Type</h5>
                </div>
                <div className="card-body">
                  <div style={{ height: '300px' }}>
                    <canvas id="averageScoresChart"></canvas>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="row mb-4">
            <div className="col-12">
              <div className="card">
                <div className="card-header bg-light">
                  <h5 className="card-title mb-0">Performance Trend Over Time</h5>
                  {(courseFilter === 'all' || testTypeFilter === 'all') && (
                    <small className="text-muted d-block mt-1">
                      Select a specific course and test type to view the performance trend
                    </small>
                  )}
                </div>
                <div className="card-body">
                  <div style={{ height: '300px' }}>
                    <canvas id="performanceTrendChart"></canvas>
                    {(courseFilter === 'all' || testTypeFilter === 'all') && (
                      <div className="d-flex justify-content-center align-items-center h-100">
                        <p className="text-muted">Select a specific course and test type to view the performance trend</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header bg-light">
                  <h5 className="card-title mb-0">Detailed Test Scores</h5>
                </div>
                <div className="card-body">
                  {filteredScores.length === 0 ? (
                    <div className="alert alert-info">
                      No test scores found matching your filter criteria.
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead>
                          <tr>
                            <th>Student</th>
                            <th>Course</th>
                            <th>Test Type</th>
                            <th>Test Date</th>
                            <th>Score</th>
                            <th>Pass/Fail</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredScores.slice(0, 10).map((score, index) => {
                            const numericScore = parseFloat(score.score);
                            const passed = !isNaN(numericScore) && numericScore >= 60;
                            
                            return (
                              <tr key={index}>
                                <td>{score.student_name}</td>
                                <td>{score.course_name}</td>
                                <td>{score.test_type}</td>
                                <td>{new Date(score.test_date).toLocaleDateString()}</td>
                                <td>
                                  <span className={`badge bg-${getScoreBadge(score.score)}`}>
                                    {score.score}
                                  </span>
                                </td>
                                <td>
                                  <span className={`badge ${passed ? 'bg-success' : 'bg-danger'}`}>
                                    {passed ? 'Pass' : 'Fail'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      {filteredScores.length > 10 && (
                        <div className="text-center mt-2">
                          <span className="text-muted">
                            Showing 10 of {filteredScores.length} results
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

// Helper function for score badge color
const getScoreBadge = (score) => {
  if (!score) return 'secondary';
  
  const numericScore = parseFloat(score);
  if (isNaN(numericScore)) {
    return 'secondary';
  }
  
  if (numericScore >= 90) return 'success';
  if (numericScore >= 80) return 'primary';
  if (numericScore >= 70) return 'info';
  if (numericScore >= 60) return 'warning';
  return 'danger';
};

export default TestScoresReport;
