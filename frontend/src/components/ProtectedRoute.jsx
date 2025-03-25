import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { userId, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainRed"></div>
      </div>
    );
  }

  if (!userId) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default ProtectedRoute; 