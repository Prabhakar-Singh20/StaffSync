import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their assigned dashboard if they don't have access to this route
    if (user.role === 'HR') return <Navigate to="/hr" replace />;
    if (user.role === 'Manager') return <Navigate to="/manager" replace />;
    return <Navigate to="/employee" replace />;
  }

  return children;
};

export default ProtectedRoute;
