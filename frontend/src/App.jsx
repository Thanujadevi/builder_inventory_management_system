import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProcurementProvider, usePortal } from './context/ProcurementContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';

// Auth Page
import { LoginPage } from './pages/auth/LoginPage';

// Builder Pages
import { BuilderDashboard } from './pages/builder/BuilderDashboard';
import { ProjectsPage } from './pages/builder/ProjectsPage';
import { RequestsPage } from './pages/builder/RequestsPage';
import { BuilderPOsPage } from './pages/builder/BuilderPOsPage';
import { SiteDeliveriesPage } from './pages/builder/SiteDeliveriesPage';

// Supplier Pages
import { SupplierDashboard } from './pages/supplier/SupplierDashboard';
import { CatalogPage } from './pages/supplier/CatalogPage';
import { QuotesPage } from './pages/supplier/QuotesPage';
import { SupplierPOsPage } from './pages/supplier/SupplierPOsPage';
import { SupplierDispatchesPage } from './pages/supplier/SupplierDispatchesPage';

// Modals
import { ProfileModal } from './components/common/ProfileModal';
import { ProjectCreateModal } from './components/builder/ProjectCreateModal';
import { RFQCreateWizard } from './components/builder/RFQCreateWizard';
import { QuoteCompareModal } from './components/builder/QuoteCompareModal';
import { GRNSignOffModal } from './components/builder/GRNSignOffModal';
import { BiddingFormModal } from './components/supplier/BiddingFormModal';
import { DispatchModal } from './components/supplier/DispatchModal';
import { CatalogItemModal } from './components/supplier/CatalogItemModal';
import { POPrintModal } from './components/common/POPrintModal';

const AppMain = () => {
  const { user } = useAuth();
  const { toast } = usePortal();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Modal states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateRFQOpen, setIsCreateRFQOpen] = useState(false);
  const [compareRFQId, setCompareRFQId] = useState(null);
  const [biddingRFQId, setBiddingRFQId] = useState(null);
  const [dispatchPOId, setDispatchPOId] = useState(null);
  const [grnDeliveryId, setGrnDeliveryId] = useState(null);
  const [poPrintId, setPoPrintId] = useState(null);
  const [catalogModalState, setCatalogModalState] = useState({ isOpen: false, item: null });

  // 1. If not authenticated, render Login Page
  if (!user) {
    return <LoginPage />;
  }

  // 2. Render Role-Aware Pages
  const renderActivePage = () => {
    if (user.role === 'BUILDER') {
      switch (activeTab) {
        case 'dashboard':
          return (
            <BuilderDashboard
              setActiveTab={setActiveTab}
              openCreateRFQ={() => setIsCreateRFQOpen(true)}
              openCompareQuote={(rfqId) => setCompareRFQId(rfqId)}
              openGRNModal={(delId) => setGrnDeliveryId(delId)}
            />
          );
        case 'projects':
          return (
            <ProjectsPage
              openCreateRFQ={() => setIsCreateRFQOpen(true)}
              openCreateProject={() => setIsCreateProjectOpen(true)}
            />
          );
        case 'requests':
          return (
            <RequestsPage
              openCreateRFQ={() => setIsCreateRFQOpen(true)}
              openCompareQuote={(rfqId) => setCompareRFQId(rfqId)}
            />
          );
        case 'purchase-orders':
          return <BuilderPOsPage openPOPrintModal={(poId) => setPoPrintId(poId)} />;
        case 'deliveries':
          return <SiteDeliveriesPage openGRNModal={(delId) => setGrnDeliveryId(delId)} />;
        default:
          return <BuilderDashboard setActiveTab={setActiveTab} openCreateRFQ={() => setIsCreateRFQOpen(true)} />;
      }
    } else {
      // SUPPLIER WORKSPACE
      switch (activeTab) {
        case 'dashboard':
          return (
            <SupplierDashboard
              setActiveTab={setActiveTab}
              openBiddingForm={(rfqId) => setBiddingRFQId(rfqId)}
              openDispatchModal={(poId) => setDispatchPOId(poId)}
            />
          );
        case 'quotes':
          return <QuotesPage openBiddingForm={(rfqId) => setBiddingRFQId(rfqId)} />;
        case 'catalog':
          return (
            <CatalogPage
              openCatalogModal={(item) => setCatalogModalState({ isOpen: true, item })}
            />
          );
        case 'purchase-orders':
          return (
            <SupplierPOsPage
              openPOPrintModal={(poId) => setPoPrintId(poId)}
              openDispatchModal={(poId) => setDispatchPOId(poId)}
            />
          );
        case 'deliveries':
          return <SupplierDispatchesPage />;
        default:
          return <SupplierDashboard setActiveTab={setActiveTab} openBiddingForm={(rfqId) => setBiddingRFQId(rfqId)} />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#0F172A] text-[#0F172A] dark:text-slate-100 flex flex-col font-sans selection:bg-[#7C3AED] selection:text-white transition-colors">
      
      {/* Navbar Header */}
      <Header
        openProfileModal={() => setIsProfileModalOpen(true)}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Main Layout */}
      <div className="flex-1 flex flex-col md:flex-row relative">
        
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        {/* Dynamic Main Workspace */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full transition-all duration-300">
          {renderActivePage()}
        </main>
      </div>

      {/* Interactive Modals */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <ProjectCreateModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
      />

      <RFQCreateWizard
        isOpen={isCreateRFQOpen}
        onClose={() => setIsCreateRFQOpen(false)}
      />

      <QuoteCompareModal
        rfqId={compareRFQId}
        isOpen={!!compareRFQId}
        onClose={() => setCompareRFQId(null)}
      />

      <GRNSignOffModal
        deliveryId={grnDeliveryId}
        isOpen={!!grnDeliveryId}
        onClose={() => setGrnDeliveryId(null)}
      />

      <BiddingFormModal
        rfqId={biddingRFQId}
        isOpen={!!biddingRFQId}
        onClose={() => setBiddingRFQId(null)}
      />

      <DispatchModal
        poId={dispatchPOId}
        isOpen={!!dispatchPOId}
        onClose={() => setDispatchPOId(null)}
      />

      <CatalogItemModal
        itemToEdit={catalogModalState.item}
        isOpen={catalogModalState.isOpen}
        onClose={() => setCatalogModalState({ isOpen: false, item: null })}
      />

      <POPrintModal
        poId={poPrintId}
        isOpen={!!poPrintId}
        onClose={() => setPoPrintId(null)}
      />

      {/* Global Toast Alert */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-500/40 text-slate-900 dark:text-slate-100 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 ring-1 ring-amber-400/30">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
            <p className="text-xs font-bold font-outfit">{toast.message}</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProcurementProvider>
          <AppMain />
        </ProcurementProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
