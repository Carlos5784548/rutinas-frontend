import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUserRole, getStoredToken } from '../services/api';

type Props = {
  children: JSX.Element;
  allowedRoles?: ('ADMIN' | 'ENTRENADOR' | 'CLIENTE')[];
};

export const ProtectedRoute: React.FC<Props> = ({ children, allowedRoles }) => {
  const token = getStoredToken();
  const role = getUserRole();

  console.log('ProtectedRoute check:', { token: !!token, role, allowedRoles }); // Debug log

  // Not authenticated - check both token existence AND valid role from decoded token
  if (!token || !role) {
    console.log('Redirecting to login - no auth'); // Debug log
    return <Navigate to="/login" replace />;
  }

  // Check if role is allowed (if allowedRoles is specified)
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard based on role
    switch (role) {
      case 'ADMIN':
        return <Navigate to="/admin" replace />;
      case 'ENTRENADOR':
        return <Navigate to="/entrenador" replace />;
      case 'CLIENTE':
        return <Navigate to="/cliente" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
};