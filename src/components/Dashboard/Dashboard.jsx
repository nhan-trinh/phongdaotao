import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    courses: 0,
    classes: 0,
    pendingRegistrations: 0,
    pendingRetakes: 0,
    teachers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [
          coursesRes, 
          classesRes, 
          registrationsRes, 
          retakeExamsRes,
          retakeCoursesRes,
          teacherAssignmentsRes
        ] = await Promise.all([
          api.get('/courses/read.php').catch(e => ({ data: { records: [] } })),
          api.get('/classes/read.php').catch(e => ({ data: { records: [] } })),
          api.get('/course-registrations/read.php?status=pending').catch(e => ({ data: { records: [] } })),
          api.get('/retake-exams/read.php?status=pending').catch(e => ({ data: { records: [] } })),
          api.get('/retake-courses/read.php?status=pending').catch(e => ({ data: { records: [] } })),
          api.get('/teacher-assignments/read.php').catch(e => ({ data: { records: [] } }))
        ]);

        setStats({
          courses: coursesRes.data.records?.length || 0,
          classes: classesRes.data.records?.length || 0,
          pendingRegistrations: registrationsRes.data.records?.length || 0,
          pendingRetakes: 
            (retakeExamsRes.data.records?.length || 0) + 
            (retakeCoursesRes.data.records?.length || 0),
          teachers: teacherAssignmentsRes.data.records ? 
            [...new Set(teacherAssignmentsRes.data.records.map(ta => ta.teacher_id))].length : 0
        });
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
        console.error('Dashboard data loading error:', err);
      }
    };

    fetchStats();
  }, []);

  return (
     <div className="dashboard-container">
    <h2 className="mb-4">Dashboard</h2>

    {loading ? (
      <div className="loading-screen">Đang tải dữ liệu...</div>
    ) : error ? (
      <p className="text-danger">{error}</p>
    ) : (
      <div className="row">
        <div className="col-md-4 mb-3">
          <div className="card p-3">
            <strong>Courses:</strong> {stats.courses}
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card p-3">
            <strong>Classes:</strong> {stats.classes}
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card p-3">
            <strong>Registrations:</strong> {stats.pendingRegistrations}
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card p-3">
            <strong>Retakes:</strong> {stats.pendingRetakes}
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card p-3">
            <strong>Teachers:</strong> {stats.teachers}
          </div>
        </div>
      </div>
    )}
  </div>
  );
};

export default Dashboard;
