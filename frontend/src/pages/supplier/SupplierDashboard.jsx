import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import {
  IconTruck,
  IconPackage,
  IconFileText,
  IconShoppingCart,
  IconCheckCircle,
  IconClock
} from '../../components/common/Icons';
import { StatusBadge } from '../../components/common/StatusBadge';

export const SupplierDashboard = ({ setActiveTab, openBiddingForm, openDispatchModal }) => {
  const { user } = useAuth();
  const { catalog, rfqs, quotes, purchaseOrders, deliveries } = usePortal();

  const openBidsForSupplier = rfqs.filter(r => r.status === 'Broadcasted' || r.status === 'Quotes Received');
  const pendingDispatches = purchaseOrders.filter(p => p.fulfillmentStatus === 'Issued' || p.fulfillmentStatus === 'Processing');

  return (
    <div className="space-y-6">
      
      {/* Hero Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#7C3AED] via-[#844FC1] to-[#6D28D9] text-white shadow-xl shadow-[#7C3AED]/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider font-mono bg-[#0F172A] text-purple-300 border border-purple-400/30">
                SUPPLIER PORTAL ACTIVE
              </span>
              <span className="text-xs text-purple-100 font-mono font-semibold">Welcome back, {user?.name}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white font-outfit tracking-tight">
              Supplier B2B Bidding & Order Center
            </h1>
            <p className="text-xs md:text-sm text-purple-100 font-medium mt-1.5 max-w-2xl leading-relaxed">
              Receive real-time builder RFQs matching your portfolio, submit line-item unit rates with GST and freight terms, track PO dispatches, and manage inventory rates.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('quotes')}
            className="px-5 py-3.5 bg-[#0F172A] hover:bg-slate-900 text-white font-extrabold rounded-2xl text-xs flex items-center gap-2.5 shadow-xl shrink-0 transition border border-purple-400/20 group hover:scale-[1.02]"
          >
            <IconFileText className="w-4 h-4 text-purple-400" />
            View Open Builder RFQs ({openBidsForSupplier.length})
          </button>
        </div>
      </div>

      {/* TOP METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xs light-card-hover">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-outfit uppercase">Catalog Items Live</span>
            <div className="p-2 bg-purple-100 dark:bg-[#7C3AED]/20 text-[#7C3AED] dark:text-purple-300 rounded-xl">
              <IconPackage className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#0F172A] dark:text-white font-mono">{catalog.length} Items</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">Across 7 Categories</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xs light-card-hover">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-outfit uppercase">Open Builder RFQs</span>
            <div className="p-2 bg-indigo-100 dark:bg-[#844FC1]/20 text-[#844FC1] dark:text-indigo-300 rounded-xl">
              <IconFileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#7C3AED] dark:text-purple-300 font-mono">{openBidsForSupplier.length}</p>
          <p className="text-[11px] text-[#7C3AED] dark:text-purple-400 font-bold mt-1">Matching Supply Portfolio</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xs light-card-hover">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-outfit uppercase">POs Acknowledged</span>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 rounded-xl">
              <IconShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">{purchaseOrders.length}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">Total Confirmed Orders</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xs light-card-hover">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-outfit uppercase">Pending Dispatches</span>
            <div className="p-2 bg-purple-100 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300 rounded-xl">
              <IconTruck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-900 dark:text-purple-300 font-mono">{pendingDispatches.length}</p>
          <p className="text-[11px] text-[#7C3AED] dark:text-purple-400 font-bold mt-1">Ready for Truck Assignment</p>
        </div>

      </div>

      {/* SUPPLIER DASHBOARD MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <IconFileText className="w-5 h-5 text-[#7C3AED] dark:text-purple-400" />
                <h3 className="text-base font-bold text-[#0F172A] dark:text-white font-outfit">Open Builder RFQs For Bidding</h3>
              </div>
              <button onClick={() => setActiveTab('quotes')} className="text-xs text-[#7C3AED] dark:text-purple-400 font-bold hover:underline">
                View All Bids →
              </button>
            </div>

            <div className="space-y-3">
              {openBidsForSupplier.length === 0 ? (
                <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-xs italic">
                  No open builder RFQs available for bidding at the moment.
                </div>
              ) : (
                openBidsForSupplier.slice(0, 3).map(rfq => (
                  <div key={rfq.id} className="p-4 rounded-2xl bg-[#F3F4F6]/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-[#7C3AED] dark:text-purple-300 text-xs">{rfq.id}</span>
                        <StatusBadge type="urgency" value={rfq.urgency} />
                      </div>
                      <h4 className="font-bold text-[#0F172A] dark:text-white text-sm">{rfq.projectName}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{rfq.items.length} line item(s) • Required: <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{rfq.requiredByDate}</span></p>
                    </div>

                    <button
                      onClick={() => openBiddingForm(rfq.id)}
                      className="px-4 py-2 bg-gradient-to-r from-[#7C3AED] to-[#844FC1] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white font-bold rounded-xl text-xs shadow-md shadow-[#7C3AED]/20 transition shrink-0"
                    >
                      Submit Line-Item Bid →
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#0F172A] dark:text-white font-outfit">Pending Orders To Dispatch</h3>
            {pendingDispatches.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">No orders pending dispatch right now.</p>
            ) : (
              pendingDispatches.map(po => (
                <div key={po.id} className="p-3.5 rounded-2xl bg-[#F3F4F6]/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-[#7C3AED] dark:text-purple-300">{po.id}</span>
                    <span className="font-mono font-bold text-[#0F172A] dark:text-white">₹{po.grandTotal.toLocaleString()}</span>
                  </div>
                  <p className="font-bold text-[#0F172A] dark:text-white">{po.projectName}</p>
                  <button
                    onClick={() => openDispatchModal(po.id)}
                    className="w-full py-2 bg-gradient-to-r from-[#7C3AED] to-[#844FC1] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white font-bold rounded-xl text-xs shadow-sm transition"
                  >
                    Log Dispatch Truck →
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
