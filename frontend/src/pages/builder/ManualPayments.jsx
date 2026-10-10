import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import api from '../../services/api';
import { CreditCard, Plus, Search, Filter } from 'lucide-react';

const ManualPayments = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [balanceFilter, setBalanceFilter] = useState('');
  const [sortBy, setSortBy] = useState('balance');

  const [formData, setFormData] = useState({
    poId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: 'Bank Transfer',
    transactionReference: '',
    remarks: ''
  });

  const fetchData = async () => {
    try {
      const response = await api.get('/purchase-orders');
      const poList = response.data.purchaseOrders || [];
      setOrders(poList);
      if (poList.length > 0) {
        setFormData(prev => ({ ...prev, poId: poList[0].int_PO_Id }));
      }
    } catch (error) {
      console.error('Failed to load orders for payment:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedPO = orders.find(o => o.int_PO_Id.toString() === formData.poId?.toString());

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/payments', formData);
      alert('Payment recorded successfully!');
      setShowModal(false);
      setFormData({ poId: orders.length > 0 ? orders[0].int_PO_Id : '', amount: '', paymentDate: new Date().toISOString().split('T')[0], paymentMode: 'Bank Transfer', transactionReference: '', remarks: '' });
      fetchData();
    } catch (error) {
      alert(`Payment record failed: ${error.message}`);
    }
  };

  const filteredOrders = orders
    .filter((o) => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        (o.txt_PO_Code && o.txt_PO_Code.toLowerCase().includes(term)) ||
        (o.txt_Supplier_Name && o.txt_Supplier_Name.toLowerCase().includes(term));

      const matchStatus = !statusFilter || o.txt_Payment_Status === statusFilter;
      const matchBalance =
        !balanceFilter ||
        (balanceFilter === 'PENDING' && o.remaining_balance > 0) ||
        (balanceFilter === 'SETTLED' && o.remaining_balance <= 0);

      return matchSearch && matchStatus && matchBalance;
    })
    .sort((a, b) => {
      if (sortBy === 'balance') return (b.remaining_balance || 0) - (a.remaining_balance || 0);
      if (sortBy === 'total') return parseFloat(b.num_Total_Amount || 0) - parseFloat(a.num_Total_Amount || 0);
      if (sortBy === 'paid') return parseFloat(b.total_paid || 0) - parseFloat(a.total_paid || 0);
      if (sortBy === 'supplier') return (a.txt_Supplier_Name || '').localeCompare(b.txt_Supplier_Name || '');
      return 0;
    });

  return (
    <MainLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>Manual Payment Logging</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Record milestone and full manual payments against active Purchase Orders</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Record New Payment
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '38px' }}
            placeholder="Search by PO code, supplier name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select className="form-control" style={{ width: '180px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Payment Statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="PARTIALLY_PAID">PARTIALLY PAID</option>
          <option value="PAID">PAID</option>
        </select>

        <select className="form-control" style={{ width: '180px' }} value={balanceFilter} onChange={(e) => setBalanceFilter(e.target.value)}>
          <option value="">All Balance States</option>
          <option value="PENDING">Has Outstanding Balance</option>
          <option value="SETTLED">Fully Settled (₹0 Bal)</option>
        </select>

        <select className="form-control" style={{ width: '170px' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="balance">Sort by Balance</option>
          <option value="total">Sort by PO Total</option>
          <option value="paid">Sort by Total Paid</option>
          <option value="supplier">Sort by Supplier</option>
        </select>

        {(searchTerm || statusFilter || balanceFilter) && (
          <button className="btn btn-outline" onClick={() => { setSearchTerm(''); setStatusFilter(''); setBalanceFilter(''); }}>
            Clear Filters
          </button>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: 'var(--radius-lg)', padding: '28px', width: '100%', maxWidth: '520px' }}>
            <h3 style={{ marginBottom: '16px' }}>Record Manual Payment</h3>
            <form onSubmit={handleRecordPayment}>
              <div className="form-group">
                <label>Select Purchase Order *</label>
                <select className="form-control" value={formData.poId} onChange={(e) => setFormData({ ...formData, poId: e.target.value })} required>
                  {orders.map((o) => (
                    <option key={o.int_PO_Id} value={o.int_PO_Id}>
                      {o.txt_PO_Code} - {o.txt_Supplier_Name} (Bal: ₹{o.remaining_balance?.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              {selectedPO && (
                <div style={{ padding: '12px 16px', backgroundColor: 'var(--color-primary-light)', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem' }}>
                  <div>Total PO Amount: <strong>₹{parseFloat(selectedPO.num_Total_Amount).toLocaleString('en-IN')}</strong></div>
                  <div>Remaining Outstanding: <strong style={{ color: 'var(--color-danger)' }}>₹{selectedPO.remaining_balance?.toLocaleString('en-IN')}</strong></div>
                </div>
              )}

              <div className="form-group">
                <label>Payment Amount (₹) *</label>
                <input type="number" step="0.01" className="form-control" placeholder="40000" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required min={1} max={selectedPO?.remaining_balance} />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Payment Date *</label>
                  <input type="date" className="form-control" value={formData.paymentDate} onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })} required />
                </div>

                <div className="form-group">
                  <label>Payment Mode *</label>
                  <select className="form-control" value={formData.paymentMode} onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Transaction Reference / Cheque No</label>
                <input type="text" className="form-control" placeholder="e.g. UTR12345678" value={formData.transactionReference} onChange={(e) => setFormData({ ...formData, transactionReference: e.target.value })} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Payment Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading payment records...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <CreditCard size={48} className="empty-state-icon" />
            <h4>No purchase orders found</h4>
            <p>{searchTerm || statusFilter || balanceFilter ? 'Try clearing your search or filter filters.' : 'No purchase orders available to record payments against.'}</p>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>PO Code</th>
                <th>Supplier Name</th>
                <th>PO Total (₹)</th>
                <th>Total Paid (₹)</th>
                <th>Outstanding Balance (₹)</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o.int_PO_Id}>
                  <td style={{ fontWeight: 600 }}>{o.txt_PO_Code}</td>
                  <td style={{ fontWeight: 600 }}>{o.txt_Supplier_Name}</td>
                  <td>₹{parseFloat(o.num_Total_Amount).toLocaleString('en-IN')}</td>
                  <td style={{ fontWeight: 700, color: 'var(--color-success)' }}>₹{parseFloat(o.total_paid).toLocaleString('en-IN')}</td>
                  <td style={{ fontWeight: 700, color: o.remaining_balance > 0 ? 'var(--color-danger)' : 'inherit' }}>
                    ₹{o.remaining_balance?.toLocaleString('en-IN')}
                  </td>
                  <td><span className={`badge badge-${o.txt_Payment_Status.toLowerCase()}`}>● {o.txt_Payment_Status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </MainLayout>
  );
};

export default ManualPayments;
