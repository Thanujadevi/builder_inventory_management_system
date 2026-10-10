import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../layouts/AuthLayout';
import { LogIn, AlertCircle } from 'lucide-react';

const Login = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  // If already logged in, redirect away from /login immediately
  useEffect(() => {
    if (user) {
      if (from) {
        navigate(from, { replace: true });
      } else {
        const role = user.role || user.txt_Role;
        if (role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
        else if (role === 'BUILDER') navigate('/builder/dashboard', { replace: true });
        else if (role === 'SUPPLIER') navigate('/supplier/dashboard', { replace: true });
        else navigate('/', { replace: true });
      }
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const loggedUser = await login(usernameOrEmail, password);
      const role = loggedUser.role || loggedUser.txt_Role;
      
      // Dynamic Role Redirection or return to previous page
      if (from) {
        navigate(from, { replace: true });
      } else if (role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (role === 'BUILDER') {
        navigate('/builder/dashboard', { replace: true });
      } else if (role === 'SUPPLIER') {
        navigate('/supplier/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Sign In to BuilderConnect" subtitle="Access your construction procurement dashboard">
      {error && (
        <div style={{
          backgroundColor: 'var(--color-danger-bg)',
          color: 'var(--color-danger)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px'
        }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username or Email Address</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. admin or builder@company.com"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '12px', padding: '12px' }}
          disabled={submitting}
        >
          {submitting ? 'Authenticating...' : <><LogIn size={18} /> Sign In</>}
        </button>
      </form>

      <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--color-border)', textAlign: 'center', fontSize: '0.85rem' }}>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '8px' }}>Don't have an account?</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link to="/register-builder" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Register as Builder</Link>
          <span style={{ color: 'var(--color-border)' }}>|</span>
          <Link to="/register-supplier" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Register as Supplier</Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
