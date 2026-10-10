import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, UserCheck } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="top-header">
      <div className="header-title">
        <h4 style={{ textTransform: 'capitalize', color: 'var(--color-dark)' }}>
          {user.role} Workspace
        </h4>
      </div>

      <div className="header-user">
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
            {user.companyName || user.supplierName || user.fullName || user.username}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            {user.role} ({user.userCode})
          </div>
        </div>

        <div className="user-avatar">
          {user.username ? user.username.substring(0, 2).toUpperCase() : 'U'}
        </div>

        <button onClick={logout} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
