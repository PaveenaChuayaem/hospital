import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ roles }) {
  const { session } = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  if (roles && roles.length > 0 && !roles.includes(session.role)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}





