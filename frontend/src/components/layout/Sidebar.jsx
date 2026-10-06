import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import {
  IconBuilding,
  IconFileText,
  IconShoppingCart,
  IconPackage,
  IconTruck,
  IconClipboardCheck,
  IconLayers,
  IconChevronLeft,
  IconChevronRight
} from '../common/Icons';

export const Sidebar = ({ activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen }) => {
  const { user } = useAuth();
  const { projects, catalog, rfqs, purchaseOrders, deliveries } = usePortal();

  if (!user) return null;

  const activeRFQsCount = rfqs.filter(r => r.status === 'Broadcasted' || r.status === 'Quotes Received').length;
  const pendingGRNCount = deliveries.filter(d => d.status === 'Pending Site Sign-Off').length;
  const activePOsCount = purchaseOrders.filter(p => p.fulfillmentStatus !== 'Delivered').length;

  const builderNavItems = [
    { id: 'dashboard', label: 'Dashboard Overview', sub: 'Site budget & work summary', icon: IconLayers, badge: null },
    { id: 'projects', label: 'Construction Sites', sub: 'Manage project sites', icon: IconBuilding, badge: projects.length ? `${projects.length} Site${projects.length === 1 ? '' : 's'}` : null },
    { id: 'requests', label: 'Request Materials (RFQs)', sub: 'Ask suppliers for prices', icon: IconFileText, badge: activeRFQsCount ? `${activeRFQsCount} Active` : null },
    { id: 'purchase-orders', label: 'Purchase Orders (POs)', sub: 'View confirmed orders', icon: IconShoppingCart, badge: activePOsCount ? `${activePOsCount} Open` : null },
    { id: 'deliveries', label: 'Site Truck Deliveries', sub: 'Inspect & sign off arrivals', icon: IconClipboardCheck, badge: pendingGRNCount ? `${pendingGRNCount} Pending` : null },
  ];

  const supplierNavItems = [
    { id: 'dashboard', label: 'Supplier Dashboard', sub: 'Bids & revenue overview', icon: IconLayers, badge: null },
    { id: 'quotes', label: 'Incoming Bids (RFQs)', sub: 'View requests & send prices', icon: IconFileText, badge: activeRFQsCount ? `${activeRFQsCount} Open` : null },
    { id: 'catalog', label: 'My Item Catalog', sub: 'Manage products & unit rates', icon: IconPackage, badge: catalog.length ? `${catalog.length} Item${catalog.length === 1 ? '' : 's'}` : null },
    { id: 'purchase-orders', label: 'Incoming Orders (POs)', sub: 'Confirmed buyer orders', icon: IconShoppingCart, badge: activePOsCount ? `${activePOsCount} POs` : null },
    { id: 'deliveries', label: 'Truck Dispatches', sub: 'Log vehicles sent to site', icon: IconTruck, badge: pendingGRNCount ? `${pendingGRNCount} Active` : null },
  ];

  const currentNavItems = user.role === 'BUILDER' ? builderNavItems : supplierNavItems;

  return (
    <>
      {/* Mobile Backdrop overlay when open on smaller screens */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-30 transition-opacity"
        />
      )}

      <aside className={`
        ${isSidebarOpen ? 'w-full md:w-64 block' : 'hidden md:flex md:w-20'}
        bg-white dark:bg-[#0F172A] border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 
        flex flex-col shrink-0 transition-all duration-300 ease-in-out z-30 relative
      `}>
        
        {/* Role Banner / Collapse Header inside Sidebar */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          {isSidebarOpen ? (
            <div className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between w-full ${
              user.role === 'BUILDER'
                ? 'bg-purple-50 dark:bg-[#7C3AED]/20 border-purple-200 dark:border-[#7C3AED]/50 text-[#7C3AED] dark:text-purple-300'
                : 'bg-indigo-50 dark:bg-[#844FC1]/20 border-indigo-200 dark:border-[#844FC1]/50 text-[#844FC1] dark:text-indigo-300'
            }`}>
              <div className="flex items-center gap-2">
                {user.role === 'BUILDER' ? <IconBuilding className="w-4 h-4 text-[#7C3AED] dark:text-purple-400" /> : <IconTruck className="w-4 h-4 text-[#844FC1] dark:text-indigo-400" />}
                <span className="font-outfit uppercase tracking-wider font-bold">{user.role} MODE</span>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 hover:bg-white/60 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
                title="Collapse Sidebar"
              >
                <IconChevronLeft className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="w-full p-2.5 rounded-xl bg-purple-50 dark:bg-slate-800 border border-purple-200 dark:border-slate-700 text-[#7C3AED] dark:text-purple-300 flex items-center justify-center hover:scale-105 transition"
              title="Expand Sidebar Navigation"
            >
              <IconChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {currentNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (typeof window !== 'undefined' && window.innerWidth < 768) {
                    setIsSidebarOpen(false);
                  }
                }}
                title={item.label}
                className={`w-full flex items-center ${isSidebarOpen ? 'justify-between p-3' : 'justify-center p-3'} rounded-2xl transition-all duration-200 text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-[#7C3AED] to-[#844FC1] text-white shadow-md shadow-[#7C3AED]/25 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-purple-50/70 dark:hover:bg-slate-800/80 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                  {isSidebarOpen && (
                    <div>
                      <span className="font-bold font-outfit text-xs md:text-sm block">{item.label}</span>
                      <span className={`text-[10px] block leading-tight ${isActive ? 'text-purple-100' : 'text-slate-400 dark:text-slate-400'}`}>
                        {item.sub}
                      </span>
                    </div>
                  )}
                </div>

                {isSidebarOpen && item.badge && (
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold shrink-0 ml-1 ${
                    isActive
                      ? 'bg-white text-[#7C3AED] shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Direct Procurement Footer */}
        {isSidebarOpen && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-[#F3F4F6] dark:bg-slate-950/50">
            <div className="p-3 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 shadow-2xs">
              <p className="text-[11px] font-bold text-[#7C3AED] dark:text-purple-400 font-outfit uppercase tracking-wider mb-1">
                Direct Tech Procurement
              </p>
              <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                Connects builders directly with suppliers.
              </p>
            </div>
          </div>
        )}

      </aside>
    </>
  );
};
