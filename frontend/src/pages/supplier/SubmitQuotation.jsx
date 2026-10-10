import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import api from '../../services/api';
import { Send } from 'lucide-react';

const SubmitQuotation = () => {
  const { reqId } = useParams();
  const [rfq, setRfq] = useState(null);
  const [items, setItems] = useState([]);
  const [supplierProducts, setSupplierProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deliveryDays, setDeliveryDays] = useState(3);
  const [paymentTerms, setPaymentTerms] = useState('30 Days Net');
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const [remarks, setRemarks] = useState('');

  const [quoteItems, setQuoteItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rfqRes, spRes] = await Promise.all([
          api.get(`/requirements/${reqId}`),
          api.get('/suppliers/products')
        ]);
        setRfq(rfqRes.data.requirement);
        setItems(rfqRes.data.items);
        setSupplierProducts(spRes.data.products);

        // Pre-populate quotation items matching supplier catalogue base prices
        const initialQuoteItems = rfqRes.data.items.map(reqItem => {
          const matched = spRes.data.products.find(sp => sp.int_Product_Id === reqItem.int_Product_Id);
          return {
            reqItemId: reqItem.int_Req_Item_Id,
            productId: reqItem.int_Product_Id,
            productName: reqItem.txt_Product_Name,
            quantity: reqItem.num_Quantity,
            unitId: reqItem.int_Unit_Id,
            unitName: reqItem.txt_Unit_Name,
            unitPrice: matched ? parseFloat(matched.num_Base_Price) : 0,
            discountType: 'AMOUNT',
            discount: 0,
            taxType: 'AMOUNT',
            tax: 0,
            deliveryEstimateDays: 3,
            specification: matched ? matched.txt_Specification || '' : '',
            isQuoted: true // Allow partial quotation toggle
          };
        });

        setQuoteItems(initialQuoteItems);
      } catch (error) {
        console.error('Failed to load RFQ for quotation:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [reqId]);

  const handleItemChange = (index, field, value) => {
    const updated = [...quoteItems];
    updated[index][field] = value;
    setQuoteItems(updated);
  };

  const calculateItemValues = (item) => {
    const qty = parseInt(item.quantity, 10) || 0;
    const unitPrice = parseFloat(item.unitPrice || 0);
    const baseAmount = unitPrice * qty;

    const discountType = item.discountType || 'AMOUNT';
    const discountVal = parseFloat(item.discount || 0);
    let discountAmount = 0;
    if (discountType === 'PERCENTAGE') {
      discountAmount = (baseAmount * discountVal) / 100;
    } else {
      discountAmount = discountVal;
    }
    discountAmount = Math.min(baseAmount, Math.max(0, discountAmount));

    const subtotalAfterDiscount = baseAmount - discountAmount;

    const taxType = item.taxType || 'AMOUNT';
    const taxVal = parseFloat(item.tax || 0);
    let taxAmount = 0;
    if (taxType === 'PERCENTAGE') {
      taxAmount = (subtotalAfterDiscount * taxVal) / 100;
    } else {
      taxAmount = Math.max(0, taxVal);
    }

    const lineTotal = subtotalAfterDiscount + taxAmount;

    return {
      baseAmount,
      discountAmount,
      taxAmount,
      lineTotal
    };
  };

  const calculateTotal = () => {
    return quoteItems
      .filter(i => i.isQuoted)
      .reduce((acc, i) => acc + calculateItemValues(i).lineTotal, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const activeItems = quoteItems.filter(i => i.isQuoted);

    if (activeItems.length === 0) {
      alert('Please include at least one quoted material item.');
      return;
    }

    try {
      const response = await api.post('/quotations', {
        requirementId: reqId,
        deliveryDays: parseInt(deliveryDays, 10),
        paymentTerms,
        validUntil,
        remarks,
        items: activeItems.map(item => ({
          reqItemId: item.reqItemId,
          productId: item.productId,
          quantity: item.quantity,
          unitId: item.unitId,
          unitPrice: parseFloat(item.unitPrice || 0),
          discountType: item.discountType || 'AMOUNT',
          discount: parseFloat(item.discount || 0),
          taxType: item.taxType || 'AMOUNT',
          tax: parseFloat(item.tax || 0),
          deliveryEstimateDays: item.deliveryEstimateDays || deliveryDays,
          specification: item.specification || ''
        }))
      });

      alert(`Quotation ${response.data.quotationCode} submitted successfully!`);
      navigate('/supplier/rfqs');
    } catch (error) {
      alert(`Quotation submission failed: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading RFQ for quotation...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ marginBottom: '24px' }}>
        <h2>Submit B2B Quotation</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>RFQ: {rfq?.txt_Requirement_Title} ({rfq?.txt_Requirement_Code})</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="table-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h4 style={{ marginBottom: '16px' }}>1. Quotation Header & Terms</h4>
          <div className="form-grid">
            <div className="form-group">
              <label>Delivery Guarantee (Days) *</label>
              <input type="number" className="form-control" value={deliveryDays} onChange={(e) => setDeliveryDays(e.target.value)} required min={1} />
            </div>
            <div className="form-group">
              <label>Payment Terms *</label>
              <input type="text" className="form-control" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Quotation Valid Until *</label>
              <input type="date" className="form-control" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} required />
            </div>
          </div>
        </div>

        <div className="table-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h4 style={{ marginBottom: '16px' }}>2. Pricing & Partial Coverage Breakdown</h4>
          <table className="custom-table" style={{ marginBottom: '20px' }}>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Include</th>
                <th>Material</th>
                <th style={{ width: '90px' }}>Qty</th>
                <th style={{ width: '120px' }}>Unit Price (₹)</th>
                <th style={{ width: '180px' }}>Discount</th>
                <th style={{ width: '180px' }}>Tax</th>
                <th style={{ width: '130px', textAlign: 'right' }}>Line Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {quoteItems.map((item, idx) => {
                const { discountAmount, taxAmount, lineTotal } = calculateItemValues(item);
                return (
                  <tr key={idx} style={{ opacity: item.isQuoted ? 1 : 0.4 }}>
                    <td>
                      <input type="checkbox" checked={item.isQuoted} onChange={(e) => handleItemChange(idx, 'isQuoted', e.target.checked)} />
                    </td>
                    <td style={{ fontWeight: 600 }}>{item.productName}</td>
                    <td>{item.quantity} {item.unitName}</td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control"
                        style={{ width: '110px' }}
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                        disabled={!item.isQuoted}
                        required
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <select
                          className="form-control"
                          style={{ width: '85px', padding: '4px 6px', fontSize: '0.78rem' }}
                          value={item.discountType || 'AMOUNT'}
                          onChange={(e) => handleItemChange(idx, 'discountType', e.target.value)}
                          disabled={!item.isQuoted}
                        >
                          <option value="AMOUNT">Price (₹)</option>
                          <option value="PERCENTAGE">Percent (%)</option>
                        </select>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-control"
                          style={{ width: '75px', padding: '4px 6px' }}
                          value={item.discount}
                          placeholder="0"
                          onChange={(e) => handleItemChange(idx, 'discount', e.target.value)}
                          disabled={!item.isQuoted}
                        />
                      </div>
                      {item.discountType === 'PERCENTAGE' && parseFloat(item.discount || 0) > 0 && (
                        <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '2px', fontWeight: 600 }}>
                          -₹{discountAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <select
                          className="form-control"
                          style={{ width: '85px', padding: '4px 6px', fontSize: '0.78rem' }}
                          value={item.taxType || 'AMOUNT'}
                          onChange={(e) => handleItemChange(idx, 'taxType', e.target.value)}
                          disabled={!item.isQuoted}
                        >
                          <option value="AMOUNT">Price (₹)</option>
                          <option value="PERCENTAGE">Percent (%)</option>
                        </select>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-control"
                          style={{ width: '75px', padding: '4px 6px' }}
                          value={item.tax}
                          placeholder="0"
                          onChange={(e) => handleItemChange(idx, 'tax', e.target.value)}
                          disabled={!item.isQuoted}
                        />
                      </div>
                      {item.taxType === 'PERCENTAGE' && parseFloat(item.tax || 0) > 0 && (
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>
                          +₹{taxAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--color-primary)', textAlign: 'right' }}>
                      ₹{lineTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
            <div>
              Quotation Item Coverage: <strong>{quoteItems.filter(i => i.isQuoted).length} / {quoteItems.length} Items ({Math.round((quoteItems.filter(i => i.isQuoted).length / quoteItems.length) * 100)}%)</strong>
            </div>

            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              Grand Total: <span style={{ color: 'var(--color-primary)' }}>₹{calculateTotal().toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px' }}>
            <Send size={18} /> Submit Official Quotation
          </button>
        </div>
      </form>
    </MainLayout>
  );
};

export default SubmitQuotation;
