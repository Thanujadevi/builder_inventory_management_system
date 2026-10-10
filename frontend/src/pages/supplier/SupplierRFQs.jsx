import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import StatusBadge from '../../components/StatusBadge';
import api from '../../services/api';
import { FileSpreadsheet, ArrowRight, Search, Filter } from 'lucide-react';

const SupplierRFQs = () => {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    const fetchRFQs = async () => {
      try {
        const response = await api.get('/requirements');
        setRfqs(response.data.requirements || []);
      } catch (error) {
        console.error('Failed to load RFQs:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRFQs();
  }, []);

  const uniqueCities = Array.from(new Set(rfqs.map(r => r.txt_City).filter(Boolean)));

  const filteredRfqs = rfqs
    .filter((rfq) => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        (rfq.txt_Requirement_Code && rfq.txt_Requirement_Code.toLowerCase().includes(term)) ||
        (rfq.txt_Requirement_Title && rfq.txt_Requirement_Title.toLowerCase().includes(term)) ||
        (rfq.builder_company_name && rfq.builder_company_name.toLowerCase().includes(term)) ||
        (rfq.txt_City && rfq.txt_City.toLowerCase().includes(term));

      const isQuotationSubmitted = 
        rfq.my_quotation_count > 0 || 
        rfq.txt_Status === 'QUOTATION_SUBMITTED' || 
        rfq.txt_Status === 'QUOTATION_RECEIVED';

      let matchStatus = true;
      if (statusFilter === 'OPEN') matchStatus = !isQuotationSubmitted && rfq.txt_Status !== 'CLOSED';
      else if (statusFilter === 'QUOTATION_SUBMITTED') matchStatus = isQuotationSubmitted;
      else if (statusFilter === 'CLOSED') matchStatus = rfq.txt_Status === 'CLOSED';

      const matchCity = !selectedCity || rfq.txt_City === selectedCity;

      return matchSearch && matchStatus && matchCity;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(a.dte_Required_Delivery_Date) - new Date(b.dte_Required_Delivery_Date);
      if (sortBy === 'title') return (a.txt_Requirement_Title || '').localeCompare(b.txt_Requirement_Title || '');
      if (sortBy === 'builder') return (a.builder_company_name || '').localeCompare(b.builder_company_name || '');
      return 0;
    });

  return (
    <MainLayout>
      <div style={{ marginBottom: '24px' }}>
        <h2>Open Builder Material RFQs</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Browse active builder requirements and submit competitive quotations</p>
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '38px' }}
            placeholder="Search RFQs by code, title, builder company, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select className="form-control" style={{ width: '190px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All RFQ Statuses</option>
          <option value="OPEN">Open (Needs My Quote)</option>
          <option value="QUOTATION_SUBMITTED">Quotation Submitted</option>
          <option value="CLOSED">Closed</option>
        </select>

        {uniqueCities.length > 0 && (
          <select className="form-control" style={{ width: '160px' }} value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
            <option value="">All Cities ({uniqueCities.length})</option>
            {uniqueCities.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}

        <select className="form-control" style={{ width: '170px' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="date">Sort by Delivery Date</option>
          <option value="title">Sort by Title</option>
          <option value="builder">Sort by Builder</option>
        </select>

        {(searchTerm || statusFilter || selectedCity) && (
          <button className="btn btn-outline" onClick={() => { setSearchTerm(''); setStatusFilter(''); setSelectedCity(''); }}>
            Clear Filters
          </button>
        )}
      </div>

      <div className="table-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading RFQs...</div>
        ) : filteredRfqs.length === 0 ? (
          <div className="empty-state">
            <FileSpreadsheet size={48} className="empty-state-icon" />
            <h4>No builder RFQs found</h4>
            <p>{searchTerm || statusFilter || selectedCity ? 'Try clearing your search or filter options.' : 'New material requirements posted by builders will appear here.'}</p>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>RFQ Code</th>
                <th>Title</th>
                <th>Builder Company</th>
                <th>City</th>
                <th>Delivery Date</th>
                <th>Items</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRfqs.map((rfq) => {
                const isQuotationSubmitted = 
                  rfq.my_quotation_count > 0 || 
                  rfq.txt_Status === 'QUOTATION_SUBMITTED' || 
                  rfq.txt_Status === 'QUOTATION_RECEIVED';
                const isClosed = rfq.txt_Status === 'CLOSED';

                return (
                  <tr key={rfq.int_Requirement_Id}>
                    <td style={{ fontWeight: 600 }}>{rfq.txt_Requirement_Code}</td>
                    <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{rfq.txt_Requirement_Title}</td>
                    <td>{rfq.builder_company_name}</td>
                    <td>{rfq.txt_City}</td>
                    <td>{new Date(rfq.dte_Required_Delivery_Date).toLocaleDateString()}</td>
                    <td><span className="badge badge-open">{rfq.item_count} Items</span></td>
                    <td>
                      <StatusBadge status={isQuotationSubmitted ? 'QUOTATION_SUBMITTED' : rfq.txt_Status} />
                    </td>
                    <td>
                      {isQuotationSubmitted ? (
                        <span 
                          className="badge badge-quotation_submitted" 
                          style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          ✓ Quotation Submitted
                        </span>
                      ) : isClosed ? (
                        <span className="badge badge-closed" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                          Closed
                        </span>
                      ) : (
                        <Link 
                          to={`/supplier/quotations/new/${rfq.int_Requirement_Id}`} 
                          className="btn btn-primary" 
                          style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                        >
                          Submit Quotation <ArrowRight size={14} />
                        </Link>
                      )}
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

export default SupplierRFQs;
