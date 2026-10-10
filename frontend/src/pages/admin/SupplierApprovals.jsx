import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import StatusBadge from '../../components/StatusBadge';
import api from '../../services/api';
import { Check, X, ShieldAlert, Search, Filter } from 'lucide-react';

const SupplierApprovals = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/suppliers?approvalStatus=${filter}`);
      setSuppliers(response.data.suppliers || []);
    } catch (error) {
      console.error('Failed to load suppliers:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [filter]);

  const handleAction = async (supplierId, action) => {
    try {
      await api.put(`/admin/suppliers/${supplierId}/approve`, { action });
      fetchSuppliers();
    } catch (error) {
      alert(`Action failed: ${error.message}`);
    }
  };

  // Derive unique cities
  const uniqueCities = Array.from(new Set(suppliers.map(s => s.txt_City).filter(Boolean)));

  // Filtered & sorted list
  const filteredSuppliers = suppliers
    .filter((s) => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        (s.txt_Supplier_Name && s.txt_Supplier_Name.toLowerCase().includes(term)) ||
        (s.txt_Supplier_Code && s.txt_Supplier_Code.toLowerCase().includes(term)) ||
        (s.txt_Contact_Person && s.txt_Contact_Person.toLowerCase().includes(term)) ||
        (s.txt_GSTIN && s.txt_GSTIN.toLowerCase().includes(term)) ||
        (s.txt_City && s.txt_City.toLowerCase().includes(term)) ||
        (s.txt_Phone && s.txt_Phone.toLowerCase().includes(term));

      const matchCity = !selectedCity || s.txt_City === selectedCity;
      return matchSearch && matchCity;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return (a.txt_Supplier_Name || '').localeCompare(b.txt_Supplier_Name || '');
      if (sortBy === 'code') return (a.txt_Supplier_Code || '').localeCompare(b.txt_Supplier_Code || '');
      if (sortBy === 'city') return (a.txt_City || '').localeCompare(b.txt_City || '');
      if (sortBy === 'radius') return (b.num_Delivery_Radius_KM || 0) - (a.num_Delivery_Radius_KM || 0);
      return 0;
    });

  return (
    <MainLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>Supplier Verification & Approvals</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Review supplier KYC, GSTIN, and approve account access</p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={`btn ${filter === 'PENDING' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('PENDING')}>Pending</button>
          <button className={`btn ${filter === 'APPROVED' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('APPROVED')}>Approved</button>
          <button className={`btn ${filter === 'REJECTED' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('REJECTED')}>Rejected</button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '38px' }}
            placeholder="Search by supplier name, code, contact, GSTIN, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select className="form-control" style={{ width: '180px' }} value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
          <option value="">All Cities ({uniqueCities.length})</option>
          {uniqueCities.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select className="form-control" style={{ width: '180px' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="code">Sort by Code</option>
          <option value="city">Sort by City</option>
          <option value="radius">Sort by Delivery Radius</option>
        </select>

        {(searchTerm || selectedCity) && (
          <button className="btn btn-outline" onClick={() => { setSearchTerm(''); setSelectedCity(''); }}>
            Clear Filters
          </button>
        )}
      </div>

      <div className="table-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading suppliers...</div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="empty-state">
            <ShieldAlert size={48} className="empty-state-icon" />
            <h4>No suppliers found</h4>
            <p>
              {searchTerm || selectedCity
                ? 'No suppliers match your active search and filter criteria.'
                : `No suppliers found with status "${filter}".`}
            </p>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Supplier Name</th>
                <th>Contact Person</th>
                <th>GSTIN</th>
                <th>Location</th>
                <th>Radius</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((s) => (
                <tr key={s.int_Supplier_Id}>
                  <td style={{ fontWeight: 600 }}>{s.txt_Supplier_Code}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.txt_Supplier_Name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{s.txt_Email}</div>
                  </td>
                  <td>
                    <div>{s.txt_Contact_Person}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{s.txt_Phone}</div>
                  </td>
                  <td style={{ fontFamily: 'monospace' }}>{s.txt_GSTIN}</td>
                  <td>{s.txt_City}, {s.txt_State}</td>
                  <td>{s.num_Delivery_Radius_KM} KM</td>
                  <td><StatusBadge status={s.txt_Approval_Status} /></td>
                  <td>
                    {s.txt_Approval_Status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-success" style={{ padding: '4px 8px', fontSize: '0.78rem' }} onClick={() => handleAction(s.int_Supplier_Id, 'APPROVE')}>
                          <Check size={14} /> Approve
                        </button>
                        <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.78rem' }} onClick={() => handleAction(s.int_Supplier_Id, 'REJECT')}>
                          <X size={14} /> Reject
                        </button>
                      </div>
                    )}
                    {s.txt_Approval_Status === 'APPROVED' && (
                      <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.78rem' }} onClick={() => handleAction(s.int_Supplier_Id, 'SUSPEND')}>
                        Suspend
                      </button>
                    )}
                    {s.txt_Approval_Status === 'REJECTED' && (
                      <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.78rem' }} onClick={() => handleAction(s.int_Supplier_Id, 'APPROVE')}>
                        Re-Approve
                      </button>
                    )}
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

export default SupplierApprovals;
