import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Users, Package, FileText, CheckSquare, 
  ShoppingCart, CreditCard, Layers, Star, Building2, Store, FileSpreadsheet
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo-icon">BC</div>
        <div className="sidebar-brand-text">
          <h2>BuilderConnect</h2>
          <span>Procurement Platform</span>
        </div>
      </div>

      <nav className="sidebar-menu">
        {user.role === 'ADMIN' && (
          <>
            <NavLink to="/admin/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} /> Admin Dashboard
            </NavLink>
            <NavLink to="/admin/suppliers" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Users size={18} /> Supplier Approvals
            </NavLink>
            <NavLink to="/admin/categories" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Layers size={18} /> Master Categories
            </NavLink>
            <NavLink to="/admin/products" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Package size={18} /> Master Products
            </NavLink>
            <NavLink to="/materials/inventory" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Layers size={18} /> Inventory Management
            </NavLink>
          </>
        )}

        {user.role === 'BUILDER' && (
          <>
            <NavLink to="/builder/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} /> Builder Dashboard
            </NavLink>
            <NavLink to="/builder/projects" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Building2 size={18} /> Construction Projects
            </NavLink>
            <NavLink to="/builder/rfqs" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <FileText size={18} /> Material Requirements / RFQs
            </NavLink>
            <NavLink to="/builder/orders" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <ShoppingCart size={18} /> Purchase Orders
            </NavLink>
            <NavLink to="/builder/payments" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <CreditCard size={18} /> Manual Payments
            </NavLink>
            <NavLink to="/builder/inventory" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Layers size={18} /> Inventory Management
            </NavLink>
          </>
        )}

        {user.role === 'SUPPLIER' && (
          <>
            <NavLink to="/supplier/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} /> Supplier Dashboard
            </NavLink>
            <NavLink to="/supplier/products" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Store size={18} /> Product Catalogue
            </NavLink>
            <NavLink to="/supplier/rfqs" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <FileSpreadsheet size={18} /> Open Builder RFQs
            </NavLink>
            <NavLink to="/supplier/orders" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <ShoppingCart size={18} /> Orders & Delivery
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
