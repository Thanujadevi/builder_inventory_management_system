import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import StatusBadge from '../../components/StatusBadge';
import api from '../../services/api';
import { FileText, Sparkles, ShoppingBag, Search, Filter } from 'lucide-react';

const RFQDetails = () => {
  const { id } = useParams();
  const [rfq, setRfq] = useState(null);
  const [items, setItems] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter states
  const [itemSearch, setItemSearch] = useState('');
  const [quoteSearch, setQuoteSearch] = useState('');
  const [quoteSort, setQuoteSort] = useState('price_asc');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [rfqRes, quoRes] = await Promise.all([
          api.get(`/requirements/${id}`),
          api.get(`/quotations/requirement/${id}`)
        ]);
        setRfq(rfqRes.data.requirement);
        setItems(rfqRes.data.items || []);
        setQuotations(quoRes.data.quotations || []);
      } catch (error) {
        console.error('Failed to load RFQ details:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading RFQ details...</div>
      </MainLayout>
    );
  }

  if (!rfq) {
    return (
      <MainLayout>
        <div style={{ padding: '40px', textAlign: 'center' }}>RFQ not found.</div>
      </MainLayout>
    );
  }

  const filteredItems = items.filter((item) => {
    if (!itemSearch) return true;
    const term = itemSearch.toLowerCase();
    return (
      (item.txt_Product_Name && item.txt_Product_Name.toLowerCase().includes(term)) ||
      (item.txt_Category_Name && item.txt_Category_Name.toLowerCase().includes(term)) ||
      (item.txt_Required_Spec && item.txt_Required_Spec.toLowerCase().includes(term))
    );
  });

  const filteredQuotations = quotations
    .filter((q) => {
      if (!quoteSearch) return true;
      const term = quoteSearch.toLowerCase();
      return (
        (q.txt_Quotation_Code && q.txt_Quotation_Code.toLowerCase().includes(term)) ||
        (q.txt_Supplier_Name && q.txt_Supplier_Name.toLowerCase().includes(term)) ||
        (q.txt_City && q.txt_City.toLowerCase().includes(term))
      );
    })
    .sort((a, b) => {
      if (quoteSort === 'price_asc') return parseFloat(a.num_Total_Amount) - parseFloat(b.num_Total_Amount);
      if (quoteSort === 'price_desc') return parseFloat(b.num_Total_Amount) - parseFloat(a.num_Total_Amount);
      if (quoteSort === 'days') return (a.num_Delivery_Days || 0) - (b.num_Delivery_Days || 0);
      if (quoteSort === 'rating') return parseFloat(b.supplier_rating || 0) - parseFloat(a.supplier_rating || 0);
      return 0;
    });

  return (
    <MainLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2>{rfq.txt_Requirement_Title}</h2>
            <StatusBadge status={rfq.txt_Status} />
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>RFQ Code: {rfq.txt_Requirement_Code} | Project: {rfq.txt_Project_Name}</p>
        </div>

        {quotations.length > 0 && (
          <Link to={`/builder/recommendations/${rfq.int_Requirement_Id}`} className="btn btn-primary">
            <Sparkles size={18} /> View Smart Supplier Recommendation ({quotations.length} Quotes)
          </Link>
        )}
      </div>

      <div className="table-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h4 style={{ marginBottom: '16px' }}>Requirement Overview</h4>
        <div className="form-grid">
          <div><strong>Delivery City:</strong> {rfq.txt_City} ({rfq.txt_Pincode})</div>
          <div><strong>Delivery Address:</strong> {rfq.txt_Delivery_Location}</div>
          <div><strong>Required Delivery Date:</strong> {new Date(rfq.dte_Required_Delivery_Date).toLocaleDateString()}</div>
          <div><strong>Priority:</strong> {rfq.txt_Priority}</div>
        </div>
      </div>

      {/* Requested Material Items Section */}
      <div className="table-card" style={{ marginBottom: '24px' }}>
        <div className="table-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <h4>Requested Material Items ({items.length})</h4>
          <div style={{ position: 'relative', width: '250px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '32px', fontSize: '0.85rem' }}
              placeholder="Search items..."
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
            />
          </div>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Material</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Specification</th>
              <th>Max Price</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, index) => (
              <tr key={item.int_Req_Item_Id}>
                <td>{index + 1}</td>
                <td style={{ fontWeight: 600 }}>{item.txt_Product_Name}</td>
                <td><span className="badge badge-open">{item.txt_Category_Name}</span></td>
                <td style={{ fontWeight: 700 }}>{item.num_Quantity}</td>
                <td>{item.txt_Unit_Name}</td>
                <td>{item.txt_Required_Spec || '-'}</td>
                <td>{item.num_Max_Acceptable_Price ? `₹${parseFloat(item.num_Max_Acceptable_Price).toLocaleString('en-IN')}` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Submitted Supplier Quotations Section */}
      <div className="table-card">
        <div className="table-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <h4>Submitted Supplier Quotations ({quotations.length})</h4>
          {quotations.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '220px' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '32px', fontSize: '0.85rem' }}
                  placeholder="Search supplier..."
                  value={quoteSearch}
                  onChange={(e) => setQuoteSearch(e.target.value)}
                />
              </div>
              <select className="form-control" style={{ width: '170px', fontSize: '0.85rem' }} value={quoteSort} onChange={(e) => setQuoteSort(e.target.value)}>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="days">Fastest Delivery</option>
                <option value="rating">Highest Rating</option>
              </select>
            </div>
          )}
        </div>

        {quotations.length === 0 ? (
          <div className="empty-state">
            <ShoppingBag size={48} className="empty-state-icon" />
            <h4>No quotations received yet</h4>
            <p>Matching suppliers will view this RFQ and submit their competitive quotations.</p>
          </div>
        ) : filteredQuotations.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No quotations match "{quoteSearch}".
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Supplier Name</th>
                <th>City</th>
                <th>Total Price (₹)</th>
                <th>Delivery Days</th>
                <th>Coverage</th>
                <th>Rating</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotations.map((q) => (
                <tr key={q.int_Quotation_Id}>
                  <td style={{ fontWeight: 600 }}>{q.txt_Quotation_Code}</td>
                  <td style={{ fontWeight: 600 }}>{q.txt_Supplier_Name}</td>
                  <td>{q.txt_City}</td>
                  <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>₹{parseFloat(q.num_Total_Amount).toLocaleString('en-IN')}</td>
                  <td>{q.num_Delivery_Days} Days</td>
                  <td><span className="badge badge-approved">{q.num_Coverage_Percent}%</span></td>
                  <td>⭐ {parseFloat(q.supplier_rating).toFixed(1)} / 5.0</td>
                  <td><StatusBadge status={q.txt_Status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </MainLayout>
  );
};

export default RFQDetails;
