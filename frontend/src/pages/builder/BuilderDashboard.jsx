import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import {
  IconBuilding,
  IconFileText,
  IconShoppingCart,
  IconTruck,
  IconPlus,
  IconCheckCircle
} from '../../components/common/Icons';
import { StatusBadge } from '../../components/common/StatusBadge';

export const BuilderDashboard = ({ setActiveTab, openCreateRFQ, openCompareQuote, openGRNModal }) => {
  const { user } = useAuth();
  const { projects, rfqs, quotes, purchaseOrders, deliveries } = usePortal();

  const totalBudget = projects.reduce((acc, p) => acc + p.budgetAllocated, 0);
  const totalSpend = projects.reduce((acc, p) => acc + p.materialSpend, 0);
  const activeRFQs = rfqs.filter(r => r.status === 'Broadcasted' || r.status === 'Quotes Received');
  const pendingDeliveries = deliveries.filter(d => d.status === 'Pending Site Sign-Off');

  return (
    <div className="space-y-6">
      
      {/* Hero Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#7C3AED] via-[#844FC1] to-[#6D28D9] text-white shadow-xl shadow-[#7C3AED]/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider font-mono bg-[#0F172A] text-purple-300 border border-purple-400/30">
                BUILDER PORTAL ACTIVE
              </span>
              <span className="text-xs text-purple-100 font-mono font-semibold">Welcome, {user?.name}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white font-outfit tracking-tight">
              Construction Project Procurement Hub
            </h1>
            <p className="text-xs md:text-sm text-purple-100 font-medium mt-1.5 max-w-2xl leading-relaxed">
              Request material prices directly from suppliers, compare bids side-by-side, place orders, and inspect site truck deliveries.
            </p>
          </div>

          <button
            onClick={openCreateRFQ}
            className="px-5 py-3.5 bg-[#0F172A] hover:bg-slate-900 text-white font-extrabold rounded-2xl text-xs flex items-center gap-2.5 shadow-xl shrink-0 transition border border-purple-400/20 group hover:scale-[1.02]"
          >
            <IconPlus className="w-4 h-4 stroke-[3] text-purple-400 group-hover:rotate-90 transition-transform duration-300" />
            Request Material Prices (RFQ)
          </button>
        </div>
      </div>

      {/* TOP METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xs light-card-hover">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-outfit uppercase">Total Material Budget</span>
            <div className="p-2 bg-purple-100 dark:bg-[#7C3AED]/20 text-[#7C3AED] dark:text-purple-300 rounded-xl">
              <IconBuilding className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#0F172A] dark:text-white font-mono">₹{(totalBudget / 10000000).toFixed(2)} Cr</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">Allocated across {projects.length} sites</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xs light-card-hover">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-outfit uppercase">Material Spend to Date</span>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 rounded-xl">
              <IconShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">₹{(totalSpend / 10000000).toFixed(2)} Cr</p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
            <div className="bg-gradient-to-r from-[#7C3AED] to-emerald-500 h-full rounded-full" style={{ width: `${totalBudget ? Math.min(100, (totalSpend / totalBudget) * 100) : 0}%` }}></div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xs light-card-hover">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-outfit uppercase">Active Price Requests</span>
            <div className="p-2 bg-indigo-100 dark:bg-[#844FC1]/20 text-[#844FC1] dark:text-indigo-300 rounded-xl">
              <IconFileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#7C3AED] dark:text-purple-300 font-mono">{activeRFQs.length}</p>
          <p className="text-[11px] text-[#7C3AED] dark:text-purple-400 font-bold mt-1 cursor-pointer hover:underline" onClick={() => setActiveTab('requests')}>
            View supplier bids →
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xs light-card-hover">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-outfit uppercase">Pending Site Deliveries</span>
            <div className="p-2 bg-purple-100 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300 rounded-xl">
              <IconTruck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-900 dark:text-purple-300 font-mono">{pendingDeliveries.length}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">Trucks needing inspection</p>
        </div>

      </div>

      {/* DASHBOARD CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Material Requests */}
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <IconFileText className="w-5 h-5 text-[#7C3AED] dark:text-purple-400" />
                <h3 className="text-base font-bold text-[#0F172A] dark:text-white font-outfit">Active Material Requests (RFQs)</h3>
              </div>
              <button onClick={() => setActiveTab('requests')} className="text-xs text-[#7C3AED] dark:text-purple-400 font-bold hover:underline">
                View All Requests ({rfqs.length}) →
              </button>
            </div>

            <div className="space-y-3">
              {rfqs.length === 0 ? (
                <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-xs italic">
                  No material price requests active. Click "Request Material Prices (RFQ)" above to create one.
                </div>
              ) : (
                rfqs.slice(0, 3).map(rfq => {
                  const quoteCount = quotes.filter(q => q.rfqId === rfq.id).length;
                  return (
                    <div key={rfq.id} className="p-4 rounded-2xl bg-[#F3F4F6]/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-[#7C3AED] dark:text-purple-300 text-xs">{rfq.id}</span>
                          <StatusBadge type="urgency" value={rfq.urgency} />
                          <StatusBadge type="rfqStatus" value={rfq.status} />
                        </div>
                        <h4 className="font-bold text-[#0F172A] dark:text-white text-sm">{rfq.projectName}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{rfq.items.length} material item(s) • Delivery Needed: <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{rfq.requiredByDate}</span></p>
                      </div>

                      <div>
                        {quoteCount > 0 ? (
                          <button
                            onClick={() => openCompareQuote(rfq.id)}
                            className="px-3.5 py-2 bg-gradient-to-r from-[#7C3AED] to-[#844FC1] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white font-bold rounded-xl text-xs shadow-md shadow-[#7C3AED]/20 transition"
                          >
                            Compare {quoteCount} Supplier Bid{quoteCount === 1 ? '' : 's'} →
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono italic">Waiting for supplier bids</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Pending Deliveries */}
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <IconTruck className="w-5 h-5 text-[#844FC1] dark:text-indigo-400" />
                <h3 className="text-base font-bold text-[#0F172A] dark:text-white font-outfit">Site Deliveries & Truck Inspections</h3>
              </div>
              <button onClick={() => setActiveTab('deliveries')} className="text-xs text-[#844FC1] dark:text-indigo-400 font-bold hover:underline">
                View All Deliveries →
              </button>
            </div>

            <div className="space-y-3">
              {deliveries.length === 0 ? (
                <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-xs italic">
                  No site truck deliveries recorded yet.
                </div>
              ) : (
                deliveries.slice(0, 3).map(del => (
                  <div key={del.id} className="p-4 rounded-2xl bg-[#F3F4F6]/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-purple-800 dark:text-purple-400 text-xs">{del.id}</span>
                        <StatusBadge type="grnStatus" value={del.status} />
                      </div>
                      <h4 className="font-bold text-[#0F172A] dark:text-white text-sm">{del.projectName}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Truck #: <span className="font-mono text-[#7C3AED] dark:text-purple-300 font-bold">{del.vehicleNumber}</span> • Driver: {del.driverName} ({del.driverContact})
                      </p>
                    </div>

                    <div>
                      {del.status === 'Pending Site Sign-Off' ? (
                        <button
                          onClick={() => openGRNModal(del.id)}
                          className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold rounded-xl text-xs shadow-md transition"
                        >
                          Inspect & Sign Off Delivery
                        </button>
                      ) : (
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Inspected by: {del.inspectedBy}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#0F172A] dark:text-white font-outfit">Active Construction Sites</h3>
              <button onClick={() => setActiveTab('projects')} className="text-xs text-[#7C3AED] dark:text-purple-400 font-bold hover:underline">
                Manage All →
              </button>
            </div>

            <div className="space-y-4">
              {projects.length === 0 ? (
                <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-xs italic">
                  No construction sites registered yet.
                </div>
              ) : (
                projects.map(proj => {
                  const percentSpent = proj.budgetAllocated ? Math.min(100, Math.round((proj.materialSpend / proj.budgetAllocated) * 100)) : 0;
                  return (
                    <div key={proj.id} className="p-3.5 rounded-2xl bg-[#F3F4F6]/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-[#0F172A] dark:text-white text-xs font-outfit">{proj.name}</h4>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{proj.id}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 truncate">{proj.location}</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-slate-500 dark:text-slate-400">Spend: ₹{(proj.materialSpend / 100000).toFixed(1)}L</span>
                          <span className="text-[#7C3AED] dark:text-purple-300 font-bold">{percentSpent}% spent</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-[#7C3AED] to-[#844FC1] h-full rounded-full" style={{ width: `${percentSpent}%` }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-[#0F172A] text-white shadow-xl space-y-3 border border-purple-500/20">
            <div className="flex items-center gap-2 text-purple-400">
              <IconCheckCircle className="w-5 h-5" />
              <h4 className="font-bold text-sm text-white font-outfit">Direct Platform Benefits</h4>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
              <li>Direct builder-to-supplier pricing without middleman stores.</li>
              <li>Transparent line-item prices with clear GST & delivery breakdown.</li>
              <li>Site inspection sign-off notes for quality assurance.</li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
};
