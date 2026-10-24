import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Public Pages
import { Login } from './pages/public/Login';
import { ForgotPassword, ResetPassword } from './pages/public/ForgotPassword';
import { Contact } from './pages/public/Contact';

// Shared Pages
import { DashboardRouter } from './pages/shared/DashboardRouter';
import { Notifications } from './pages/shared/Notifications';
import { Profile } from './pages/shared/Profile';
import { Settings, NotFound } from './pages/shared/Settings';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { MyClass } from './pages/student/MyClass';
import { ClassmateProfile } from './pages/student/ClassmateProfile';
import { SubmitHomework } from './pages/student/SubmitHomework';
import { SubmissionDetail } from './pages/student/SubmissionDetail';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { TeacherClasses } from './pages/teacher/TeacherClasses';
import { TeacherClassDetail } from './pages/teacher/TeacherClassDetail';
import { TeacherStudentProfile } from './pages/teacher/TeacherStudentProfile';
import { TeacherAssignments } from './pages/teacher/TeacherAssignments';
import { TeacherRequests } from './pages/teacher/TeacherRequests';
import { TeacherSubmissionDetail } from './pages/teacher/TeacherSubmissionDetail';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminClasses } from './pages/admin/AdminClasses';
import { AdminSubmissions } from './pages/admin/AdminSubmissions';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/destek" element={<Navigate to="/contact" replace />} />
            <Route path="/support" element={<Navigate to="/contact" replace />} />
            <Route path="/feedback" element={<Navigate to="/contact" replace />} />

            {/* Authenticated Layout */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Root redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Shared Authenticated Routes */}
              <Route path="/dashboard" element={<DashboardRouter />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />

              {/* Student Routes */}
              <Route path="/my-class" element={<MyClass />} />
              <Route path="/class/:classId" element={<MyClass />} />
              <Route path="/class/:classId/students/:studentId" element={<ClassmateProfile />} />
              <Route path="/submissions/new" element={<SubmitHomework />} />
              <Route path="/submissions/:submissionId" element={<SubmissionDetail />} />

              {/* Teacher Routes */}
              <Route
                path="/teacher/classes"
                element={
                  <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                    <TeacherClasses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/classes/:classId"
                element={
                  <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                    <TeacherClassDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/classes/:classId/students/:studentId"
                element={
                  <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                    <TeacherStudentProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/classes/:classId/assignments"
                element={
                  <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                    <TeacherAssignments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/assignments"
                element={
                  <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                    <TeacherAssignments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/submissions/:submissionId"
                element={
                  <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                    <TeacherSubmissionDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/requests"
                element={
                  <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                    <TeacherRequests />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/classes"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminClasses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/assignments"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <TeacherAssignments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/requests"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <TeacherRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/submissions"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminSubmissions />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
