import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import api from '../../services/api';
import { Layers, Plus, Search, Filter } from 'lucide-react';

const MasterCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/categories');
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Failed to load categories:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/categories', { categoryName, description });
      setCategoryName('');
      setDescription('');
      setShowModal(false);
      fetchCategories();
    } catch (error) {
      alert(`Error creating category: ${error.message}`);
    }
  };

  const filteredCategories = categories
    .filter((c) => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        (c.txt_Category_Name && c.txt_Category_Name.toLowerCase().includes(term)) ||
        (c.txt_Category_Code && c.txt_Category_Code.toLowerCase().includes(term)) ||
        (c.txt_Description && c.txt_Description.toLowerCase().includes(term));

      const matchStatus = !statusFilter || c.txt_Status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return (a.txt_Category_Name || '').localeCompare(b.txt_Category_Name || '');
      if (sortBy === 'code') return (a.txt_Category_Code || '').localeCompare(b.txt_Category_Code || '');
      return 0;
    });

  return (
    <MainLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>Master Construction Categories</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Master data categories stored in MySQL database</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Category
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '38px' }}
            placeholder="Search category by name, code, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select className="form-control" style={{ width: '160px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>

        <select className="form-control" style={{ width: '160px' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="code">Sort by Code</option>
        </select>

        {(searchTerm || statusFilter) && (
          <button className="btn btn-outline" onClick={() => { setSearchTerm(''); setStatusFilter(''); }}>
            Clear Filters
          </button>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: 'var(--radius-lg)', padding: '28px', width: '100%', maxWidth: '480px' }}>
            <h3 style={{ marginBottom: '16px' }}>Add Master Category</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Category Name *</label>
                <input type="text" className="form-control" placeholder="e.g. Waterproofing" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" rows={3} placeholder="Brief details" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading categories...</div>
        ) : filteredCategories.length === 0 ? (
          <div className="empty-state">
            <Layers size={48} className="empty-state-icon" />
            <h4>No master categories found</h4>
            <p>{searchTerm || statusFilter ? 'Try clearing your search or filter filters.' : 'No categories present in the database.'}</p>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Category Name</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((c) => (
                <tr key={c.int_Category_Id}>
                  <td style={{ fontWeight: 600 }}>{c.txt_Category_Code}</td>
                  <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{c.txt_Category_Name}</td>
                  <td>{c.txt_Description || '-'}</td>
                  <td><span className="badge badge-approved">● {c.txt_Status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </MainLayout>
  );
};

export default MasterCategories;
