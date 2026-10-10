import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import api from '../../services/api';
import { Plus, Trash2, Send } from 'lucide-react';

const CreateRFQ = () => {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [headerData, setHeaderData] = useState({
    projectId: '',
    requirementTitle: '',
    deliveryLocation: '',
    city: '',
    pincode: '',
    requiredDeliveryDate: '',
    priority: 'MEDIUM',
    remarks: ''
  });

  const [items, setItems] = useState([
    { productId: '', categoryId: '', quantity: 100, unitId: 1, requiredSpec: '', preferredBrand: '', maxAcceptablePrice: '' }
  ]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, catRes, prodRes] = await Promise.all([
          api.get('/builders/projects'),
          api.get('/admin/categories'),
          api.get('/admin/products')
        ]);
        setProjects(projRes.data.projects);
        setCategories(catRes.data.categories);
        setProducts(prodRes.data.products);

        if (projRes.data.projects.length > 0) {
          const first = projRes.data.projects[0];
          setHeaderData(prev => ({
            ...prev,
            projectId: first.int_Project_Id,
            deliveryLocation: first.txt_Address,
            city: first.txt_City,
            pincode: first.txt_Pincode
          }));
        }
      } catch (error) {
        console.error('Failed to load RFQ master data:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleProjectChange = (e) => {
    const projId = e.target.value;
    const selected = projects.find(p => p.int_Project_Id.toString() === projId);
    if (selected) {
      setHeaderData(prev => ({
        ...prev,
        projectId: projId,
        deliveryLocation: selected.txt_Address,
        city: selected.txt_City,
        pincode: selected.txt_Pincode
      }));
    } else {
      setHeaderData(prev => ({ ...prev, projectId: projId }));
    }
  };

  const addItemRow = () => {
    setItems([
      ...items,
      { productId: '', categoryId: '', quantity: 100, unitId: 1, requiredSpec: '', preferredBrand: '', maxAcceptablePrice: '' }
    ]);
  };

  const removeItemRow = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    // Auto select category & unit if product is selected
    if (field === 'productId') {
      const selectedProd = products.find(p => p.int_Product_Id.toString() === value);
      if (selectedProd) {
        updated[index].categoryId = selectedProd.int_Category_Id;
        updated[index].unitId = selectedProd.int_Default_Unit_Id;
        updated[index].requiredSpec = selectedProd.txt_Default_Spec || '';
      }
    }

    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...headerData,
        items
      };
      const response = await api.post('/requirements', payload);
      alert('Material Requirement / RFQ published successfully!');
      navigate(`/builder/rfqs/${response.data.requirementId}`);
    } catch (error) {
      alert(`Failed to submit RFQ: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading RFQ setup...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ marginBottom: '24px' }}>
        <h2>Create Material Requirement / RFQ</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Post a complete requirement containing multiple construction materials</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="table-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h4 style={{ marginBottom: '16px' }}>1. Requirement Header Details</h4>
          <div className="form-grid">
            <div className="form-group">
              <label>Construction Project *</label>
              <select className="form-control" value={headerData.projectId} onChange={handleProjectChange} required>
                {projects.map(p => (
                  <option key={p.int_Project_Id} value={p.int_Project_Id}>{p.txt_Project_Name} ({p.txt_City})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Requirement Title *</label>
              <input type="text" className="form-control" placeholder="e.g. Structural Rebars & Bricks Procurement Phase 1" value={headerData.requirementTitle} onChange={(e) => setHeaderData({ ...headerData, requirementTitle: e.target.value })} required />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Required Delivery Date *</label>
              <input type="date" className="form-control" value={headerData.requiredDeliveryDate} onChange={(e) => setHeaderData({ ...headerData, requiredDeliveryDate: e.target.value })} required />
            </div>

            <div className="form-group">
              <label>Priority *</label>
              <select className="form-control" value={headerData.priority} onChange={(e) => setHeaderData({ ...headerData, priority: e.target.value })}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Delivery Address *</label>
              <input type="text" className="form-control" value={headerData.deliveryLocation} onChange={(e) => setHeaderData({ ...headerData, deliveryLocation: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>City *</label>
              <input type="text" className="form-control" value={headerData.city} onChange={(e) => setHeaderData({ ...headerData, city: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Pincode *</label>
              <input type="text" className="form-control" value={headerData.pincode} onChange={(e) => setHeaderData({ ...headerData, pincode: e.target.value })} required />
            </div>
          </div>
        </div>

        <div className="table-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4>2. Material Line Items</h4>
            <button type="button" className="btn btn-outline" onClick={addItemRow}>
              <Plus size={16} /> Add Material Line
            </button>
          </div>

          {items.map((item, idx) => (
            <div key={idx} style={{ padding: '16px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', marginBottom: '16px', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Item #{idx + 1}</span>
                {items.length > 1 && (
                  <button type="button" style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }} onClick={() => removeItemRow(idx)}>
                    <Trash2 size={16} /> Remove
                  </button>
                )}
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Select Material / Product *</label>
                  <select className="form-control" value={item.productId} onChange={(e) => handleItemChange(idx, 'productId', e.target.value)} required>
                    <option value="">-- Choose Material --</option>
                    {products.map(p => (
                      <option key={p.int_Product_Id} value={p.int_Product_Id}>{p.txt_Product_Name} ({p.txt_Category_Name})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Required Quantity *</label>
                  <input type="number" className="form-control" value={item.quantity} onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} required min={1} />
                </div>

                <div className="form-group">
                  <label>Unit</label>
                  <select className="form-control" value={item.unitId} onChange={(e) => handleItemChange(idx, 'unitId', e.target.value)}>
                    <option value="1">Bags</option>
                    <option value="2">Metric Ton (MT)</option>
                    <option value="3">Pieces (Pcs)</option>
                    <option value="4">Square Feet (Sq.Ft)</option>
                    <option value="5">Meters (m)</option>
                    <option value="6">Liters (L)</option>
                    <option value="10">Kilograms (kg)</option>
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Required Specification</label>
                  <input type="text" className="form-control" placeholder="e.g. Fe500 Grade, 53 Grade Cement" value={item.requiredSpec} onChange={(e) => handleItemChange(idx, 'requiredSpec', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Preferred Brand (Optional)</label>
                  <input type="text" className="form-control" placeholder="e.g. UltraTech, Tata Tiscon" value={item.preferredBrand} onChange={(e) => handleItemChange(idx, 'preferredBrand', e.target.value)} />
                </div>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px' }}>
              <Send size={18} /> Publish Material Requirement RFQ
            </button>
          </div>
        </div>
      </form>
    </MainLayout>
  );
};

export default CreateRFQ;
