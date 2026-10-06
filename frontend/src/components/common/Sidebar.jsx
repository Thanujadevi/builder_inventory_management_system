import React from 'react';
import { useRole } from '../../context/RoleContext';
import { usePortal } from '../../context/PortalContext';
import {
  IconBuilding,
  IconFileText,
  IconShoppingCart,
  IconPackage,
  IconTruck,
  IconUsers,
  IconClipboardCheck,
  IconLayers
} from './Icons';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { role } = useRole();
  const { rfqs, quotes, purchaseOrders, deliveries } = usePortal();

  // Calculate dynamic badge stats
  const activeRFQsCount = rfqs.filter(r => r.status === 'Broadcasted' || r.status === 'Quotes Received').length;
  const pendingQuotesCount = quotes.filter(q => q.status === 'Submitted').length;
  const pendingGRNCount = deliveries.filter(d => d.status === 'Pending Site Sign-Off').length;
  const activePOsCount = purchaseOrders.filter(p => p.fulfillmentStatus !== 'Delivered').length;

  const builderNavItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: IconLayers, badge: null },
    { id: 'projects', label: 'Construction Projects', icon: IconBuilding, badge: '4 Sites' },
    { id: 'requests', label: 'Material Requests / RFQ', icon: IconFileText, badge: activeRFQsCount ? `${activeRFQsCount} Active` : null },
    { id: 'purchase-orders', label: 'Purchase Orders (PO)', icon: IconShoppingCart, badge: activePOsCount ? `${activePOsCount} Open` : null },
    { id: 'deliveries', label: 'Site Deliveries & GRN', icon: IconClipboardCheck, badge: pendingGRNCount ? `${pendingGRNCount} Pending` : null },
  ];

  const supplierNavItems = [
    { id: 'dashboard', label: 'Supplier Dashboard', icon: IconLayers, badge: null },
    { id: 'quotes', label: 'Incoming RFQs & Bidding', icon: IconFileText, badge: activeRFQsCount ? `${activeRFQsCount} Open` : null },
    { id: 'catalog', label: 'Product Catalog & Rates', icon: IconPackage, badge: '7 Items' },
    { id: 'purchase-orders', label: 'Incoming PO Orders', icon: IconShoppingCart, badge: activePOsCount ? `${activePOsCount} POs` : null },
    { id: 'deliveries', label: 'Dispatch & Deliveries', icon: IconTruck, badge: pendingGRNCount ? `${pendingGRNCount} Shipments` : null },
  ];

  const currentNavItems = role === 'BUILDER' ? builderNavItems : supplierNavItems;

  return (
    <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col shrink-0">
      
      {/* Role Banner Pill */}
      <div className="p-4 border-b border-slate-800/80">
        <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${
          role === 'BUILDER'
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            : 'bg-blue-600/10 border-blue-500/30 text-blue-300'
        }`}>
          <div className="flex items-center gap-2">
            {role === 'BUILDER' ? <IconBuilding className="w-4 h-4 text-amber-400" /> : <IconTruck className="w-4 h-4 text-blue-400" />}
            <span className="font-outfit uppercase tracking-wider">{role} WORKSPACE</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {currentNavItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-xs md:text-sm transition-all duration-200 ${
                isActive
                  ? role === 'BUILDER'
                    ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-400 border border-amber-500/30 font-semibold shadow-sm'
                    : 'bg-gradient-to-r from-blue-600/20 to-blue-600/5 text-blue-400 border border-blue-500/30 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? (role === 'BUILDER' ? 'text-amber-400' : 'text-blue-400') : 'text-slate-500'}`} />
                <span className="font-outfit">{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  isActive
                    ? role === 'BUILDER'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Direct Procurement Badge Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 text-slate-400">
          <p className="text-[11px] font-bold text-slate-200 font-outfit uppercase tracking-wider mb-1">
            Zero Intermediary Architecture
          </p>
          <p className="text-[10px] leading-relaxed text-slate-400">
            Direct builder-to-supplier RFQs, side-by-side quote matrix, and site GRN inspection.
          </p>
        </div>
      </div>

    </aside>
  );
};
