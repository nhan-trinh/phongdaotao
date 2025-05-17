import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout Components
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';

// Dashboard
import Dashboard from './components/Dashboard/Dashboard';

// Course Management
import CoursesList from './components/Courses/CoursesList';
import CourseForm from './components/Courses/CourseForm';

// Curriculum Management
import CurriculumList from './components/Curriculum/CurriculumList';
import CurriculumForm from './components/Curriculum/CurriculumForm';

// Class Management
import ClassesList from './components/Classes/ClassesList';
import ClassForm from './components/Classes/ClassForm';

// Teacher Assignments
import TeacherAssignmentsList from './components/TeacherAssignments/TeacherAssignmentsList';
import TeacherAssignmentForm from './components/TeacherAssignments/TeacherAssignmentForm';

// Schedule
import ScheduleView from './components/Schedule/ScheduleView';

// Registrations
import CourseRegistrations from './components/Registrations/CourseRegistrations';
import RetakeExamRegistrations from './components/Registrations/RetakeExamRegistrations';
import RetakeCourseRegistrations from './components/Registrations/RetakeCourseRegistrations';

// Regulations
import RegulationsList from './components/Regulations/RegulationsList';
import RegulationForm from './components/Regulations/RegulationForm';

// Reports
import GradesReport from './components/Reports/GradesReport';
import TestScoresReport from './components/Reports/TestScoresReport';

// Notifications
import NotificationsList from './components/Notifications/NotificationsList';
import NotificationForm from './components/Notifications/NotificationForm';

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="main-container">
          <Sidebar />
          <main className="content">
            <Routes>
              <Route path="/" element={<Dashboard />} />

              {/* Courses */}
              <Route path="/courses" element={<CoursesList />} />
              <Route path="/courses/add" element={<CourseForm />} />
              <Route path="/courses/edit/:id" element={<CourseForm />} />

              {/* Curriculum */}
              <Route path="/curriculum" element={<CurriculumList />} />
              <Route path="/curriculum/add" element={<CurriculumForm />} />
              <Route path="/curriculum/edit/:id" element={<CurriculumForm />} />

              {/* Classes */}
              <Route path="/classes" element={<ClassesList />} />
              <Route path="/classes/add" element={<ClassForm />} />
              <Route path="/classes/edit/:id" element={<ClassForm />} />

              {/* Teacher Assignments */}
              <Route path="/teacher-assignments" element={<TeacherAssignmentsList />} />
              <Route path="/teacher-assignments/add" element={<TeacherAssignmentForm />} />
              <Route path="/teacher-assignments/edit/:id" element={<TeacherAssignmentForm />} />

              {/* Schedule */}
              <Route path="/schedule" element={<ScheduleView />} />

              {/* Registrations */}
              <Route path="/course-registrations" element={<CourseRegistrations />} />
              <Route path="/retake-exam-registrations" element={<RetakeExamRegistrations />} />
              <Route path="/retake-course-registrations" element={<RetakeCourseRegistrations />} />

              {/* Regulations */}
              <Route path="/regulations" element={<RegulationsList />} />
              <Route path="/regulations/add" element={<RegulationForm />} />
              <Route path="/regulations/edit/:id" element={<RegulationForm />} />

              {/* Reports */}
              <Route path="/reports/grades" element={<GradesReport />} />
              <Route path="/reports/test-scores" element={<TestScoresReport />} />

              {/* Notifications */}
              <Route path="/notifications" element={<NotificationsList />} />
              <Route path="/notifications/add" element={<NotificationForm />} />

              {/* Default redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
