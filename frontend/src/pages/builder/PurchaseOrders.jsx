import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import StatusBadge from '../../components/StatusBadge';
import api from '../../services/api';
import { ShoppingCart, Search, Filter } from 'lucide-react';

const PurchaseOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deliveryFilter, setDeliveryFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');

  const fetchOrders = async () => {
    try {
      const response = await api.get('/purchase-orders');
      setOrders(response.data.purchaseOrders || []);
    } catch (error) {
      console.error('Failed to load purchase orders:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders
    .filter((po) => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        (po.txt_PO_Code && po.txt_PO_Code.toLowerCase().includes(term)) ||
        (po.txt_Project_Name && po.txt_Project_Name.toLowerCase().includes(term)) ||
        (po.txt_Supplier_Name && po.txt_Supplier_Name.toLowerCase().includes(term));

      const matchDelivery = !deliveryFilter || po.txt_Status === deliveryFilter;
      const matchPayment = !paymentFilter || po.txt_Payment_Status === paymentFilter;
      return matchSearch && matchDelivery && matchPayment;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.dte_PO_Date) - new Date(a.dte_PO_Date);
      if (sortBy === 'amount') return parseFloat(b.num_Total_Amount || 0) - parseFloat(a.num_Total_Amount || 0);
      if (sortBy === 'supplier') return (a.txt_Supplier_Name || '').localeCompare(b.txt_Supplier_Name || '');
      if (sortBy === 'project') return (a.txt_Project_Name || '').localeCompare(b.txt_Project_Name || '');
      return 0;
    });

  return (
    <MainLayout>
      <div style={{ marginBottom: '24px' }}>
        <h2>Purchase Orders & Delivery Status</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Track issued purchase orders, supplier delivery progress, and payment status</p>
      </div>

      {/* Search and Filters Bar */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '38px' }}
            placeholder="Search by PO code, project, supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select className="form-control" style={{ width: '180px' }} value={deliveryFilter} onChange={(e) => setDeliveryFilter(e.target.value)}>
          <option value="">All Delivery Statuses</option>
          <option value="ISSUED">ISSUED</option>
          <option value="ACCEPTED">ACCEPTED</option>
          <option value="PROCESSING">PROCESSING</option>
          <option value="DISPATCHED">DISPATCHED</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>

        <select className="form-control" style={{ width: '180px' }} value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
          <option value="">All Payment Statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="PARTIALLY_PAID">PARTIALLY PAID</option>
          <option value="PAID">PAID</option>
        </select>

        <select className="form-control" style={{ width: '160px' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="date">Sort by Date</option>
          <option value="amount">Sort by Amount</option>
          <option value="supplier">Sort by Supplier</option>
          <option value="project">Sort by Project</option>
        </select>

        {(searchTerm || deliveryFilter || paymentFilter) && (
          <button className="btn btn-outline" onClick={() => { setSearchTerm(''); setDeliveryFilter(''); setPaymentFilter(''); }}>
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
            <p>{searchTerm || deliveryFilter || paymentFilter ? 'Try clearing your search or filter parameters.' : 'Accept a supplier quotation to generate your first Purchase Order.'}</p>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>PO Code</th>
                <th>Project</th>
                <th>Supplier</th>
                <th>Order Date</th>
                <th>Total Amount (₹)</th>
                <th>Paid (₹)</th>
                <th>Delivery Status</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((po) => (
                <tr key={po.int_PO_Id}>
                  <td style={{ fontWeight: 600 }}>{po.txt_PO_Code}</td>
                  <td>{po.txt_Project_Name}</td>
                  <td style={{ fontWeight: 600 }}>{po.txt_Supplier_Name}</td>
                  <td>{new Date(po.dte_PO_Date).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>₹{parseFloat(po.num_Total_Amount).toLocaleString('en-IN')}</td>
                  <td style={{ fontWeight: 600, color: 'var(--color-success)' }}>₹{parseFloat(po.total_paid).toLocaleString('en-IN')}</td>
                  <td><StatusBadge status={po.txt_Status} /></td>
                  <td><StatusBadge status={po.txt_Payment_Status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </MainLayout>
  );
};

export default PurchaseOrders;
