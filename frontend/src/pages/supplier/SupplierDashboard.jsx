import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import StatCard from '../../components/StatCard';
import api from '../../services/api';
import { Store, FileSpreadsheet, ShoppingCart, Star, Layers, PackageCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const SupplierDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboards/supplier');
        setStats(response.data.stats);
      } catch (error) {
        console.error('Failed to load supplier dashboard stats:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading supplier dashboard...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h2>Supplier Sales & Quotations Portal</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Catalogue, active builder RFQs, and purchase order dispatches</p>
        </div>
        <Link to="/supplier/rfqs" className="btn btn-primary">
          <FileSpreadsheet size={18} /> View Open Builder RFQs
        </Link>
      </div>

      <div className="metrics-grid">
        <StatCard icon={Store} label="Catalogue Products" value={`${stats?.activeProducts || 0} / ${stats?.totalProducts || 0}`} color="#2563eb" bgColor="#eff6ff" />
        <StatCard icon={Layers} label="Active Stock Units" value={stats?.currentStock || 0} color="#059669" bgColor="#ecfdf5" />
        <StatCard icon={FileSpreadsheet} label="Open RFQs Received" value={stats?.rfqsReceived || 0} color="#7c3aed" bgColor="#f5f3ff" />
        <StatCard icon={FileSpreadsheet} label="Quotations Submitted" value={stats?.quotationsSubmitted || 0} color="#d97706" bgColor="#fffbeb" />
        <StatCard icon={ShoppingCart} label="Accepted Quotations" value={stats?.acceptedQuotations || 0} color="#10b981" bgColor="#ecfdf5" />
        <StatCard icon={ShoppingCart} label="Purchase Orders" value={stats?.purchaseOrders || 0} color="#2563eb" bgColor="#eff6ff" />
        <StatCard icon={PackageCheck} label="Pending Deliveries" value={stats?.pendingDeliveries || 0} color="#dc2626" bgColor="#fef2f2" />
        <StatCard icon={Star} label="Average Rating" value={`⭐ ${stats?.averageRating || 0.0} (${stats?.reviewCount || 0})`} color="#f59e0b" bgColor="#fffbeb" />
      </div>
    </MainLayout>
  );
};

export default SupplierDashboard;
