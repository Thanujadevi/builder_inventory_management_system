import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Auth Pages
import Login from '../pages/auth/Login';
import RegisterBuilder from '../pages/auth/RegisterBuilder';
import RegisterSupplier from '../pages/auth/RegisterSupplier';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import SupplierApprovals from '../pages/admin/SupplierApprovals';
import MasterCategories from '../pages/admin/MasterCategories';
import MasterProducts from '../pages/admin/MasterProducts';

// Builder Pages
import BuilderDashboard from '../pages/builder/BuilderDashboard';
import BuilderProjects from '../pages/builder/BuilderProjects';
import CreateRFQ from '../pages/builder/CreateRFQ';
import RFQDetails from '../pages/builder/RFQDetails';
import SupplierRecommendation from '../pages/builder/SupplierRecommendation';
import PurchaseOrders from '../pages/builder/PurchaseOrders';
import ManualPayments from '../pages/builder/ManualPayments';
import ProjectInventory from '../pages/builder/ProjectInventory';
import InventoryManagement from '../pages/builder/InventoryManagement';

// Supplier Pages
import SupplierDashboard from '../pages/supplier/SupplierDashboard';
import ProductCatalogue from '../pages/supplier/ProductCatalogue';
import SupplierRFQs from '../pages/supplier/SupplierRFQs';
import SubmitQuotation from '../pages/supplier/SubmitQuotation';
import SupplierOrders from '../pages/supplier/SupplierOrders';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register-builder" element={<RegisterBuilder />} />
      <Route path="/register-supplier" element={<RegisterSupplier />} />

      {/* Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/suppliers" element={<SupplierApprovals />} />
        <Route path="/admin/categories" element={<MasterCategories />} />
        <Route path="/admin/products" element={<MasterProducts />} />
        <Route path="/admin/inventory" element={<InventoryManagement />} />
      </Route>

      {/* Builder Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['BUILDER']} />}>
        <Route path="/builder/dashboard" element={<BuilderDashboard />} />
        <Route path="/builder/projects" element={<BuilderProjects />} />
        <Route path="/builder/rfqs" element={<BuilderDashboard />} />
        <Route path="/builder/rfqs/new" element={<CreateRFQ />} />
        <Route path="/builder/rfqs/:id" element={<RFQDetails />} />
        <Route path="/builder/recommendations/:reqId" element={<SupplierRecommendation />} />
        <Route path="/builder/orders" element={<PurchaseOrders />} />
        <Route path="/builder/payments" element={<ManualPayments />} />
        <Route path="/builder/inventory" element={<InventoryManagement />} />
      </Route>

      {/* Shared Materials Inventory Route */}
      <Route element={<ProtectedRoute allowedRoles={['BUILDER', 'ADMIN']} />}>
        <Route path="/materials/inventory" element={<InventoryManagement />} />
      </Route>

      {/* Supplier Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['SUPPLIER']} />}>
        <Route path="/supplier/dashboard" element={<SupplierDashboard />} />
        <Route path="/supplier/products" element={<ProductCatalogue />} />
        <Route path="/supplier/rfqs" element={<SupplierRFQs />} />
        <Route path="/supplier/quotations/new/:reqId" element={<SubmitQuotation />} />
        <Route path="/supplier/orders" element={<SupplierOrders />} />
      </Route>

      {/* Fallback Redirection */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
