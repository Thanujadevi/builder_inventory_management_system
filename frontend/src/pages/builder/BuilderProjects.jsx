import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import StatusBadge from '../../components/StatusBadge';
import api from '../../services/api';
import { Building2, Plus, Search, Filter } from 'lucide-react';

const BuilderProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const [formData, setFormData] = useState({
    projectName: '',
    projectType: 'Residential',
    description: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    estimatedBudget: '',
    procurementBudget: '',
    startDate: '',
    expectedCompletionDate: ''
  });

  const fetchProjects = async () => {
    try {
      const response = await api.get('/builders/projects');
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Failed to load projects:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/builders/projects', formData);
      setShowModal(false);
      fetchProjects();
    } catch (error) {
      alert(`Error creating project: ${error.message}`);
    }
  };

  const uniqueCities = Array.from(new Set(projects.map(p => p.txt_City).filter(Boolean)));

  const filteredProjects = projects
    .filter((p) => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        (p.txt_Project_Name && p.txt_Project_Name.toLowerCase().includes(term)) ||
        (p.txt_Project_Code && p.txt_Project_Code.toLowerCase().includes(term)) ||
        (p.txt_City && p.txt_City.toLowerCase().includes(term)) ||
        (p.txt_Address && p.txt_Address.toLowerCase().includes(term));

      const matchType = !selectedType || p.txt_Project_Type === selectedType;
      const matchCity = !selectedCity || p.txt_City === selectedCity;
      return matchSearch && matchType && matchCity;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return (a.txt_Project_Name || '').localeCompare(b.txt_Project_Name || '');
      if (sortBy === 'code') return (a.txt_Project_Code || '').localeCompare(b.txt_Project_Code || '');
      if (sortBy === 'budget') return parseFloat(b.num_Estimated_Budget || 0) - parseFloat(a.num_Estimated_Budget || 0);
      if (sortBy === 'procurement') return parseFloat(b.total_procurement_value || 0) - parseFloat(a.total_procurement_value || 0);
      if (sortBy === 'rfqs') return (b.rfq_count || 0) - (a.rfq_count || 0);
      return 0;
    });

  return (
    <MainLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>Construction Projects</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Manage sites, estimated budgets, and procurement requirements</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add New Project
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
            placeholder="Search projects by name, code, address, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select className="form-control" style={{ width: '180px' }} value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
          <option value="">All Project Types</option>
          <option value="Residential">Residential</option>
          <option value="Commercial">Commercial</option>
          <option value="Industrial">Industrial</option>
          <option value="Infrastructure">Infrastructure</option>
        </select>

        {uniqueCities.length > 0 && (
          <select className="form-control" style={{ width: '160px' }} value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
            <option value="">All Cities</option>
            {uniqueCities.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}

        <select className="form-control" style={{ width: '170px' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="code">Sort by Code</option>
          <option value="budget">Sort by Budget</option>
          <option value="procurement">Sort by Procurement Value</option>
          <option value="rfqs">Sort by RFQs Count</option>
        </select>

        {(searchTerm || selectedType || selectedCity) && (
          <button className="btn btn-outline" onClick={() => { setSearchTerm(''); setSelectedType(''); setSelectedCity(''); }}>
            Clear Filters
          </button>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: 'var(--radius-lg)', padding: '28px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '16px' }}>Add Construction Site Project</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Project Name *</label>
                <input type="text" name="projectName" className="form-control" placeholder="e.g. ABC Horizon Towers" value={formData.projectName} onChange={handleChange} required />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Project Type *</label>
                  <select name="projectType" className="form-control" value={formData.projectType} onChange={handleChange}>
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Infrastructure">Infrastructure</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Estimated Budget (₹)</label>
                  <input type="number" name="estimatedBudget" className="form-control" placeholder="25000000" value={formData.estimatedBudget} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group">
                <label>Site Address *</label>
                <input type="text" name="address" className="form-control" placeholder="Street / Plot No" value={formData.address} onChange={handleChange} required />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>City *</label>
                  <input type="text" name="city" className="form-control" placeholder="Tuticorin" value={formData.city} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input type="text" name="state" className="form-control" placeholder="Tamil Nadu" value={formData.state} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Pincode *</label>
                  <input type="text" name="pincode" className="form-control" placeholder="628001" value={formData.pincode} onChange={handleChange} required />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="empty-state">
            <Building2 size={48} className="empty-state-icon" />
            <h4>No construction projects found</h4>
            <p>{searchTerm || selectedType || selectedCity ? 'Try clearing your search or filter options.' : 'Create your first project to start submitting material requirements.'}</p>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Project Name</th>
                <th>Type</th>
                <th>Location</th>
                <th>Budget (₹)</th>
                <th>RFQs</th>
                <th>Procurement Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((p) => (
                <tr key={p.int_Project_Id}>
                  <td style={{ fontWeight: 600 }}>{p.txt_Project_Code}</td>
                  <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{p.txt_Project_Name}</td>
                  <td>{p.txt_Project_Type}</td>
                  <td>{p.txt_City}, {p.txt_State}</td>
                  <td>₹{parseFloat(p.num_Estimated_Budget).toLocaleString('en-IN')}</td>
                  <td><span className="badge badge-open">{p.rfq_count} RFQs</span></td>
                  <td style={{ fontWeight: 600 }}>₹{parseFloat(p.total_procurement_value).toLocaleString('en-IN')}</td>
                  <td><StatusBadge status={p.txt_Status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </MainLayout>
  );
};

export default BuilderProjects;
