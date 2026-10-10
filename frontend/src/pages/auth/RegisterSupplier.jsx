import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import api from '../../services/api';
import { Store, AlertCircle, CheckCircle2 } from 'lucide-react';

const RegisterSupplier = () => {
  const [formData, setFormData] = useState({
    supplierName: '',
    contactPerson: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    gstin: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    deliveryRadius: 50
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const response = await api.post('/auth/register-supplier', formData);
      setSuccess(response.message || 'Supplier registration submitted for Admin approval!');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Supplier Registration" subtitle="Register supplier profile for Admin KYC review">
      {error && (
        <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {success && (
        <div style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <CheckCircle2 size={18} /> {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Supplier / Company Name *</label>
          <input type="text" name="supplierName" className="form-control" placeholder="e.g. Apex Steel & Cement Supplies" value={formData.supplierName} onChange={handleChange} required />
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Contact Person *</label>
            <input type="text" name="contactPerson" className="form-control" placeholder="Full Name" value={formData.contactPerson} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Phone Number *</label>
            <input type="text" name="phone" className="form-control" placeholder="+91 9876543210" value={formData.phone} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Email Address *</label>
            <input type="email" name="email" className="form-control" placeholder="supplier@company.com" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>GSTIN *</label>
            <input type="text" name="gstin" className="form-control" placeholder="33AAAAA0000A1Z5" value={formData.gstin} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Username *</label>
            <input type="text" name="username" className="form-control" placeholder="Choose username" value={formData.username} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password *</label>
            <input type="password" name="password" className="form-control" placeholder="Choose password" value={formData.password} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-group">
          <label>Address *</label>
          <input type="text" name="address" className="form-control" placeholder="Warehouse / Business Address" value={formData.address} onChange={handleChange} required />
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>City *</label>
            <input type="text" name="city" className="form-control" placeholder="e.g. Tuticorin" value={formData.city} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>State *</label>
            <input type="text" name="state" className="form-control" placeholder="e.g. Tamil Nadu" value={formData.state} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Pincode *</label>
            <input type="text" name="pincode" className="form-control" placeholder="628001" value={formData.pincode} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-group">
          <label>Delivery Radius (in KM) *</label>
          <input type="number" name="deliveryRadius" className="form-control" placeholder="50" value={formData.deliveryRadius} onChange={handleChange} required />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px', padding: '12px' }} disabled={submitting}>
          {submitting ? 'Submitting Registration...' : <><Store size={18} /> Submit Supplier Registration</>}
        </button>
      </form>

      <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem' }}>
        Already registered? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign In</Link>
      </div>
    </AuthLayout>
  );
};

export default RegisterSupplier;
