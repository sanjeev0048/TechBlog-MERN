import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useBlog } from '../../context/BlogContext';

const ProtectedRoute = ({ children }) => {
  const { isAdminLoggedIn } = useBlog();
  const location = useLocation();

  if (!isAdminLoggedIn) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
