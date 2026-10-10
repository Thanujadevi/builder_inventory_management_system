import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import api from '../../services/api';
import { Package, Plus, Search, Filter } from 'lucide-react';

const MasterProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const [formData, setFormData] = useState({
    categoryId: '',
    productName: '',
    description: '',
    defaultSpec: '',
    defaultUnitId: 1
  });

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/admin/products'),
        api.get('/admin/categories')
      ]);
      setProducts(prodRes.data.products || []);
      setCategories(catRes.data.categories || []);
    } catch (error) {
      console.error('Failed to load master products:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/products', formData);
      setShowModal(false);
      setFormData({ categoryId: '', productName: '', description: '', defaultSpec: '', defaultUnitId: 1 });
      fetchData();
    } catch (error) {
      alert(`Error creating master product: ${error.message}`);
    }
  };

  const filteredProducts = products
    .filter((p) => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        (p.txt_Product_Name && p.txt_Product_Name.toLowerCase().includes(term)) ||
        (p.txt_Product_Code && p.txt_Product_Code.toLowerCase().includes(term)) ||
        (p.txt_Default_Spec && p.txt_Default_Spec.toLowerCase().includes(term)) ||
        (p.txt_Category_Name && p.txt_Category_Name.toLowerCase().includes(term));

      const matchCategory = !selectedCategory || p.int_Category_Id?.toString() === selectedCategory;
      const matchStatus = !statusFilter || p.txt_Status === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return (a.txt_Product_Name || '').localeCompare(b.txt_Product_Name || '');
      if (sortBy === 'code') return (a.txt_Product_Code || '').localeCompare(b.txt_Product_Code || '');
      if (sortBy === 'category') return (a.txt_Category_Name || '').localeCompare(b.txt_Category_Name || '');
      return 0;
    });

  return (
    <MainLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>Master Products & Materials</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Common material master listings offered across multiple suppliers</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Master Product
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
            placeholder="Search products by name, code, spec..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select className="form-control" style={{ width: '180px' }} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">All Categories ({categories.length})</option>
          {categories.map((c) => (
            <option key={c.int_Category_Id} value={c.int_Category_Id}>{c.txt_Category_Name}</option>
          ))}
        </select>

        <select className="form-control" style={{ width: '150px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>

        <select className="form-control" style={{ width: '160px' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="code">Sort by Code</option>
          <option value="category">Sort by Category</option>
        </select>

        {(searchTerm || selectedCategory || statusFilter) && (
          <button className="btn btn-outline" onClick={() => { setSearchTerm(''); setSelectedCategory(''); setStatusFilter(''); }}>
            Clear Filters
          </button>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: 'var(--radius-lg)', padding: '28px', width: '100%', maxWidth: '540px' }}>
            <h3 style={{ marginBottom: '16px' }}>Add Master Construction Material</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Category *</label>
                <select className="form-control" value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} required>
                  <option value="">-- Select Category --</option>
                  {categories.map((c) => (
                    <option key={c.int_Category_Id} value={c.int_Category_Id}>{c.txt_Category_Name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Product / Material Name *</label>
                <input type="text" className="form-control" placeholder="e.g. TMT Steel 12mm Fe500" value={formData.productName} onChange={(e) => setFormData({ ...formData, productName: e.target.value })} required />
              </div>

              <div className="form-group">
                <label>Default Specification</label>
                <input type="text" className="form-control" placeholder="e.g. IS 1786 Grade Fe500" value={formData.defaultSpec} onChange={(e) => setFormData({ ...formData, defaultSpec: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Default Unit *</label>
                <select className="form-control" value={formData.defaultUnitId} onChange={(e) => setFormData({ ...formData, defaultUnitId: e.target.value })}>
                  <option value="1">Bags</option>
                  <option value="2">Metric Ton (MT)</option>
                  <option value="3">Pieces (Pcs)</option>
                  <option value="4">Square Feet (Sq.Ft)</option>
                  <option value="5">Meters (m)</option>
                  <option value="6">Liters (L)</option>
                  <option value="10">Kilograms (kg)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Master Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <Package size={48} className="empty-state-icon" />
            <h4>No master products found</h4>
            <p>{searchTerm || selectedCategory ? 'No items match your active search and filter criteria.' : 'No master products registered in the database.'}</p>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Default Spec</th>
                <th>Unit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.int_Product_Id}>
                  <td style={{ fontWeight: 600 }}>{p.txt_Product_Code}</td>
                  <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{p.txt_Product_Name}</td>
                  <td><span className="badge badge-open">{p.txt_Category_Name}</span></td>
                  <td>{p.txt_Default_Spec || '-'}</td>
                  <td>{p.txt_Unit_Name} ({p.txt_Abbreviation})</td>
                  <td><span className="badge badge-approved">● {p.txt_Status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </MainLayout>
  );
};

export default MasterProducts;
