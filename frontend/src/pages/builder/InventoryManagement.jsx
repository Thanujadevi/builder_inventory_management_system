import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import api from '../../services/api';
import { 
  Layers, Package, AlertTriangle, TrendingUp, Plus, Minus, RefreshCw, 
  Search, Filter, Download, Edit2, Trash2, Building2, Truck, ArrowRight,
  AlertCircle, CheckCircle2, X, FileText, ArrowDownRight, ArrowUpRight, BarChart3
} from 'lucide-react';

const InventoryManagement = () => {
  // Navigation tabs: 'dashboard', 'materials', 'transactions', 'allocations', 'reports'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Core Data States
  const [dashboardData, setDashboardData] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [projects, setProjects] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStockStatus, setSelectedStockStatus] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [txnTypeFilter, setTxnTypeFilter] = useState('');
  const [txnSearch, setTxnSearch] = useState('');
  const [allocationSearch, setAllocationSearch] = useState('');
  const [allocationProjectFilter, setAllocationProjectFilter] = useState('');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [showStockOutModal, setShowStockOutModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedAllocation, setSelectedAllocation] = useState(null);

  // Form States
  const [materialForm, setMaterialForm] = useState({
    materialName: '',
    categoryId: '',
    unitId: '',
    currentQuantity: '',
    minimumLevel: '10',
    unitPrice: '',
    supplierId: '',
    storageLocation: 'Central Warehouse - Bay A',
    projectId: ''
  });

  const [stockInForm, setStockInForm] = useState({
    quantity: '',
    unitCost: '',
    supplierId: '',
    reference: '',
    storageLocation: '',
    remarks: '',
    transactionType: 'STOCK_IN'
  });

  const [stockOutForm, setStockOutForm] = useState({
    quantity: '',
    projectId: '',
    issuedTo: '',
    purpose: '',
    reference: '',
    remarks: ''
  });

  const [allocateForm, setAllocateForm] = useState({
    projectId: '',
    allocatedQuantity: '',
    remarks: ''
  });

  const [returnForm, setReturnForm] = useState({
    returnQuantity: '',
    remarks: ''
  });

  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });

  const showNotification = (text, type = 'success') => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg({ type: '', text: '' }), 4500);
  };

  // ============================================================
  // DATA FETCHING
  // ============================================================
  const fetchDashboard = async () => {
    try {
      const res = await api.get('/inventory/dashboard');
      setDashboardData(res.data);
    } catch (err) {
      console.error('Failed to load inventory dashboard:', err.message);
    }
  };

  const fetchMaterials = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.categoryId = selectedCategory;
      if (selectedStockStatus) params.stockStatus = selectedStockStatus;
      if (selectedLocation) params.location = selectedLocation;
      if (selectedProjectFilter) params.projectId = selectedProjectFilter;
      if (sortBy) params.sortBy = sortBy;
      if (sortOrder) params.sortOrder = sortOrder;

      const res = await api.get('/inventory/materials', { params });
      setMaterials(res.data.materials || []);
    } catch (err) {
      console.error('Failed to load materials:', err.message);
    }
  };

  const fetchTransactions = async () => {
    try {
      const params = {};
      if (txnTypeFilter) params.type = txnTypeFilter;
      const res = await api.get('/inventory/transactions', { params });
      setTransactions(res.data.transactions || []);
    } catch (err) {
      console.error('Failed to load transactions:', err.message);
    }
  };

  const fetchAllocations = async () => {
    try {
      const res = await api.get('/inventory/allocations');
      setAllocations(res.data.allocations || []);
    } catch (err) {
      console.error('Failed to load allocations:', err.message);
    }
  };

  const fetchLookups = async () => {
    try {
      const [catRes, prjRes, supRes] = await Promise.all([
        api.get('/admin/categories').catch(() => ({ data: { categories: [] } })),
        api.get('/builders/projects').catch(() => ({ data: { projects: [] } })),
        api.get('/suppliers/directory').catch(() => ({ data: { suppliers: [] } }))
      ]);

      setCategories(catRes.data.categories || [
        { int_Category_Id: 1, txt_Category_Name: 'Cement' },
        { int_Category_Id: 2, txt_Category_Name: 'Steel / TMT' },
        { int_Category_Id: 3, txt_Category_Name: 'Bricks & Blocks' },
        { int_Category_Id: 4, txt_Category_Name: 'Sand & Aggregates' },
        { int_Category_Id: 5, txt_Category_Name: 'Pipes' },
        { int_Category_Id: 6, txt_Category_Name: 'Electrical' },
        { int_Category_Id: 7, txt_Category_Name: 'Paint' },
        { int_Category_Id: 8, txt_Category_Name: 'Hardware' }
      ]);

      setProjects(prjRes.data.projects || []);
      setSuppliers(supRes.data.suppliers || []);

      // Standard construction units
      setUnits([
        { int_Unit_Id: 1, txt_Unit_Name: 'Bags (50kg)', txt_Abbreviation: 'Bags' },
        { int_Unit_Id: 2, txt_Unit_Name: 'Metric Tonnes', txt_Abbreviation: 'MT' },
        { int_Unit_Id: 3, txt_Unit_Name: 'Pieces / Nos', txt_Abbreviation: 'Pcs' },
        { int_Unit_Id: 4, txt_Unit_Name: 'Square Feet', txt_Abbreviation: 'Sq.Ft' },
        { int_Unit_Id: 5, txt_Unit_Name: 'Meters', txt_Abbreviation: 'Mtr' },
        { int_Unit_Id: 6, txt_Unit_Name: 'Litres', txt_Abbreviation: 'Ltr' },
        { int_Unit_Id: 7, txt_Unit_Name: 'Coils / Bundles', txt_Abbreviation: 'Coils' },
        { int_Unit_Id: 8, txt_Unit_Name: 'Kilograms', txt_Abbreviation: 'Kg' },
        { int_Unit_Id: 9, txt_Unit_Name: 'Cubic Feet / Brass', txt_Abbreviation: 'Cu.Ft' }
      ]);
    } catch (err) {
      console.error('Lookup load error:', err.message);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchDashboard(),
      fetchMaterials(),
      fetchTransactions(),
      fetchAllocations(),
      fetchLookups()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [searchTerm, selectedCategory, selectedStockStatus, selectedLocation, selectedProjectFilter, sortBy, sortOrder]);

  useEffect(() => {
    if (activeTab === 'transactions') fetchTransactions();
    if (activeTab === 'allocations') fetchAllocations();
    if (activeTab === 'dashboard') fetchDashboard();
  }, [activeTab, txnTypeFilter]);

  // ============================================================
  // HANDLERS FOR CRUD & STOCK TRANSACTIONS
  // ============================================================
  const handleOpenAdd = () => {
    setMaterialForm({
      materialName: '',
      categoryId: categories[0]?.int_Category_Id || '1',
      unitId: units[0]?.int_Unit_Id || '1',
      currentQuantity: '0',
      minimumLevel: '10',
      unitPrice: '0',
      supplierId: suppliers[0]?.int_Supplier_Id || '',
      storageLocation: 'Central Warehouse - Bay A',
      projectId: ''
    });
    setShowAddModal(true);
  };

  const handleSaveMaterial = async (e) => {
    e.preventDefault();
    try {
      if (showEditModal && selectedMaterial) {
        await api.put(`/inventory/materials/${selectedMaterial.int_Inventory_Id}`, materialForm);
        showNotification('Material updated successfully!');
        setShowEditModal(false);
      } else {
        await api.post('/inventory/materials', materialForm);
        showNotification('New construction material added to inventory!');
        setShowAddModal(false);
      }
      fetchMaterials();
      fetchDashboard();
    } catch (err) {
      alert(`Error saving material: ${err.message}`);
    }
  };

  const handleOpenEdit = (material) => {
    setSelectedMaterial(material);
    setMaterialForm({
      materialName: material.txt_Material_Name,
      categoryId: material.int_Category_Id,
      unitId: material.int_Unit_Id,
      minimumLevel: material.num_Minimum_Level,
      unitPrice: material.num_Unit_Price,
      supplierId: material.int_Supplier_Id || '',
      storageLocation: material.txt_Storage_Location,
      projectId: material.int_Project_Id || ''
    });
    setShowEditModal(true);
  };

  const handleDeleteMaterial = async (materialId, name) => {
    if (!window.confirm(`Are you sure you want to archive material "${name}"?`)) return;
    try {
      await api.delete(`/inventory/materials/${materialId}`);
      showNotification(`Material "${name}" archived successfully!`);
      fetchMaterials();
      fetchDashboard();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleOpenStockIn = (material) => {
    setSelectedMaterial(material);
    setStockInForm({
      quantity: '',
      unitCost: material.num_Unit_Price || '',
      supplierId: material.int_Supplier_Id || suppliers[0]?.int_Supplier_Id || '',
      reference: 'PO-DELIVERY',
      storageLocation: material.txt_Storage_Location || 'Central Warehouse',
      remarks: '',
      transactionType: 'STOCK_IN'
    });
    setShowStockInModal(true);
  };

  const handleSaveStockIn = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory/stock-in', {
        inventoryId: selectedMaterial.int_Inventory_Id,
        ...stockInForm
      });
      showNotification(`Stock In recorded for ${selectedMaterial.txt_Material_Name}!`);
      setShowStockInModal(false);
      fetchMaterials();
      fetchDashboard();
      fetchTransactions();
    } catch (err) {
      alert(`Stock In failed: ${err.message}`);
    }
  };

  const handleOpenStockOut = (material) => {
    setSelectedMaterial(material);
    setStockOutForm({
      quantity: '',
      projectId: projects[0]?.int_Project_Id || '',
      issuedTo: '',
      purpose: 'Site Foundation & Slab Execution',
      reference: 'ISSUE-VOUCHER',
      remarks: ''
    });
    setShowStockOutModal(true);
  };

  const handleSaveStockOut = async (e) => {
    e.preventDefault();
    const qty = parseFloat(stockOutForm.quantity);
    if (qty > parseFloat(selectedMaterial.num_Current_Stock)) {
      alert(`Cannot issue ${qty} units! Maximum available stock is ${selectedMaterial.num_Current_Stock} ${selectedMaterial.txt_Unit_Name}.`);
      return;
    }

    try {
      await api.post('/inventory/stock-out', {
        inventoryId: selectedMaterial.int_Inventory_Id,
        ...stockOutForm
      });
      showNotification(`Stock Out issued for ${selectedMaterial.txt_Material_Name}!`);
      setShowStockOutModal(false);
      fetchMaterials();
      fetchDashboard();
      fetchTransactions();
    } catch (err) {
      alert(`Stock Out failed: ${err.message}`);
    }
  };

  const handleOpenAllocate = (material) => {
    setSelectedMaterial(material);
    setAllocateForm({
      projectId: projects[0]?.int_Project_Id || '',
      allocatedQuantity: '',
      remarks: 'Project site allocation from central yard'
    });
    setShowAllocateModal(true);
  };

  const handleSaveAllocate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory/allocate', {
        inventoryId: selectedMaterial.int_Inventory_Id,
        ...allocateForm
      });
      showNotification(`Material allocated to project site successfully!`);
      setShowAllocateModal(false);
      fetchAllocations();
      fetchMaterials();
      fetchDashboard();
    } catch (err) {
      alert(`Allocation failed: ${err.message}`);
    }
  };

  const handleOpenReturn = (alloc) => {
    setSelectedAllocation(alloc);
    setReturnForm({
      returnQuantity: '',
      remarks: 'Returned surplus material from construction site'
    });
    setShowReturnModal(true);
  };

  const handleSaveReturn = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory/allocations/return', {
        allocationId: selectedAllocation.int_Allocation_Id,
        ...returnForm
      });
      showNotification(`Material return from site processed and restored to central stock!`);
      setShowReturnModal(false);
      fetchAllocations();
      fetchMaterials();
      fetchDashboard();
    } catch (err) {
      alert(`Return failed: ${err.message}`);
    }
  };

  // ============================================================
  // CSV EXPORT FUNCTIONALITY
  // ============================================================
  const exportToCSV = () => {
    if (materials.length === 0) {
      alert('No materials to export.');
      return;
    }

    const headers = [
      'Material Code',
      'Material Name',
      'Category',
      'Current Stock',
      'Unit',
      'Min Level',
      'Unit Price (INR)',
      'Total Value (INR)',
      'Storage Location',
      'Supplier',
      'Stock Health',
      'Last Updated'
    ];

    const rows = materials.map(m => [
      `"${m.txt_Material_Code}"`,
      `"${m.txt_Material_Name}"`,
      `"${m.txt_Category_Name}"`,
      m.num_Current_Stock,
      `"${m.txt_Unit_Name}"`,
      m.num_Minimum_Level,
      m.num_Unit_Price,
      (parseFloat(m.num_Current_Stock) * parseFloat(m.num_Unit_Price)).toFixed(2),
      `"${m.txt_Storage_Location || ''}"`,
      `"${m.txt_Supplier_Name || 'N/A'}"`,
      `"${m.stockHealth}"`,
      `"${new Date(m.dte_Last_Updated).toLocaleDateString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Construction_Inventory_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <MainLayout>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>Construction Materials Inventory</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Central warehouse control, stock in/out tracking, project site allocations & valuation
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={exportToCSV} title="Export full inventory report to CSV">
            <Download size={16} /> Export CSV
          </button>
          <button className="btn btn-outline" onClick={loadAllData} title="Refresh inventory data">
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Add Material
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedbackMsg.text && (
        <div style={{
          padding: '12px 18px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: feedbackMsg.type === 'error' ? 'var(--color-danger-bg)' : 'var(--color-success-bg)',
          color: feedbackMsg.type === 'error' ? 'var(--color-danger)' : 'var(--color-success)',
          fontWeight: 600,
          fontSize: '0.9rem',
          border: `1px solid ${feedbackMsg.type === 'error' ? '#fecaca' : '#bbf7d0'}`
        }}>
          {feedbackMsg.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          {feedbackMsg.text}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="inventory-tabs">
        <button className={`inventory-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <BarChart3 size={16} /> Overview & Dashboard
        </button>
        <button className={`inventory-tab-btn ${activeTab === 'materials' ? 'active' : ''}`} onClick={() => setActiveTab('materials')}>
          <Package size={16} /> Material Master & Stock ({materials.length})
        </button>
        <button className={`inventory-tab-btn ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => setActiveTab('transactions')}>
          <TrendingUp size={16} /> Stock Movements Log
        </button>
        <button className={`inventory-tab-btn ${activeTab === 'allocations' ? 'active' : ''}`} onClick={() => setActiveTab('allocations')}>
          <Building2 size={16} /> Project Allocations ({allocations.length})
        </button>
        <button className={`inventory-tab-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
          <FileText size={16} /> Valuation & Reports
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: OVERVIEW & DASHBOARD                                 */}
      {/* ============================================================ */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Key Metric Cards */}
          <div className="metrics-grid" style={{ marginBottom: '24px' }}>
            <StatCard 
              icon={Package} 
              label="Total Material Items" 
              value={dashboardData?.stats?.totalItems || materials.length} 
              color="#2563eb" 
              bgColor="#eff6ff" 
            />
            <StatCard 
              icon={TrendingUp} 
              label="Total Inventory Valuation" 
              value={`₹${(dashboardData?.stats?.totalStockValue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} 
              color="#059669" 
              bgColor="#ecfdf5" 
            />
            <StatCard 
              icon={AlertTriangle} 
              label="Low-Stock Materials" 
              value={dashboardData?.stats?.lowStockItems || 0} 
              color="#d97706" 
              bgColor="#fffbeb" 
            />
            <StatCard 
              icon={AlertCircle} 
              label="Out-of-Stock Items" 
              value={dashboardData?.stats?.outOfStockItems || 0} 
              color="#dc2626" 
              bgColor="#fef2f2" 
            />
          </div>

          {/* Low-Stock Alert Warning Banner */}
          {dashboardData?.alerts && dashboardData.alerts.length > 0 && (
            <div className="inventory-alert-banner">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ backgroundColor: '#fef3c7', padding: '10px', borderRadius: '50%', color: '#b45309' }}>
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h4 style={{ color: '#92400e', marginBottom: '2px' }}>
                    Reorder Alert: {dashboardData.alerts.length} Materials At or Below Safety Level
                  </h4>
                  <p style={{ color: '#b45309', fontSize: '0.85rem' }}>
                    Immediate stock intake required to prevent site construction delays: {' '}
                    <strong>{dashboardData.alerts.map(a => a.txt_Material_Name).slice(0, 3).join(', ')}{dashboardData.alerts.length > 3 ? '...' : ''}</strong>
                  </p>
                </div>
              </div>
              <button className="btn btn-outline" style={{ borderColor: '#d97706', color: '#b45309' }} onClick={() => { setActiveTab('materials'); setSelectedStockStatus('LOW_STOCK'); }}>
                Review Low Stock <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* Grid: Recent Stock Movements & Category Valuation */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
            {/* Recent Movement Activity */}
            <div className="table-card">
              <div className="table-header">
                <h4>Recent Stock Movements</h4>
                <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.78rem' }} onClick={() => setActiveTab('transactions')}>
                  View All Log
                </button>
              </div>
              {dashboardData?.recentMovements?.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No stock transactions recorded yet.</div>
              ) : (
                <div style={{ padding: '12px 20px' }}>
                  {dashboardData?.recentMovements?.map((m) => (
                    <div key={m.int_Transaction_Id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          padding: '8px',
                          borderRadius: '8px',
                          backgroundColor: m.txt_Transaction_Type === 'STOCK_IN' ? '#ecfdf5' : '#eff6ff',
                          color: m.txt_Transaction_Type === 'STOCK_IN' ? '#059669' : '#2563eb'
                        }}>
                          {m.txt_Transaction_Type === 'STOCK_IN' ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.txt_Material_Name || m.txt_Product_Name || 'Material Movement'}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                            {m.txt_Reference || 'TXN'} • {new Date(m.dte_Transaction_Date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className={`badge badge-${m.txt_Transaction_Type.toLowerCase()}`}>
                          {m.txt_Transaction_Type === 'STOCK_IN' ? '+' : '-'}{m.num_Quantity} Units
                        </span>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          ₹{parseFloat(m.num_Total_Cost || 0).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Category Valuation Card */}
            <div className="table-card">
              <div className="table-header">
                <h4>Stock Valuation by Category</h4>
                <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.78rem' }} onClick={() => setActiveTab('reports')}>
                  Full Report
                </button>
              </div>
              <div style={{ padding: '20px' }}>
                {dashboardData?.categoryBreakdown?.map((cat) => {
                  const totalVal = dashboardData?.stats?.totalStockValue || 1;
                  const percent = Math.min(100, Math.round((cat.categoryValue / totalVal) * 100));
                  return (
                    <div key={cat.txt_Category_Name} style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 600 }}>{cat.txt_Category_Name} ({cat.itemCount || 0} items)</span>
                        <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>₹{parseFloat(cat.categoryValue).toLocaleString('en-IN')} ({percent}%)</span>
                      </div>
                      <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${percent}%`, height: '100%', backgroundColor: 'var(--color-primary)', borderRadius: '4px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: MATERIAL MASTER & INVENTORY TABLE                     */}
      {/* ============================================================ */}
      {activeTab === 'materials' && (
        <div className="table-card">
          {/* Filter & Action Toolbar */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', backgroundColor: '#fafbfc' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'center' }}>
              {/* Search */}
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-light)' }} />
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '36px' }}
                  placeholder="Search code, material, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Category Filter */}
              <select className="form-control" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c.int_Category_Id} value={c.int_Category_Id}>{c.txt_Category_Name}</option>
                ))}
              </select>

              {/* Stock Status Filter */}
              <select className="form-control" value={selectedStockStatus} onChange={(e) => setSelectedStockStatus(e.target.value)}>
                <option value="">All Stock Levels</option>
                <option value="IN_STOCK">In Stock (Healthy)</option>
                <option value="LOW_STOCK">Low Stock (≤ Safety)</option>
                <option value="OUT_OF_STOCK">Out of Stock (Zero)</option>
              </select>

              {/* Project Filter */}
              <select className="form-control" value={selectedProjectFilter} onChange={(e) => setSelectedProjectFilter(e.target.value)}>
                <option value="">Central & All Sites</option>
                <option value="central">Central Warehouse Only</option>
                {projects.map(p => (
                  <option key={p.int_Project_Id} value={p.int_Project_Id}>{p.txt_Project_Name}</option>
                ))}
              </select>

              {/* Sort By */}
              <select className="form-control" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="name">Sort by Name</option>
                <option value="quantity">Sort by Quantity</option>
                <option value="value">Sort by Valuation</option>
                <option value="price">Sort by Unit Price</option>
                <option value="date">Sort by Last Updated</option>
              </select>
            </div>
          </div>

          {/* Materials Table */}
          {loading ? (
            <div style={{ padding: '50px', textAlign: 'center' }}>Loading materials inventory...</div>
          ) : materials.length === 0 ? (
            <div className="empty-state">
              <Package size={48} className="empty-state-icon" />
              <h4>No construction materials found</h4>
              <p>Add your first material or adjust the filter criteria to view stock.</p>
              <button className="btn btn-primary" style={{ marginTop: '14px' }} onClick={handleOpenAdd}>
                <Plus size={16} /> Add Construction Material
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Material Code</th>
                    <th>Material Name</th>
                    <th>Category</th>
                    <th>Current Stock</th>
                    <th>Min Level</th>
                    <th>Unit</th>
                    <th>Purchase Price</th>
                    <th>Total Value</th>
                    <th>Location</th>
                    <th>Supplier</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((m) => {
                    const isOutOfStock = parseFloat(m.num_Current_Stock) <= 0;
                    const isLowStock = !isOutOfStock && parseFloat(m.num_Current_Stock) <= parseFloat(m.num_Minimum_Level);
                    const stockVal = parseFloat(m.num_Current_Stock) * parseFloat(m.num_Unit_Price);

                    return (
                      <tr key={m.int_Inventory_Id}>
                        <td style={{ fontWeight: 600 }}>{m.txt_Material_Code}</td>
                        <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                          {m.txt_Material_Name}
                          {m.txt_Project_Name && (
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>
                              Site: {m.txt_Project_Name}
                            </span>
                          )}
                        </td>
                        <td><span className="badge badge-open">{m.txt_Category_Name}</span></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              fontWeight: 800,
                              fontSize: '1rem',
                              color: isOutOfStock ? 'var(--color-danger)' : isLowStock ? 'var(--color-warning)' : 'var(--color-success)'
                            }}>
                              {parseFloat(m.num_Current_Stock).toLocaleString()}
                            </span>
                            {isOutOfStock ? (
                              <span className="badge badge-out_of_stock" style={{ padding: '2px 6px', fontSize: '0.7rem' }}>Out</span>
                            ) : isLowStock ? (
                              <span className="badge badge-low_stock" style={{ padding: '2px 6px', fontSize: '0.7rem' }}>Low</span>
                            ) : null}
                          </div>
                        </td>
                        <td style={{ color: 'var(--color-text-muted)' }}>{parseFloat(m.num_Minimum_Level).toLocaleString()}</td>
                        <td>{m.txt_Unit_Name}</td>
                        <td style={{ fontWeight: 600 }}>₹{parseFloat(m.num_Unit_Price).toLocaleString('en-IN')}</td>
                        <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>₹{stockVal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                        <td>
                          <span style={{ fontSize: '0.82rem', color: 'var(--color-dark)' }}>{m.txt_Storage_Location || 'Central Yard'}</span>
                        </td>
                        <td style={{ fontSize: '0.82rem' }}>{m.txt_Supplier_Name || 'General Sourced'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            <button 
                              className="btn btn-outline" 
                              style={{ padding: '4px 8px', fontSize: '0.75rem', borderColor: '#10b981', color: '#10b981' }} 
                              title="Stock In (Receive Purchases / Consignments)"
                              onClick={() => handleOpenStockIn(m)}
                            >
                              <Plus size={13} /> In
                            </button>
                            <button 
                              className="btn btn-outline" 
                              style={{ padding: '4px 8px', fontSize: '0.75rem', borderColor: '#2563eb', color: '#2563eb' }} 
                              title="Stock Out (Issue to Project / Subcontractor)"
                              disabled={isOutOfStock}
                              onClick={() => handleOpenStockOut(m)}
                            >
                              <Minus size={13} /> Out
                            </button>
                            <button 
                              className="btn btn-outline" 
                              style={{ padding: '4px 8px', fontSize: '0.75rem', borderColor: '#7c3aed', color: '#7c3aed' }} 
                              title="Allocate to Project Site"
                              disabled={isOutOfStock}
                              onClick={() => handleOpenAllocate(m)}
                            >
                              Allocate
                            </button>
                            <button 
                              className="btn btn-outline" 
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }} 
                              title="Edit Material"
                              onClick={() => handleOpenEdit(m)}
                            >
                              <Edit2 size={13} />
                            </button>
                            <button 
                              className="btn btn-outline" 
                              style={{ padding: '4px 8px', fontSize: '0.75rem', borderColor: '#ef4444', color: '#ef4444' }} 
                              title="Archive Material"
                              onClick={() => handleDeleteMaterial(m.int_Inventory_Id, m.txt_Material_Name)}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: STOCK MOVEMENTS / TRANSACTIONS LOG                    */}
      {/* ============================================================ */}
      {activeTab === 'transactions' && (
        <div className="table-card">
          <div className="table-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h4>Complete Stock Movements & Audit History</h4>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Full record of purchases, site issues, transfers, and surplus returns</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '220px' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '32px', fontSize: '0.85rem' }}
                  placeholder="Search movements..."
                  value={txnSearch}
                  onChange={(e) => setTxnSearch(e.target.value)}
                />
              </div>
              <select className="form-control" style={{ width: '180px' }} value={txnTypeFilter} onChange={(e) => setTxnTypeFilter(e.target.value)}>
                <option value="">All Movement Types</option>
                <option value="STOCK_IN">Stock In (Intakes)</option>
                <option value="STOCK_OUT">Stock Out (Issues)</option>
                <option value="TRANSFER">Project Allocations</option>
                <option value="RETURN">Surplus Site Returns</option>
              </select>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="empty-state">
              <TrendingUp size={48} className="empty-state-icon" />
              <h4>No inventory transactions logged</h4>
              <p>Stock intakes and material issues will log here automatically.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Txn Code</th>
                    <th>Type</th>
                    <th>Material</th>
                    <th>Quantity</th>
                    <th>Unit Cost</th>
                    <th>Total Cost</th>
                    <th>Reference / Voucher</th>
                    <th>Issued To / Supplier</th>
                    <th>Project Site</th>
                    <th>Date & Time</th>
                    <th>Logged By</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions
                    .filter(t => {
                      if (!txnSearch) return true;
                      const q = txnSearch.toLowerCase();
                      return (
                        (t.txt_Transaction_Code && t.txt_Transaction_Code.toLowerCase().includes(q)) ||
                        (t.txt_Material_Name && t.txt_Material_Name.toLowerCase().includes(q)) ||
                        (t.txt_Reference && t.txt_Reference.toLowerCase().includes(q)) ||
                        (t.txt_Issued_To && t.txt_Issued_To.toLowerCase().includes(q)) ||
                        (t.txt_Supplier_Name && t.txt_Supplier_Name.toLowerCase().includes(q))
                      );
                    })
                    .map((t) => (
                    <tr key={t.int_Transaction_Id}>
                      <td style={{ fontWeight: 600 }}>{t.txt_Transaction_Code}</td>
                      <td>
                        <span className={`badge badge-${t.txt_Transaction_Type.toLowerCase()}`}>
                          {t.txt_Transaction_Type}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{t.txt_Material_Name || t.txt_Product_Name || 'Material'}</td>
                      <td style={{ fontWeight: 700 }}>
                        {t.txt_Transaction_Type === 'STOCK_IN' || t.txt_Transaction_Type === 'RETURN' ? '+' : '-'}{parseFloat(t.num_Quantity).toLocaleString()}
                      </td>
                      <td>₹{parseFloat(t.num_Unit_Cost || 0).toLocaleString('en-IN')}</td>
                      <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>₹{parseFloat(t.num_Total_Cost || 0).toLocaleString('en-IN')}</td>
                      <td><span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{t.txt_Reference || '-'}</span></td>
                      <td style={{ fontSize: '0.85rem' }}>{t.txt_Issued_To || t.txt_Supplier_Name || '-'}</td>
                      <td>{t.txt_Project_Name || 'Central Warehouse'}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{new Date(t.dte_Transaction_Date).toLocaleString()}</td>
                      <td style={{ fontSize: '0.82rem' }}>{t.txt_Created_By || 'System'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: PROJECT MATERIAL ALLOCATIONS                          */}
      {/* ============================================================ */}
      {activeTab === 'allocations' && (
        <div className="table-card">
          <div className="table-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h4>Site-Wise Material Allocations</h4>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Track materials reserved, dispatched to site, and returned to warehouse</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '220px' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '32px', fontSize: '0.85rem' }}
                  placeholder="Search allocations..."
                  value={allocationSearch}
                  onChange={(e) => setAllocationSearch(e.target.value)}
                />
              </div>
              <select className="form-control" style={{ width: '180px' }} value={allocationProjectFilter} onChange={(e) => setAllocationProjectFilter(e.target.value)}>
                <option value="">All Project Sites</option>
                {projects.map(p => (
                  <option key={p.int_Project_Id} value={p.int_Project_Id}>{p.txt_Project_Name}</option>
                ))}
              </select>
              <button className="btn btn-primary" onClick={() => { setActiveTab('materials'); showNotification('Select a material and click Allocate to assign to a project.', 'info'); }}>
                <Plus size={16} /> New Site Allocation
              </button>
            </div>
          </div>

          {allocations.length === 0 ? (
            <div className="empty-state">
              <Building2 size={48} className="empty-state-icon" />
              <h4>No project material allocations found</h4>
              <p>Allocate central warehouse materials to specific construction sites to track site-level usage.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Allocation Code</th>
                    <th>Project Site</th>
                    <th>Material</th>
                    <th>Allocated Qty</th>
                    <th>Issued to Site</th>
                    <th>Remaining Allocated</th>
                    <th>Unit</th>
                    <th>Date</th>
                    <th>Remarks</th>
                    <th style={{ textAlign: 'center' }}>Site Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allocations
                    .filter(a => {
                      const term = allocationSearch.toLowerCase();
                      const matchSearch =
                        !allocationSearch ||
                        (a.txt_Allocation_Code && a.txt_Allocation_Code.toLowerCase().includes(term)) ||
                        (a.txt_Project_Name && a.txt_Project_Name.toLowerCase().includes(term)) ||
                        (a.txt_Material_Name && a.txt_Material_Name.toLowerCase().includes(term));

                      const matchProj = !allocationProjectFilter || a.int_Project_Id?.toString() === allocationProjectFilter;
                      return matchSearch && matchProj;
                    })
                    .map((a) => {
                    const remaining = parseFloat(a.num_Remaining_Qty || 0);
                    return (
                      <tr key={a.int_Allocation_Id}>
                        <td style={{ fontWeight: 600 }}>{a.txt_Allocation_Code}</td>
                        <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{a.txt_Project_Name} ({a.project_city})</td>
                        <td style={{ fontWeight: 600 }}>{a.txt_Material_Name}</td>
                        <td style={{ fontWeight: 700 }}>{parseFloat(a.num_Allocated_Qty).toLocaleString()}</td>
                        <td style={{ color: '#059669', fontWeight: 600 }}>{parseFloat(a.num_Issued_Qty).toLocaleString()}</td>
                        <td style={{ fontWeight: 700, color: remaining > 0 ? '#d97706' : 'var(--color-text-muted)' }}>
                          {remaining.toLocaleString()}
                        </td>
                        <td>{a.txt_Unit_Name}</td>
                        <td style={{ fontSize: '0.85rem' }}>{new Date(a.dte_Allocation_Date).toLocaleDateString()}</td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{a.txt_Remarks || '-'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            className="btn btn-outline" 
                            style={{ padding: '4px 10px', fontSize: '0.78rem', borderColor: '#db2777', color: '#db2777' }}
                            onClick={() => handleOpenReturn(a)}
                            title="Return surplus material back to central store"
                          >
                            Return Surplus
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 5: REPORTS & VALUATION                                   */}
      {/* ============================================================ */}
      {activeTab === 'reports' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3>Inventory Valuation & Consumption Reports</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Real-time costing, category breakdown, and site consumption analytics</p>
            </div>
            <button className="btn btn-primary" onClick={exportToCSV}>
              <Download size={16} /> Download Inventory CSV
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            {/* Category Valuation Table */}
            <div className="table-card" style={{ padding: '24px' }}>
              <h4 style={{ marginBottom: '16px' }}>Category Valuation Breakdown</h4>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Items</th>
                    <th>Total Value (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData?.categoryBreakdown?.map((c) => (
                    <tr key={c.txt_Category_Name}>
                      <td style={{ fontWeight: 600 }}>{c.txt_Category_Name}</td>
                      <td>{c.itemCount} Items</td>
                      <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>₹{parseFloat(c.categoryValue).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Storage Warehouse Distribution */}
            <div className="table-card" style={{ padding: '24px' }}>
              <h4 style={{ marginBottom: '16px' }}>Storage Locations & Yards</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {Array.from(new Set(materials.map(m => m.txt_Storage_Location || 'Central Warehouse'))).map(loc => {
                  const locMaterials = materials.filter(m => (m.txt_Storage_Location || 'Central Warehouse') === loc);
                  const locVal = locMaterials.reduce((acc, m) => acc + (parseFloat(m.num_Current_Stock) * parseFloat(m.num_Unit_Price)), 0);
                  return (
                    <div key={loc} style={{ padding: '14px', borderRadius: 'var(--radius-sm)', backgroundColor: '#f8fafc', border: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginBottom: '4px' }}>
                        <span>📍 {loc}</span>
                        <span style={{ color: 'var(--color-primary)' }}>₹{locVal.toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        {locMaterials.length} materials stored • {locMaterials.reduce((a, b) => a + parseFloat(b.num_Current_Stock), 0).toLocaleString()} total stock units
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: ADD / EDIT MATERIAL                                 */}
      {/* ============================================================ */}
      {(showAddModal || showEditModal) && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>{showEditModal ? 'Edit Construction Material' : 'Add Construction Material'}</h3>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => { setShowAddModal(false); setShowEditModal(false); }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveMaterial}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Material Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. UltraTech 53 Grade OPC Cement"
                    value={materialForm.materialName}
                    onChange={(e) => setMaterialForm({ ...materialForm, materialName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      className="form-control"
                      value={materialForm.categoryId}
                      onChange={(e) => setMaterialForm({ ...materialForm, categoryId: e.target.value })}
                      required
                    >
                      {categories.map(c => (
                        <option key={c.int_Category_Id} value={c.int_Category_Id}>{c.txt_Category_Name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Unit of Measurement *</label>
                    <select
                      className="form-control"
                      value={materialForm.unitId}
                      onChange={(e) => setMaterialForm({ ...materialForm, unitId: e.target.value })}
                      required
                    >
                      {units.map(u => (
                        <option key={u.int_Unit_Id} value={u.int_Unit_Id}>{u.txt_Unit_Name} ({u.txt_Abbreviation})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {!showEditModal && (
                  <div className="form-group">
                    <label>Opening Quantity Received</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      placeholder="0"
                      value={materialForm.currentQuantity}
                      onChange={(e) => setMaterialForm({ ...materialForm, currentQuantity: e.target.value })}
                    />
                  </div>
                )}

                <div className="form-grid">
                  <div className="form-group">
                    <label>Minimum Stock Level (Safety Reorder) *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      placeholder="10"
                      value={materialForm.minimumLevel}
                      onChange={(e) => setMaterialForm({ ...materialForm, minimumLevel: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Unit Purchase Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      placeholder="380.00"
                      value={materialForm.unitPrice}
                      onChange={(e) => setMaterialForm({ ...materialForm, unitPrice: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Storage Location / Warehouse Yard *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Central Warehouse - Bay A"
                      value={materialForm.storageLocation}
                      onChange={(e) => setMaterialForm({ ...materialForm, storageLocation: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Preferred Supplier (Optional)</label>
                    <select
                      className="form-control"
                      value={materialForm.supplierId}
                      onChange={(e) => setMaterialForm({ ...materialForm, supplierId: e.target.value })}
                    >
                      <option value="">Select Supplier (Optional)</option>
                      {suppliers.map(s => (
                        <option key={s.int_Supplier_Id} value={s.int_Supplier_Id}>{s.txt_Supplier_Name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {showEditModal ? 'Update Material' : 'Save Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: STOCK IN                                            */}
      {/* ============================================================ */}
      {showStockInModal && selectedMaterial && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h3>Record Stock In (Material Intake)</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{selectedMaterial.txt_Material_Name} ({selectedMaterial.txt_Material_Code})</p>
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowStockInModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveStockIn}>
              <div className="modal-body">
                <div style={{ backgroundColor: '#ecfdf5', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span>Current Available Stock: <strong>{selectedMaterial.num_Current_Stock} {selectedMaterial.txt_Unit_Name}</strong></span>
                  <span>Safety Level: <strong>{selectedMaterial.num_Minimum_Level} {selectedMaterial.txt_Unit_Name}</strong></span>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Quantity Received *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      placeholder="e.g. 500"
                      value={stockInForm.quantity}
                      onChange={(e) => setStockInForm({ ...stockInForm, quantity: e.target.value })}
                      required
                      min={0.01}
                    />
                  </div>

                  <div className="form-group">
                    <label>Unit Cost (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={stockInForm.unitCost}
                      onChange={(e) => setStockInForm({ ...stockInForm, unitCost: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {stockInForm.quantity && stockInForm.unitCost && (
                  <div style={{ fontWeight: 700, color: 'var(--color-primary)', marginBottom: '16px', fontSize: '0.95rem' }}>
                    Total Consignment Cost: ₹{(parseFloat(stockInForm.quantity) * parseFloat(stockInForm.unitCost)).toLocaleString('en-IN')}
                  </div>
                )}

                <div className="form-grid">
                  <div className="form-group">
                    <label>Supplier / Vendor</label>
                    <select
                      className="form-control"
                      value={stockInForm.supplierId}
                      onChange={(e) => setStockInForm({ ...stockInForm, supplierId: e.target.value })}
                    >
                      <option value="">Select Vendor</option>
                      {suppliers.map(s => (
                        <option key={s.int_Supplier_Id} value={s.int_Supplier_Id}>{s.txt_Supplier_Name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>PO Number / Challan / Invoice Ref *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. PO-000001 / DC-987"
                      value={stockInForm.reference}
                      onChange={(e) => setStockInForm({ ...stockInForm, reference: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Storage Location Received At</label>
                  <input
                    type="text"
                    className="form-control"
                    value={stockInForm.storageLocation}
                    onChange={(e) => setStockInForm({ ...stockInForm, storageLocation: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Remarks / Quality Inspection Notes</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Batch verified, certificate attached..."
                    value={stockInForm.remarks}
                    onChange={(e) => setStockInForm({ ...stockInForm, remarks: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowStockInModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <CheckCircle2 size={16} /> Confirm Stock Intake
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: STOCK OUT (SITE ISSUE WITH AVAILABILITY GUARD)      */}
      {/* ============================================================ */}
      {showStockOutModal && selectedMaterial && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h3>Record Stock Out (Material Issue)</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{selectedMaterial.txt_Material_Name} ({selectedMaterial.txt_Material_Code})</p>
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowStockOutModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveStockOut}>
              <div className="modal-body">
                <div style={{ backgroundColor: '#eff6ff', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span>Available Stock in Yard: <strong>{selectedMaterial.num_Current_Stock} {selectedMaterial.txt_Unit_Name}</strong></span>
                  <span>Unit Valuation: <strong>₹{selectedMaterial.num_Unit_Price}</strong></span>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Quantity to Issue *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      placeholder="e.g. 100"
                      value={stockOutForm.quantity}
                      onChange={(e) => setStockOutForm({ ...stockOutForm, quantity: e.target.value })}
                      required
                      min={0.01}
                      max={selectedMaterial.num_Current_Stock}
                    />
                    {parseFloat(stockOutForm.quantity) > parseFloat(selectedMaterial.num_Current_Stock) && (
                      <span style={{ color: 'var(--color-danger)', fontSize: '0.78rem', fontWeight: 600 }}>
                        Exceeds available stock of {selectedMaterial.num_Current_Stock}!
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Construction Project Site *</label>
                    <select
                      className="form-control"
                      value={stockOutForm.projectId}
                      onChange={(e) => setStockOutForm({ ...stockOutForm, projectId: e.target.value })}
                      required
                    >
                      {projects.map(p => (
                        <option key={p.int_Project_Id} value={p.int_Project_Id}>{p.txt_Project_Name} ({p.txt_City})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Issued To (Site Engineer / Department) *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Er. Rajesh Sharma / Subcontractor Kumar"
                      value={stockOutForm.issuedTo}
                      onChange={(e) => setStockOutForm({ ...stockOutForm, issuedTo: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Issue Voucher / Indent Ref *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. IND-2026-088"
                      value={stockOutForm.reference}
                      onChange={(e) => setStockOutForm({ ...stockOutForm, reference: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Construction Purpose / Activity *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Tower B 3rd Floor Slab Casting"
                    value={stockOutForm.purpose}
                    onChange={(e) => setStockOutForm({ ...stockOutForm, purpose: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Additional Remarks</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={stockOutForm.remarks}
                    onChange={(e) => setStockOutForm({ ...stockOutForm, remarks: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowStockOutModal(false)}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={parseFloat(stockOutForm.quantity) > parseFloat(selectedMaterial.num_Current_Stock)}
                >
                  <CheckCircle2 size={16} /> Confirm Material Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: PROJECT ALLOCATION                                  */}
      {/* ============================================================ */}
      {showAllocateModal && selectedMaterial && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h3>Allocate Material to Construction Site</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{selectedMaterial.txt_Material_Name}</p>
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowAllocateModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveAllocate}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Select Target Project Site *</label>
                  <select
                    className="form-control"
                    value={allocateForm.projectId}
                    onChange={(e) => setAllocateForm({ ...allocateForm, projectId: e.target.value })}
                    required
                  >
                    {projects.map(p => (
                      <option key={p.int_Project_Id} value={p.int_Project_Id}>{p.txt_Project_Name} ({p.txt_City})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Quantity to Allocate *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    placeholder={`Max: ${selectedMaterial.num_Current_Stock}`}
                    value={allocateForm.allocatedQuantity}
                    onChange={(e) => setAllocateForm({ ...allocateForm, allocatedQuantity: e.target.value })}
                    required
                    min={0.01}
                    max={selectedMaterial.num_Current_Stock}
                  />
                </div>

                <div className="form-group">
                  <label>Allocation Remarks / Project Milestone</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={allocateForm.remarks}
                    onChange={(e) => setAllocateForm({ ...allocateForm, remarks: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowAllocateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Allocate to Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 5: SITE RETURN TO WAREHOUSE                            */}
      {/* ============================================================ */}
      {showReturnModal && selectedAllocation && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h3>Return Material from Site to Central Yard</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{selectedAllocation.txt_Material_Name} ({selectedAllocation.txt_Project_Name})</p>
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowReturnModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveReturn}>
              <div className="modal-body">
                <div style={{ backgroundColor: '#fdf2f8', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
                  Allocated to Site: <strong>{selectedAllocation.num_Allocated_Qty} {selectedAllocation.txt_Unit_Name}</strong> • Issued: <strong>{selectedAllocation.num_Issued_Qty}</strong>
                </div>

                <div className="form-group">
                  <label>Surplus Quantity Returned *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    placeholder="e.g. 50"
                    value={returnForm.returnQuantity}
                    onChange={(e) => setReturnForm({ ...returnForm, returnQuantity: e.target.value })}
                    required
                    min={0.01}
                  />
                </div>

                <div className="form-group">
                  <label>Return Reason & Condition</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Unused undamaged surplus from Phase 1..."
                    value={returnForm.remarks}
                    onChange={(e) => setReturnForm({ ...returnForm, remarks: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowReturnModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Process Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default InventoryManagement;
