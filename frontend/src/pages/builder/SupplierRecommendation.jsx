import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import StatusBadge from '../../components/StatusBadge';
import api from '../../services/api';
import { Sparkles, CheckCircle2, ShoppingCart, Info, Award, Search, Filter } from 'lucide-react';

const SupplierRecommendation = () => {
  const { reqId } = useParams();
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submittingPO, setSubmittingPO] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendation = async () => {
      try {
        const response = await api.get(`/recommendations/requirement/${reqId}`);
        setRecommendation(response.data);
      } catch (error) {
        console.error('Failed to calculate recommendation:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendation();
  }, [reqId]);

  const handleAcceptQuotation = async (quotationId) => {
    if (!window.confirm('Accept this quotation and generate a Purchase Order?')) return;
    setSubmittingPO(true);
    try {
      const today = new Date();
      today.setDate(today.getDate() + 7);
      const deliveryDate = today.toISOString().split('T')[0];

      const response = await api.post('/purchase-orders', {
        quotationId,
        expectedDeliveryDate: deliveryDate,
        deliveryLocation: 'Construction Site Address',
        terms: '30 Days Net Payment'
      });

      alert(`Purchase Order ${response.data.poCode} generated successfully!`);
      navigate('/builder/orders');
    } catch (error) {
      alert(`Failed to create PO: ${error.message}`);
    } finally {
      setSubmittingPO(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div style={{ padding: '40px', textAlign: 'center' }}>Calculating Smart Supplier Recommendation...</div>
      </MainLayout>
    );
  }

  if (!recommendation || !recommendation.hasQuotations) {
    return (
      <MainLayout>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h4>No submitted quotations available to calculate recommendation.</h4>
        </div>
      </MainLayout>
    );
  }

  const topRec = recommendation.recommendations[0];

  return (
    <MainLayout>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles color="#2563eb" size={28} />
          <h2>Smart Supplier Recommendation Engine</h2>
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          Multi-criteria scoring model evaluating Price (30%), Delivery Speed (20%), Rating (15%), Stock (15%), MOQ (10%), Location (5%), and Specs (5%).
        </p>
      </div>

      {/* Prominent Recommended Supplier Card */}
      {topRec && (
        <div className="recommendation-card">
          <div className="recommendation-badge">
            <Award size={14} style={{ display: 'inline', marginRight: '4px' }} /> Recommended Supplier
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--color-dark)', marginBottom: '4px' }}>
                {topRec.supplierName}
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
                Quotation Code: <strong>{topRec.quotationCode}</strong> | Total Amount: <strong style={{ color: 'var(--color-primary)' }}>₹{topRec.totalAmount.toLocaleString('en-IN')}</strong>
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
                {topRec.overallScore} <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}>/ 100</span>
              </div>
              <span className="badge badge-approved">Overall Score Match</span>
            </div>
          </div>

          {/* Score Breakdown Progress Bars */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600 }}>
                <span>Price Match (30%)</span> <span>{topRec.scoreBreakdown.priceScore}%</span>
              </div>
              <div className="score-bar-wrapper">
                <div className="score-bar-bg"><div className="score-bar-fill" style={{ width: `${topRec.scoreBreakdown.priceScore}%` }}></div></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600 }}>
                <span>Delivery Speed (20%)</span> <span>{topRec.scoreBreakdown.deliveryScore}%</span>
              </div>
              <div className="score-bar-wrapper">
                <div className="score-bar-bg"><div className="score-bar-fill" style={{ width: `${topRec.scoreBreakdown.deliveryScore}%` }}></div></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600 }}>
                <span>Supplier Rating (15%)</span> <span>{topRec.scoreBreakdown.ratingScore}%</span>
              </div>
              <div className="score-bar-wrapper">
                <div className="score-bar-bg"><div className="score-bar-fill" style={{ width: `${topRec.scoreBreakdown.ratingScore}%` }}></div></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600 }}>
                <span>Stock Availability (15%)</span> <span>{topRec.scoreBreakdown.stockScore}%</span>
              </div>
              <div className="score-bar-wrapper">
                <div className="score-bar-bg"><div className="score-bar-fill" style={{ width: `${topRec.scoreBreakdown.stockScore}%` }}></div></div>
              </div>
            </div>
          </div>

          {/* Transparent Plain-Language Reasons */}
          <div style={{ marginTop: '20px', padding: '14px 18px', backgroundColor: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1' }}>
            <h5 style={{ marginBottom: '8px', color: 'var(--color-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Info size={16} color="#2563eb" /> Why this supplier was recommended:
            </h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' }}>
              {topRec.reasons.map((r, i) => (
                <div key={i} style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: 500 }}>{r}</div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" style={{ padding: '12px 24px' }} onClick={() => handleAcceptQuotation(topRec.quotationId)} disabled={submittingPO}>
              <ShoppingCart size={18} /> Accept Recommendation & Generate Purchase Order
            </button>
          </div>
        </div>
      )}

      {/* Supplier Comparison Table */}
      <div className="table-card">
        <div className="table-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <h4>Full Supplier Quotation Comparison Table</h4>
        </div>

        <div style={{ padding: '0 24px 20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '38px' }}
              placeholder="Search supplier name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select className="form-control" style={{ width: '180px' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="score">Sort by Overall Score</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="delivery">Fastest Delivery</option>
          </select>

          {searchTerm && (
            <button className="btn btn-outline" onClick={() => setSearchTerm('')}>Clear</button>
          )}
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Supplier Name</th>
              <th>Total Price (₹)</th>
              <th>Delivery</th>
              <th>Stock</th>
              <th>MOQ</th>
              <th>Overall Score</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {recommendation.recommendations
              .filter((rec) => !searchTerm || rec.supplierName.toLowerCase().includes(searchTerm.toLowerCase()))
              .sort((a, b) => {
                if (sortBy === 'score') return b.overallScore - a.overallScore;
                if (sortBy === 'price_asc') return a.totalAmount - b.totalAmount;
                if (sortBy === 'price_desc') return b.totalAmount - a.totalAmount;
                if (sortBy === 'delivery') return a.deliveryDays - b.deliveryDays;
                return 0;
              })
              .map((rec, idx) => (
                <tr key={rec.quotationId} style={{ backgroundColor: idx === 0 && !searchTerm ? '#f0f9ff' : 'transparent' }}>
                  <td style={{ fontWeight: 700 }}>
                    {idx === 0 && !searchTerm ? <span className="badge badge-approved">#1 Rec</span> : `#${idx + 1}`}
                  </td>
                  <td style={{ fontWeight: 600 }}>{rec.supplierName}</td>
                  <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>₹{rec.totalAmount.toLocaleString('en-IN')}</td>
                  <td>{rec.deliveryDays} Days</td>
                  <td>{rec.scoreBreakdown.stockScore}%</td>
                  <td>{rec.scoreBreakdown.moqScore}%</td>
                  <td>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: idx === 0 ? '#2563eb' : 'inherit' }}>
                      {rec.overallScore} / 100
                    </div>
                  </td>
                  <td>
                    <button className={`btn ${idx === 0 ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleAcceptQuotation(rec.quotationId)} disabled={submittingPO}>
                      Select & Issue PO
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
};

export default SupplierRecommendation;
