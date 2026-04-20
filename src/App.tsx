import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public Pages
import { Home } from './pages/public/Home';
import { Login } from './pages/public/Login';
import { Register } from './pages/public/Register';
import { Contact } from './pages/public/Contact';

// Dashboard Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentTestInterface } from './pages/student/StudentTestInterface';
import { StudentAttendance } from './pages/student/StudentAttendance';
import { StudentFees } from './pages/student/StudentFees';
import { StudentResults } from './pages/student/StudentResults';
import { StudentTimetable } from './pages/student/StudentTimetable';
import { StudentTests } from './pages/student/StudentTests';
import { StudentDoubts } from './pages/student/StudentDoubts';
import { StudentNotifications } from './pages/student/StudentNotifications';
import { StudentProfile } from './pages/student/StudentProfile';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminStudents } from './pages/admin/AdminStudents';
import { AdminTests } from './pages/admin/AdminTests';
import { AdminCreateTest } from './pages/admin/AdminCreateTest';
import { AdminBatches } from './pages/admin/AdminBatches';
import { AdminTimetable } from './pages/admin/AdminTimetable';
import { AdminAttendance } from './pages/admin/AdminAttendance';
import { AdminResults } from './pages/admin/AdminResults';
import { AdminFees } from './pages/admin/AdminFees';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { AdminNotifications } from './pages/admin/AdminNotifications';
import { AdminDoubts } from './pages/admin/AdminDoubts';

// Temporary components for pages not yet built fully
const Placeholder = ({ name }: { name: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] text-center italic space-y-4">
    <div className="bg-slate-100 p-8 rounded-full">
      <div className="text-6xl">🚧</div>
    </div>
    <h1 className="text-2xl font-black text-slate-800">{name} Page</h1>
    <p className="text-slate-500 max-w-sm">This page is part of our upcoming architecture and will be fully functional when connected to the backend API.</p>
  </div>
);

import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<Placeholder name="About Us" />} />
            <Route path="/testimonials" element={<Placeholder name="Testimonials" />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student" element={<DashboardLayout />}>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="attendance" element={<StudentAttendance />} />
              <Route path="timetable" element={<StudentTimetable />} />
              <Route path="tests" element={<StudentTests />} />
              <Route path="tests/:id" element={<StudentTestInterface />} />
              <Route path="results" element={<StudentResults />} />
              <Route path="fees" element={<StudentFees />} />
              <Route path="doubts" element={<StudentDoubts />} />
              <Route path="notifications" element={<StudentNotifications />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<DashboardLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="batches" element={<AdminBatches />} />
              <Route path="timetable" element={<AdminTimetable />} />
              <Route path="attendance" element={<AdminAttendance />} />
              <Route path="tests" element={<AdminTests />} />
              <Route path="tests/create" element={<AdminCreateTest />} />
              <Route path="tests/edit/:id" element={<AdminCreateTest />} />
              <Route path="assignments" element={<Placeholder name="Assignments" />} />
              <Route path="results" element={<AdminResults />} />
              <Route path="fees" element={<AdminFees />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="doubts" element={<AdminDoubts />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<Placeholder name="404 - Not Found" />} />
        </Routes>
      </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}
