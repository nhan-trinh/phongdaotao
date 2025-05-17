import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

const ScheduleView = () => {
  const [schedule, setSchedule] = useState([]);
  const [filteredSchedule, setFilteredSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('weekly'); // weekly, monthly
  const [currentDate, setCurrentDate] = useState(new Date());
  const [teacherFilter, setTeacherFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);

  // Days of the week
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Hours range for the schedule
  const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 9 PM

  useEffect(() => {
    fetchScheduleData();
  }, []);

  useEffect(() => {
    filterScheduleData();
  }, [schedule, teacherFilter, classFilter, view, currentDate]);

  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/teaching-schedule/read.php');
      
      if (response.data.records) {
        setSchedule(response.data.records);
        
        // Extract unique teachers and classes for filter options
        const uniqueTeachers = [...new Set(response.data.records.map(item => item.teacher_name))];
        const uniqueClasses = [...new Set(response.data.records.map(item => item.class_name))];
        
        setTeachers(uniqueTeachers);
        setClasses(uniqueClasses);
      } else {
        setSchedule([]);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load schedule data. Please try again later.');
      setLoading(false);
      console.error('Error fetching schedule:', err);
    }
  };

  const filterScheduleData = () => {
    let filtered = [...schedule];
    
    // Apply teacher filter
    if (teacherFilter !== 'all') {
      filtered = filtered.filter(item => item.teacher_name === teacherFilter);
    }
    
    // Apply class filter
    if (classFilter !== 'all') {
      filtered = filtered.filter(item => item.class_name === classFilter);
    }
    
    // Apply date filter based on view
    if (view === 'weekly') {
      // Get start of week (Sunday)
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      
      // Get end of week (Saturday)
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      filtered = filtered.filter(item => {
        const scheduleDate = new Date(item.schedule_date);
        return scheduleDate >= startOfWeek && scheduleDate <= endOfWeek;
      });
    } else if (view === 'monthly') {
      // Get current month
      const month = currentDate.getMonth();
      const year = currentDate.getFullYear();
      
      filtered = filtered.filter(item => {
        const scheduleDate = new Date(item.schedule_date);
        return scheduleDate.getMonth() === month && scheduleDate.getFullYear() === year;
      });
    }
    
    setFilteredSchedule(filtered);
  };

  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'weekly') {
      newDate.setDate(currentDate.getDate() - 7);
    } else {
      newDate.setMonth(currentDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'weekly') {
      newDate.setDate(currentDate.getDate() + 7);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const formatDateRange = () => {
    if (view === 'weekly') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;
    } else {
      return new Intl.DateTimeFormat('default', { month: 'long', year: 'numeric' }).format(currentDate);
    }
  };

  // Helper to find schedule item for a specific day and hour
  const findScheduleItem = (day, hour) => {
    const dayIndex = daysOfWeek.indexOf(day);
    if (dayIndex === -1) return null;
    
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + dayIndex);
    
    // Format date to match API format (YYYY-MM-DD)
    const formattedDate = date.toISOString().split('T')[0];
    
    // Find items for this date and hour
    return filteredSchedule.filter(item => {
      const itemDate = new Date(item.schedule_date).toISOString().split('T')[0];
      const itemStartHour = parseInt(item.start_time.split(':')[0], 10);
      return itemDate === formattedDate && itemStartHour === hour;
    });
  };

  // Render weekly calendar view
  const renderWeeklyView = () => {
    return (
      <div className="table-responsive schedule-table">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>Time</th>
              {daysOfWeek.map(day => (
                <th key={day}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map(hour => (
              <tr key={hour}>
                <td className="text-center">
                  {hour > 12 ? (hour - 12) : hour}:00 {hour >= 12 ? 'PM' : 'AM'}
                </td>
                {daysOfWeek.map(day => {
                  const scheduleItems = findScheduleItem(day, hour);
                  return (
                    <td key={`${day}-${hour}`} className={scheduleItems?.length ? 'has-events' : ''}>
                      {scheduleItems?.map((item, index) => (
                        <div key={index} className={`schedule-item bg-${getClassTypeColor(item.course_type)}`}>
                          <strong>{item.class_name}</strong>
                          <div>{item.course_name}</div>
                          <small>{item.teacher_name}</small>
                          <div className="location">
                            <i className="fas fa-map-marker-alt me-1"></i>
                            {item.location || 'TBA'}
                          </div>
                        </div>
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render monthly calendar view
  const renderMonthlyView = () => {
    // Get days in month
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Get first day of month
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    // Create calendar days array
    const calendarDays = [];
    
    // Add empty slots for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push(i);
    }
    
    // Calculate number of weeks (rows)
    const numWeeks = Math.ceil(calendarDays.length / 7);
    
    // Helper to find schedule items for a specific date
    const findScheduleItemsForDate = (day) => {
      if (!day) return [];
      
      const date = new Date(year, month, day);
      const formattedDate = date.toISOString().split('T')[0];
      
      return filteredSchedule.filter(item => {
        const itemDate = new Date(item.schedule_date).toISOString().split('T')[0];
        return itemDate === formattedDate;
      });
    };
    
    return (
      <div className="table-responsive">
        <table className="table table-bordered month-view">
          <thead>
            <tr>
              {daysOfWeek.map(day => (
                <th key={day}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: numWeeks }).map((_, weekIndex) => (
              <tr key={weekIndex} className="month-row">
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const dayNumber = calendarDays[weekIndex * 7 + dayIndex];
                  const scheduleItems = findScheduleItemsForDate(dayNumber);
                  
                  return (
                    <td key={dayIndex} className={!dayNumber ? 'empty-day' : 'calendar-day'}>
                      {dayNumber && (
                        <>
                          <div className="day-number">{dayNumber}</div>
                          <div className="day-events">
                            {scheduleItems.slice(0, 3).map((item, index) => (
                              <div key={index} className={`event-item bg-${getClassTypeColor(item.course_type)}`}>
                                <div className="event-time">
                                  {item.start_time.substring(0, 5)} - {item.end_time.substring(0, 5)}
                                </div>
                                <div className="event-title">{item.class_name}</div>
                              </div>
                            ))}
                            {scheduleItems.length > 3 && (
                              <div className="more-events">+ {scheduleItems.length - 3} more</div>
                            )}
                          </div>
                        </>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Helper to get color based on course type
  const getClassTypeColor = (type) => {
    if (!type) return 'primary';
    
    switch (type.toLowerCase()) {
      case 'lecture':
        return 'primary';
      case 'lab':
        return 'success';
      case 'seminar':
        return 'info';
      case 'workshop':
        return 'warning';
      case 'exam':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading schedule...</p>
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
          <i className="fas fa-calendar-alt me-2"></i>
          Teaching Schedule
        </h2>
        <div className="btn-group">
          <button
            className={`btn btn-outline-primary ${view === 'weekly' ? 'active' : ''}`}
            onClick={() => setView('weekly')}
          >
            Week View
          </button>
          <button
            className={`btn btn-outline-primary ${view === 'monthly' ? 'active' : ''}`}
            onClick={() => setView('monthly')}
          >
            Month View
          </button>
        </div>
      </div>
      
      <div className="card mb-4">
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-4">
              <select
                className="form-select"
                value={teacherFilter}
                onChange={(e) => setTeacherFilter(e.target.value)}
              >
                <option value="all">All Teachers</option>
                {teachers.map((teacher, index) => (
                  <option key={index} value={teacher}>{teacher}</option>
                ))}
              </select>
            </div>
            
            <div className="col-md-4">
              <select
                className="form-select"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
              >
                <option value="all">All Classes</option>
                {classes.map((className, index) => (
                  <option key={index} value={className}>{className}</option>
                ))}
              </select>
            </div>
            
            <div className="col-md-4">
              <div className="d-flex justify-content-end">
                <button className="btn btn-outline-secondary me-2" onClick={navigatePrevious}>
                  <i className="fas fa-chevron-left"></i>
                </button>
                <span className="btn btn-outline-secondary disabled date-display">
                  {formatDateRange()}
                </span>
                <button className="btn btn-outline-secondary ms-2" onClick={navigateNext}>
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
          
          {filteredSchedule.length === 0 ? (
            <div className="alert alert-info">
              No schedule data available for the selected filters.
            </div>
          ) : (
            view === 'weekly' ? renderWeeklyView() : renderMonthlyView()
          )}
          
          <div className="mt-3">
            <div className="d-flex justify-content-end">
              <div className="legend d-flex">
                <div className="legend-item">
                  <span className="color-box bg-primary"></span>
                  <span className="ms-1">Lecture</span>
                </div>
                <div className="legend-item ms-3">
                  <span className="color-box bg-success"></span>
                  <span className="ms-1">Lab</span>
                </div>
                <div className="legend-item ms-3">
                  <span className="color-box bg-info"></span>
                  <span className="ms-1">Seminar</span>
                </div>
                <div className="legend-item ms-3">
                  <span className="color-box bg-warning"></span>
                  <span className="ms-1">Workshop</span>
                </div>
                <div className="legend-item ms-3">
                  <span className="color-box bg-danger"></span>
                  <span className="ms-1">Exam</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleView;
