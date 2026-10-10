import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import api from '../../services/api';
import { Users, Store, FileText, ShoppingCart, CreditCard, CheckCircle2, AlertTriangle, Search, Filter, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, supRes] = await Promise.all([
          api.get('/dashboards/admin'),
          api.get('/admin/suppliers')
        ]);
        setStats(dashRes.data.stats || {});
        setSuppliers(supRes.data.suppliers || []);
      } catch (error) {
        console.error('Failed to load admin metrics:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const uniqueCities = Array.from(new Set(suppliers.map(s => s.txt_City).filter(Boolean)));

  const filteredSuppliers = suppliers
    .filter((s) => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        (s.txt_Supplier_Name && s.txt_Supplier_Name.toLowerCase().includes(term)) ||
        (s.txt_Supplier_Code && s.txt_Supplier_Code.toLowerCase().includes(term)) ||
        (s.txt_Contact_Person && s.txt_Contact_Person.toLowerCase().includes(term)) ||
        (s.txt_City && s.txt_City.toLowerCase().includes(term));

      const matchStatus = !statusFilter || s.txt_Approval_Status === statusFilter;
      const matchCity = !selectedCity || s.txt_City === selectedCity;
      return matchSearch && matchStatus && matchCity;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return (a.txt_Supplier_Name || '').localeCompare(b.txt_Supplier_Name || '');
      if (sortBy === 'code') return (a.txt_Supplier_Code || '').localeCompare(b.txt_Supplier_Code || '');
      if (sortBy === 'status') return (a.txt_Approval_Status || '').localeCompare(b.txt_Approval_Status || '');
      return 0;
    });

  if (loading) {
    return (
      <MainLayout>
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading dashboard metrics...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ marginBottom: '28px' }}>
        <h2>Admin Overview & System Health</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Real-time statistics dynamically calculated from MySQL</p>
      </div>

      <div className="metrics-grid" style={{ marginBottom: '32px' }}>
        <StatCard icon={Users} label="Registered Builders" value={stats?.totalBuilders || 0} color="#2563eb" bgColor="#eff6ff" />
        <StatCard icon={Store} label="Total Suppliers" value={stats?.totalSuppliers || 0} color="#059669" bgColor="#ecfdf5" />
        <StatCard icon={AlertTriangle} label="Pending Supplier Approvals" value={stats?.pendingSupplierApprovals || 0} color="#d97706" bgColor="#fffbeb" />
        <StatCard icon={CheckCircle2} label="Approved Suppliers" value={stats?.approvedSuppliers || 0} color="#10b981" bgColor="#ecfdf5" />
        <StatCard icon={FileText} label="Total RFQs Posted" value={stats?.totalRFQs || 0} color="#7c3aed" bgColor="#f5f3ff" />
        <StatCard icon={ShoppingCart} label="Purchase Orders" value={stats?.totalPurchaseOrders || 0} color="#2563eb" bgColor="#eff6ff" />
        <StatCard icon={CreditCard} label="Procurement Value" value={`₹${(stats?.procurementValue || 0).toLocaleString('en-IN')}`} color="#059669" bgColor="#ecfdf5" />
        <StatCard icon={CreditCard} label="Pending Payments" value={`₹${(stats?.pendingPayments || 0).toLocaleString('en-IN')}`} color="#dc2626" bgColor="#fef2f2" />
      </div>

      {/* Supplier Management Quick Table */}
      <div className="table-card">
        <div className="table-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h4>Supplier Network Directory</h4>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Search and monitor registered platform vendors</p>
          </div>
          <Link to="/admin/suppliers" className="btn btn-outline" style={{ fontSize: '0.82rem', padding: '6px 12px' }}>
            Manage Approvals <ArrowRight size={14} />
          </Link>
        </div>

        {/* Search & Filters */}
        <div style={{ padding: '0 24px 20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '38px' }}
              placeholder="Search supplier by name, code, contact, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select className="form-control" style={{ width: '180px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>

          {uniqueCities.length > 0 && (
            <select className="form-control" style={{ width: '160px' }} value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
              <option value="">All Cities ({uniqueCities.length})</option>
              {uniqueCities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}

          <select className="form-control" style={{ width: '160px' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Sort by Name</option>
            <option value="code">Sort by Code</option>
            <option value="status">Sort by Status</option>
          </select>

          {(searchTerm || statusFilter || selectedCity) && (
            <button className="btn btn-outline" onClick={() => { setSearchTerm(''); setStatusFilter(''); setSelectedCity(''); }}>
              Clear Filters
            </button>
          )}
        </div>

        {filteredSuppliers.length === 0 ? (
          <div className="empty-state">
            <Store size={48} className="empty-state-icon" />
            <h4>No suppliers found</h4>
            <p>{searchTerm || statusFilter || selectedCity ? 'Try clearing your search or filter filters.' : 'No suppliers registered in the database.'}</p>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Supplier Name</th>
                <th>Contact Person</th>
                <th>City</th>
                <th>Delivery Radius</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((s) => (
                <tr key={s.int_Supplier_Id}>
                  <td style={{ fontWeight: 600 }}>{s.txt_Supplier_Code}</td>
                  <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{s.txt_Supplier_Name}</td>
                  <td>{s.txt_Contact_Person}</td>
                  <td>{s.txt_City}, {s.txt_State}</td>
                  <td>{s.num_Delivery_Radius_KM} KM</td>
                  <td><StatusBadge status={s.txt_Approval_Status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
