import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import StatusBadge from '../../components/StatusBadge';
import api from '../../services/api';
import { ShoppingCart, Lock, Search, Filter } from 'lucide-react';

const SupplierOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');

  const fetchOrders = async () => {
    try {
      const response = await api.get('/purchase-orders');
      setOrders(response.data.purchaseOrders || []);
    } catch (error) {
      console.error('Failed to load supplier orders:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (poId, status) => {
    try {
      await api.put(`/purchase-orders/${poId}/status`, { status });
      fetchOrders();
    } catch (error) {
      alert(`Status update failed: ${error.message}`);
    }
  };

  const filteredOrders = orders
    .filter((po) => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        (po.txt_PO_Code && po.txt_PO_Code.toLowerCase().includes(term)) ||
        (po.builder_company_name && po.builder_company_name.toLowerCase().includes(term)) ||
        (po.txt_Project_Name && po.txt_Project_Name.toLowerCase().includes(term));

      const matchStatus = !statusFilter || po.txt_Status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.dte_PO_Date) - new Date(a.dte_PO_Date);
      if (sortBy === 'amount') return parseFloat(b.num_Total_Amount || 0) - parseFloat(a.num_Total_Amount || 0);
      if (sortBy === 'builder') return (a.builder_company_name || '').localeCompare(b.builder_company_name || '');
      return 0;
    });

  return (
    <MainLayout>
      <div style={{ marginBottom: '24px' }}>
        <h2>Received Purchase Orders & Dispatch Status</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Accept orders, update processing status, and mark materials as delivered</p>
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '38px' }}
            placeholder="Search by PO code, builder company, project site..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select className="form-control" style={{ width: '180px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Delivery Statuses</option>
          <option value="ISSUED">ISSUED</option>
          <option value="ACCEPTED">ACCEPTED</option>
          <option value="PROCESSING">PROCESSING</option>
          <option value="DISPATCHED">DISPATCHED</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>

        <select className="form-control" style={{ width: '160px' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="date">Sort by Date</option>
          <option value="amount">Sort by Amount</option>
          <option value="builder">Sort by Builder</option>
        </select>

        {(searchTerm || statusFilter) && (
          <button className="btn btn-outline" onClick={() => { setSearchTerm(''); setStatusFilter(''); }}>
            Clear Filters
          </button>
        )}
      </div>

      <div className="table-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <ShoppingCart size={48} className="empty-state-icon" />
            <h4>No purchase orders found</h4>
            <p>{searchTerm || statusFilter ? 'Try clearing your search or filter parameters.' : 'No purchase orders received yet.'}</p>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>PO Code</th>
                <th>Builder Company</th>
                <th>Project</th>
                <th>Total Value (₹)</th>
                <th>Order Date</th>
                <th>Delivery Status</th>
                <th>Update Delivery</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((po) => {
                const isDelivered = po.txt_Status === 'DELIVERED';
                return (
                  <tr key={po.int_PO_Id}>
                    <td style={{ fontWeight: 600 }}>{po.txt_PO_Code}</td>
                    <td style={{ fontWeight: 600 }}>{po.builder_company_name}</td>
                    <td>{po.txt_Project_Name}</td>
                    <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>₹{parseFloat(po.num_Total_Amount).toLocaleString('en-IN')}</td>
                    <td>{new Date(po.dte_PO_Date).toLocaleDateString()}</td>
                    <td><StatusBadge status={po.txt_Status} /></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <select
                          className="form-control"
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.8rem',
                            width: '135px',
                            backgroundColor: isDelivered ? '#f1f5f9' : '#fff',
                            cursor: isDelivered ? 'not-allowed' : 'pointer',
                            color: isDelivered ? '#64748b' : '#0f172a',
                            borderColor: isDelivered ? '#cbd5e1' : undefined
                          }}
                          value={po.txt_Status}
                          disabled={isDelivered}
                          onChange={(e) => handleUpdateStatus(po.int_PO_Id, e.target.value)}
                          title={isDelivered ? 'Order delivered - status locked' : 'Update delivery status'}
                        >
                          <option value="ISSUED">ISSUED</option>
                          <option value="ACCEPTED">ACCEPTED</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="DISPATCHED">DISPATCHED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                        {isDelivered && (
                          <span title="Status Locked (Delivered)" style={{ color: '#10b981', display: 'flex', alignItems: 'center' }}>
                            <Lock size={16} />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </MainLayout>
  );
};

export default SupplierOrders;
