import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import api from '../../services/api';
import { Layers, Search, Filter } from 'lucide-react';

const ProjectInventory = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/builders/projects');
        const projList = response.data.projects || [];
        setProjects(projList);
        if (projList.length > 0) {
          setSelectedProjectId(projList[0].int_Project_Id.toString());
        }
      } catch (error) {
        console.error('Failed to load projects:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      const fetchInventory = async () => {
        try {
          const response = await api.get(`/inventory/project/${selectedProjectId}`);
          setInventory(response.data.inventory || []);
        } catch (error) {
          console.error('Failed to load project inventory:', error.message);
        }
      };
      fetchInventory();
    }
  }, [selectedProjectId]);

  const uniqueCategories = Array.from(new Set(inventory.map(i => i.txt_Category_Name).filter(Boolean)));

  const filteredInventory = inventory
    .filter((inv) => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        (inv.txt_Product_Name && inv.txt_Product_Name.toLowerCase().includes(term)) ||
        (inv.txt_Product_Code && inv.txt_Product_Code.toLowerCase().includes(term)) ||
        (inv.txt_Category_Name && inv.txt_Category_Name.toLowerCase().includes(term));

      const matchCategory = !selectedCategory || inv.txt_Category_Name === selectedCategory;
      const isLow = parseFloat(inv.num_Current_Stock) <= parseFloat(inv.num_Minimum_Level);
      const matchStock =
        !stockFilter ||
        (stockFilter === 'LOW' && isLow) ||
        (stockFilter === 'NORMAL' && !isLow);

      return matchSearch && matchCategory && matchStock;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return (a.txt_Product_Name || '').localeCompare(b.txt_Product_Name || '');
      if (sortBy === 'code') return (a.txt_Product_Code || '').localeCompare(b.txt_Product_Code || '');
      if (sortBy === 'stock_desc') return parseFloat(b.num_Current_Stock || 0) - parseFloat(a.num_Current_Stock || 0);
      if (sortBy === 'stock_asc') return parseFloat(a.num_Current_Stock || 0) - parseFloat(b.num_Current_Stock || 0);
      return 0;
    });

  return (
    <MainLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>Site Project Inventory</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Stock levels automatically updated upon PO delivery verification</p>
        </div>

        {projects.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Project:</span>
            <select className="form-control" style={{ width: '260px' }} value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}>
              {projects.map((p) => (
                <option key={p.int_Project_Id} value={p.int_Project_Id}>{p.txt_Project_Name} ({p.txt_City})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '38px' }}
            placeholder="Search material by name, product code, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {uniqueCategories.length > 0 && (
          <select className="form-control" style={{ width: '180px' }} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="">All Categories ({uniqueCategories.length})</option>
            {uniqueCategories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}

        <select className="form-control" style={{ width: '160px' }} value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
          <option value="">All Stock Levels</option>
          <option value="NORMAL">Healthy Stock</option>
          <option value="LOW">Low Stock Alert</option>
        </select>

        <select className="form-control" style={{ width: '170px' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="code">Sort by Code</option>
          <option value="stock_desc">Highest Stock</option>
          <option value="stock_asc">Lowest Stock</option>
        </select>

        {(searchTerm || selectedCategory || stockFilter) && (
          <button className="btn btn-outline" onClick={() => { setSearchTerm(''); setSelectedCategory(''); setStockFilter(''); }}>
            Clear Filters
          </button>
        )}
      </div>

      <div className="table-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading project inventory...</div>
        ) : filteredInventory.length === 0 ? (
          <div className="empty-state">
            <Layers size={48} className="empty-state-icon" />
            <h4>No materials found for this site</h4>
            <p>{searchTerm || selectedCategory || stockFilter ? 'Try clearing your search or filter options.' : 'Delivered materials from accepted Purchase Orders will populate here automatically.'}</p>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Product Code</th>
                <th>Material Name</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Min Level</th>
                <th>Unit</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((inv) => (
                <tr key={inv.int_Project_Inv_Id}>
                  <td style={{ fontWeight: 600 }}>{inv.txt_Product_Code}</td>
                  <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{inv.txt_Product_Name}</td>
                  <td><span className="badge badge-open">{inv.txt_Category_Name}</span></td>
                  <td style={{ fontWeight: 800, fontSize: '1.05rem', color: parseFloat(inv.num_Current_Stock) > parseFloat(inv.num_Minimum_Level) ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {parseFloat(inv.num_Current_Stock).toLocaleString()}
                  </td>
                  <td>{parseFloat(inv.num_Minimum_Level).toLocaleString()}</td>
                  <td>{inv.txt_Unit_Name}</td>
                  <td>{new Date(inv.dte_Last_Updated).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </MainLayout>
  );
};

export default ProjectInventory;
