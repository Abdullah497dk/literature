import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { StudentDashboard } from '../student/StudentDashboard';
import { TeacherDashboard } from '../teacher/TeacherDashboard';
import { AdminDashboard } from '../admin/AdminDashboard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function DashboardRouter() {
  const { role, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Gösterge paneli yükleniyor..." size="lg" />;
  }

  switch (role) {
    case 'admin':
      return <AdminDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    default:
      return <StudentDashboard />;
  }
}

export default DashboardRouter;
