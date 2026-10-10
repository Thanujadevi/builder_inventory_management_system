import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'var(--color-bg, #f8fafc)',
        color: 'var(--color-text-muted, #64748b)',
        fontFamily: 'inherit'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-primary, #2563eb)' }}>
            Restoring session...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = user.role || user.txt_Role;

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Role mismatch redirection
    if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'BUILDER') return <Navigate to="/builder/dashboard" replace />;
    if (role === 'SUPPLIER') return <Navigate to="/supplier/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
