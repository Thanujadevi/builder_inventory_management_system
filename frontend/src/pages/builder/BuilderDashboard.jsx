import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import api from '../../services/api';
import { Building2, FileText, ShoppingCart, CreditCard, Layers, ArrowRight, Search, Filter, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const BuilderDashboard = () => {
  const [stats, setStats] = useState(null);
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');

  const fetchData = async () => {
    try {
      const [dashRes, rfqRes] = await Promise.all([
        api.get('/dashboards/builder'),
        api.get('/requirements')
      ]);
      setStats(dashRes.data.stats || {});
      setRfqs(rfqRes.data.requirements || []);
    } catch (error) {
      console.error('Failed to load builder dashboard:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredRfqs = rfqs
    .filter((r) => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        (r.txt_Requirement_Title && r.txt_Requirement_Title.toLowerCase().includes(term)) ||
        (r.txt_Requirement_Code && r.txt_Requirement_Code.toLowerCase().includes(term)) ||
        (r.txt_Project_Name && r.txt_Project_Name.toLowerCase().includes(term)) ||
        (r.txt_City && r.txt_City.toLowerCase().includes(term));

      const matchStatus = !statusFilter || r.txt_Status === statusFilter;
      const matchPriority = !priorityFilter || r.txt_Priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.dte_Created_Date || b.dte_Required_Delivery_Date) - new Date(a.dte_Created_Date || a.dte_Required_Delivery_Date);
      if (sortBy === 'title') return (a.txt_Requirement_Title || '').localeCompare(b.txt_Requirement_Title || '');
      if (sortBy === 'project') return (a.txt_Project_Name || '').localeCompare(b.txt_Project_Name || '');
      return 0;
    });

  if (loading) {
    return (
      <MainLayout>
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading builder workspace...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>Builder Procurement Control Panel</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Project procurement performance, material requirements & RFQ tracking</p>
        </div>
        <Link to="/builder/rfqs/new" className="btn btn-primary">
          <Plus size={18} /> Post New Material RFQ
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="metrics-grid" style={{ marginBottom: '32px' }}>
        <StatCard icon={Building2} label="Active Projects" value={`${stats?.activeProjects || 0} / ${stats?.totalProjects || 0}`} color="#2563eb" bgColor="#eff6ff" />
        <StatCard icon={FileText} label="Material RFQs Submitted" value={stats?.totalRFQs || 0} color="#7c3aed" bgColor="#f5f3ff" />
        <StatCard icon={ShoppingCart} label="Pending Quotation Reviews" value={stats?.pendingQuotations || 0} color="#d97706" bgColor="#fffbeb" />
        <StatCard icon={ShoppingCart} label="Purchase Orders Issued" value={stats?.totalPurchaseOrders || 0} color="#059669" bgColor="#ecfdf5" />
        <StatCard icon={CreditCard} label="Total Procurement Value" value={`₹${(stats?.totalProcurementValue || 0).toLocaleString('en-IN')}`} color="#2563eb" bgColor="#eff6ff" />
        <StatCard icon={CreditCard} label="Amount Paid" value={`₹${(stats?.amountPaid || 0).toLocaleString('en-IN')}`} color="#10b981" bgColor="#ecfdf5" />
        <StatCard icon={CreditCard} label="Pending Balance" value={`₹${(stats?.pendingPayment || 0).toLocaleString('en-IN')}`} color="#dc2626" bgColor="#fef2f2" />
        <StatCard icon={Layers} label="Project Inventory Units" value={stats?.inventorySummaryUnits || 0} color="#0284c7" bgColor="#f0f9ff" />
      </div>

      {/* Material RFQs Table Section */}
      <div className="table-card">
        <div className="table-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h4>Material Requirements / RFQs</h4>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Track supplier quotations, recommendations, and status updates</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div style={{ padding: '0 24px 20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '38px' }}
              placeholder="Search RFQ by title, code, site project, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select className="form-control" style={{ width: '180px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="OPEN">OPEN (Awaiting Quotes)</option>
            <option value="QUOTATION_SUBMITTED">QUOTATION SUBMITTED</option>
            <option value="CLOSED">CLOSED</option>
          </select>

          <select className="form-control" style={{ width: '150px' }} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="">All Priorities</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>

          <select className="form-control" style={{ width: '160px' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
            <option value="project">Sort by Project</option>
          </select>

          {(searchTerm || statusFilter || priorityFilter) && (
            <button className="btn btn-outline" onClick={() => { setSearchTerm(''); setStatusFilter(''); setPriorityFilter(''); }}>
              Clear Filters
            </button>
          )}
        </div>

        {filteredRfqs.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} className="empty-state-icon" />
            <h4>No material requirements found</h4>
            <p>{searchTerm || statusFilter || priorityFilter ? 'Try clearing your search or filter criteria.' : 'Create an RFQ to invite quotations from verified suppliers.'}</p>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Project Site</th>
                <th>Required Delivery</th>
                <th>Items</th>
                <th>Quotations</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRfqs.map((rfq) => (
                <tr key={rfq.int_Requirement_Id}>
                  <td style={{ fontWeight: 600 }}>{rfq.txt_Requirement_Code}</td>
                  <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{rfq.txt_Requirement_Title}</td>
                  <td>{rfq.txt_Project_Name || 'Central Site'} ({rfq.txt_City})</td>
                  <td>{new Date(rfq.dte_Required_Delivery_Date).toLocaleDateString()}</td>
                  <td><span className="badge badge-open">{rfq.item_count || 1} Items</span></td>
                  <td>
                    <span style={{ fontWeight: 700, color: (rfq.quotation_count || 0) > 0 ? 'var(--color-success)' : 'inherit' }}>
                      {rfq.quotation_count || 0} Quotes
                    </span>
                  </td>
                  <td><StatusBadge status={rfq.txt_Status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link to={`/builder/rfqs/${rfq.int_Requirement_Id}`} className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.78rem' }}>
                        View Details
                      </Link>
                      {(rfq.quotation_count || 0) > 0 && (
                        <Link to={`/builder/recommendations/${rfq.int_Requirement_Id}`} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.78rem' }}>
                          Compare & Rec
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </MainLayout>
  );
};

export default BuilderDashboard;
