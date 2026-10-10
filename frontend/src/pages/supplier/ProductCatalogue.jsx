import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import StatusBadge from '../../components/StatusBadge';
import api from '../../services/api';
import { Store, Plus, Edit2, Search, Filter } from 'lucide-react';

const ProductCatalogue = () => {
  const [supplierProducts, setSupplierProducts] = useState([]);
  const [masterProducts, setMasterProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const [formData, setFormData] = useState({
    productId: '',
    customProductName: '',
    brand: '',
    specification: '',
    unitId: 1,
    basePrice: '',
    bulkPrice: '',
    moq: 1,
    currentStock: 100,
    minimumStock: 10,
    deliveryRadius: 50,
    certificationRef: ''
  });

  const fetchData = async () => {
    try {
      const [spRes, mpRes] = await Promise.all([
        api.get('/suppliers/products'),
        api.get('/admin/products')
      ]);
      setSupplierProducts(spRes.data.products || []);
      setMasterProducts(mpRes.data.products || []);
    } catch (error) {
      console.error('Failed to load supplier catalogue:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/suppliers/products', formData);
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      alert(`Error adding product: ${error.message}`);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/suppliers/products/${editingItem.int_Supplier_Product_Id}`, {
        basePrice: editingItem.num_Base_Price,
        bulkPrice: editingItem.num_Bulk_Price,
        currentStock: editingItem.num_Current_Stock,
        minimumStock: editingItem.num_Minimum_Stock,
        availabilityStatus: editingItem.txt_Availability_Status
      });
      setShowEditModal(false);
      fetchData();
    } catch (error) {
      alert(`Update failed: ${error.message}`);
    }
  };

  const uniqueBrands = Array.from(new Set(supplierProducts.map(p => p.txt_Brand).filter(Boolean)));

  const filteredProducts = supplierProducts
    .filter((sp) => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        (sp.master_product_name && sp.master_product_name.toLowerCase().includes(term)) ||
        (sp.txt_Supplier_Product_Code && sp.txt_Supplier_Product_Code.toLowerCase().includes(term)) ||
        (sp.txt_Brand && sp.txt_Brand.toLowerCase().includes(term));

      const matchStatus = !statusFilter || sp.txt_Availability_Status === statusFilter;
      const matchBrand = !selectedBrand || sp.txt_Brand === selectedBrand;
      return matchSearch && matchStatus && matchBrand;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return (a.master_product_name || '').localeCompare(b.master_product_name || '');
      if (sortBy === 'price_asc') return parseFloat(a.num_Base_Price || 0) - parseFloat(b.num_Base_Price || 0);
      if (sortBy === 'price_desc') return parseFloat(b.num_Base_Price || 0) - parseFloat(a.num_Base_Price || 0);
      if (sortBy === 'stock') return (b.num_Current_Stock || 0) - (a.num_Current_Stock || 0);
      return 0;
    });

  return (
    <MainLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>Product & Material Catalogue</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Publish materials, pricing, and active warehouse stock levels</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Add New Material
        </button>
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '38px' }}
            placeholder="Search by product name, code, brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select className="form-control" style={{ width: '180px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Availabilities</option>
          <option value="AVAILABLE">AVAILABLE (In Stock)</option>
          <option value="OUT_OF_STOCK">OUT OF STOCK</option>
        </select>

        {uniqueBrands.length > 0 && (
          <select className="form-control" style={{ width: '160px' }} value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}>
            <option value="">All Brands ({uniqueBrands.length})</option>
            {uniqueBrands.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        )}

        <select className="form-control" style={{ width: '160px' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="stock">Stock: High to Low</option>
        </select>

        {(searchTerm || statusFilter || selectedBrand) && (
          <button className="btn btn-outline" onClick={() => { setSearchTerm(''); setStatusFilter(''); setSelectedBrand(''); }}>
            Clear Filters
          </button>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: 'var(--radius-lg)', padding: '28px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '16px' }}>List New Product in Catalogue</h3>
            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label>Select Master Product *</label>
                <select className="form-control" value={formData.productId} onChange={(e) => setFormData({ ...formData, productId: e.target.value })} required>
                  <option value="">-- Choose from Master Directory --</option>
                  {masterProducts.map((p) => (
                    <option key={p.int_Product_Id} value={p.int_Product_Id}>
                      {p.txt_Product_Name} ({p.txt_Category_Name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Brand / Manufacturer</label>
                  <input type="text" className="form-control" placeholder="e.g. Tata Tiscon / UltraTech" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Base Price per Unit (₹) *</label>
                  <input type="number" step="0.01" className="form-control" placeholder="65.00" value={formData.basePrice} onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })} required min={0} />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Minimum Order Qty (MOQ) *</label>
                  <input type="number" className="form-control" placeholder="10" value={formData.moq} onChange={(e) => setFormData({ ...formData, moq: e.target.value })} required min={1} />
                </div>
                <div className="form-group">
                  <label>Current Stock Units *</label>
                  <input type="number" className="form-control" placeholder="500" value={formData.currentStock} onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })} required min={0} />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Delivery Radius (KM) *</label>
                  <input type="number" className="form-control" placeholder="50" value={formData.deliveryRadius} onChange={(e) => setFormData({ ...formData, deliveryRadius: e.target.value })} required min={1} />
                </div>
                <div className="form-group">
                  <label>Certification Reference</label>
                  <input type="text" className="form-control" placeholder="ISO 9001 / IS 1786" value={formData.certificationRef} onChange={(e) => setFormData({ ...formData, certificationRef: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Product Offering</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingItem && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: 'var(--radius-lg)', padding: '28px', width: '100%', maxWidth: '480px' }}>
            <h3 style={{ marginBottom: '16px' }}>Update Stock & Base Price</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>Base Price (₹) *</label>
                <input type="number" step="0.01" className="form-control" value={editingItem.num_Base_Price} onChange={(e) => setEditingItem({ ...editingItem, num_Base_Price: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Current Stock Units *</label>
                <input type="number" className="form-control" value={editingItem.num_Current_Stock} onChange={(e) => setEditingItem({ ...editingItem, num_Current_Stock: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Availability Status *</label>
                <select className="form-control" value={editingItem.txt_Availability_Status} onChange={(e) => setEditingItem({ ...editingItem, txt_Availability_Status: e.target.value })}>
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="OUT_OF_STOCK">OUT OF STOCK</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading catalogue...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <Store size={48} className="empty-state-icon" />
            <h4>No products found in catalogue</h4>
            <p>{searchTerm || statusFilter || selectedBrand ? 'Try clearing your search or filter options.' : 'Add products to start receiving and bidding on Builder RFQs.'}</p>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Product Name</th>
                <th>Brand</th>
                <th>Base Price (₹)</th>
                <th>MOQ</th>
                <th>Stock</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((sp) => (
                <tr key={sp.int_Supplier_Product_Id}>
                  <td style={{ fontWeight: 600 }}>{sp.txt_Supplier_Product_Code}</td>
                  <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{sp.master_product_name}</td>
                  <td>{sp.txt_Brand || '-'}</td>
                  <td style={{ fontWeight: 700 }}>₹{parseFloat(sp.num_Base_Price).toLocaleString('en-IN')} / {sp.txt_Unit_Name}</td>
                  <td>{sp.num_MOQ}</td>
                  <td style={{ fontWeight: 700 }}>{sp.num_Current_Stock}</td>
                  <td><StatusBadge status={sp.txt_Availability_Status} /></td>
                  <td>
                    <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.78rem' }} onClick={() => { setEditingItem(sp); setShowEditModal(true); }}>
                      <Edit2 size={14} /> Update
                    </button>
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

export default ProductCatalogue;
