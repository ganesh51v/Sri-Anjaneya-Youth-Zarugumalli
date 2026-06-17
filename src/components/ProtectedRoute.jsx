import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream-100/50">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-saffron-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-saffron-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-saffron-800 font-semibold animate-pulse">Jai Hanuman...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
