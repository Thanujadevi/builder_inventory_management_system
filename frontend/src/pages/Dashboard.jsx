import React from 'react';
import { useRole } from '../context/RoleContext';
import { usePortal } from '../context/PortalContext';
import {
  IconBuilding,
  IconFileText,
  IconShoppingCart,
  IconTruck,
  IconPackage,
  IconPlus,
  IconAlertTriangle,
  IconCheckCircle,
  IconClock,
  IconUsers
} from '../components/common/Icons';
import { StatusBadge } from '../components/common/StatusBadge';

export const DashboardPage = ({ setActiveTab, openCreateRFQ, openCompareQuote, openBiddingForm, openDispatchModal, openGRNModal }) => {
  const { role } = useRole();
  const { projects, rfqs, quotes, purchaseOrders, deliveries, catalog } = usePortal();

  // Metrics
  const totalBudget = projects.reduce((acc, p) => acc + p.budgetAllocated, 0);
  const totalSpend = projects.reduce((acc, p) => acc + p.materialSpend, 0);
  const activeRFQs = rfqs.filter(r => r.status === 'Broadcasted' || r.status === 'Quotes Received');
  const openBidsForSupplier = rfqs.filter(r => r.status === 'Broadcasted');
  const pendingDeliveries = deliveries.filter(d => d.status === 'Pending Site Sign-Off');
  const pendingDispatches = purchaseOrders.filter(p => p.fulfillmentStatus === 'Issued' || p.fulfillmentStatus === 'Processing');

  return (
    <div className="space-y-6">
      
      {/* Role Banner / Hero Card */}
      <div className={`p-6 rounded-2xl border relative overflow-hidden shadow-xl ${
        role === 'BUILDER'
          ? 'bg-gradient-to-r from-slate-900 via-slate-850 to-amber-950/40 border-amber-500/30'
          : 'bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950/40 border-blue-500/30'
      }`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider font-mono ${
                role === 'BUILDER' ? 'bg-amber-500 text-slate-950' : 'bg-blue-600 text-white'
              }`}>
                {role} DASHBOARD WORKSPACE
              </span>
              <span className="text-xs text-slate-400 font-mono">Live Intermediary-Free Operations</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white font-outfit tracking-tight">
              {role === 'BUILDER' ? 'Construction Project Procurement Hub' : 'Supplier B2B Bidding & Order Center'}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {role === 'BUILDER'
                ? 'Manage construction site material requirements, compare supplier line-item quotes side-by-side, issue formal POs, and verify site truck deliveries.'
                : 'Receive real-time builder RFQs, submit competitive line-item bids with taxes and freight, track PO dispatches, and manage catalog item rates.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {role === 'BUILDER' ? (
              <button
                onClick={openCreateRFQ}
                className="px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 scale-[1.02] transition"
              >
                <IconPlus className="w-4 h-4 stroke-[3]" />
                Create New RFQ
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('quotes')}
                className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 scale-[1.02] transition"
              >
                <IconFileText className="w-4 h-4" />
                View Open Builder RFQs ({openBidsForSupplier.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TOP METRICS CARDS GRID */}
      {role === 'BUILDER' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 glass-panel-hover">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-400 font-outfit uppercase">Total Material Budget</span>
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                <IconBuilding className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-white font-mono">₹{(totalBudget / 10000000).toFixed(2)} Cr</p>
            <p className="text-[11px] text-slate-400 mt-1">Across 4 Active Construction Sites</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 glass-panel-hover">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-400 font-outfit uppercase">Material Spend to Date</span>
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <IconShoppingCart className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-400 font-mono">₹{(totalSpend / 10000000).toFixed(2)} Cr</p>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${Math.min(100, (totalSpend / totalBudget) * 100)}%` }}></div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 glass-panel-hover">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-400 font-outfit uppercase">Active RFQs</span>
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                <IconFileText className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-blue-400 font-mono">{activeRFQs.length}</p>
            <p className="text-[11px] text-amber-400 mt-1 cursor-pointer hover:underline" onClick={() => setActiveTab('requests')}>
              View incoming supplier bids →
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 glass-panel-hover">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-400 font-outfit uppercase">Pending Site Deliveries</span>
              <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                <IconTruck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-purple-300 font-mono">{pendingDeliveries.length}</p>
            <p className="text-[11px] text-slate-400 mt-1">Awaiting Site GRN Sign-Off</p>
          </div>

        </div>
      ) : (
        /* SUPPLIER METRICS */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 glass-panel-hover">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-400 font-outfit uppercase">Catalog Items Live</span>
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                <IconPackage className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-white font-mono">{catalog.length} Items</p>
            <p className="text-[11px] text-slate-400 mt-1">Across 7 Construction Categories</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 glass-panel-hover">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-400 font-outfit uppercase">Open Builder RFQs</span>
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                <IconFileText className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-amber-400 font-mono">{openBidsForSupplier.length}</p>
            <p className="text-[11px] text-amber-400 mt-1">Matching Supply Portfolio</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 glass-panel-hover">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-400 font-outfit uppercase">POs Acknowledged</span>
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <IconShoppingCart className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-400 font-mono">{purchaseOrders.length}</p>
            <p className="text-[11px] text-slate-400 mt-1">Total Confirmed Orders</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 glass-panel-hover">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-400 font-outfit uppercase">Pending Dispatches</span>
              <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                <IconTruck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-purple-300 font-mono">{pendingDispatches.length}</p>
            <p className="text-[11px] text-purple-400 mt-1">Ready for Truck Assignment</p>
          </div>

        </div>
      )}

      {/* DASHBOARD MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols wide): Active RFQs & Deliveries */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Material Requests / RFQs Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <IconFileText className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white font-outfit">Active Material Requests (RFQs)</h3>
              </div>
              <button
                onClick={() => setActiveTab('requests')}
                className="text-xs text-amber-400 hover:underline font-semibold"
              >
                View All ({rfqs.length}) →
              </button>
            </div>

            <div className="space-y-3">
              {rfqs.slice(0, 3).map(rfq => {
                const quoteCount = quotes.filter(q => q.rfqId === rfq.id).length;
                return (
                  <div key={rfq.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-amber-400 text-xs">{rfq.id}</span>
                        <StatusBadge type="urgency" value={rfq.urgency} />
                        <StatusBadge type="rfqStatus" value={rfq.status} />
                      </div>
                      <h4 className="font-bold text-white text-sm">{rfq.projectName}</h4>
                      <p className="text-xs text-slate-400">{rfq.items.length} line item(s) • Target Delivery: <span className="font-mono text-slate-200">{rfq.requiredByDate}</span></p>
                    </div>

                    <div className="flex items-center gap-3">
                      {role === 'BUILDER' ? (
                        quoteCount > 0 ? (
                          <button
                            onClick={() => openCompareQuote(rfq.id)}
                            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow"
                          >
                            Compare {quoteCount} Quote{quoteCount === 1 ? '' : 's'} →
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500 font-mono italic">Awaiting Bids</span>
                        )
                      ) : (
                        <button
                          onClick={() => openBiddingForm(rfq.id)}
                          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow"
                        >
                          Submit Bid →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending Deliveries & Dispatch Tracker Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <IconTruck className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white font-outfit">Site Delivery & Truck Tracker</h3>
              </div>
              <button onClick={() => setActiveTab('deliveries')} className="text-xs text-purple-400 hover:underline font-semibold">
                View All Dispatches →
              </button>
            </div>

            <div className="space-y-3">
              {deliveries.slice(0, 3).map(del => (
                <div key={del.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-purple-400 text-xs">{del.id}</span>
                      <StatusBadge type="grnStatus" value={del.status} />
                    </div>
                    <h4 className="font-bold text-white text-sm">{del.projectName}</h4>
                    <p className="text-xs text-slate-400">
                      Vehicle: <span className="font-mono text-amber-400 font-bold">{del.vehicleNumber}</span> • Driver: {del.driverName} ({del.driverContact})
                    </p>
                  </div>

                  <div>
                    {role === 'BUILDER' && del.status === 'Pending Site Sign-Off' ? (
                      <button
                        onClick={() => openGRNModal(del.id)}
                        className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-extrabold rounded-xl text-xs shadow"
                      >
                        Inspect & Sign-Off GRN
                      </button>
                    ) : (
                      <span className="text-xs font-mono text-slate-400">{del.inspectedBy}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (1 Col): Projects Summary & Quick Supplier Directory */}
        <div className="space-y-6">
          
          {/* Projects Budget Progress Cards */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white font-outfit">Construction Sites</h3>
              <button onClick={() => setActiveTab('projects')} className="text-xs text-amber-400 hover:underline font-semibold">
                Manage All →
              </button>
            </div>

            <div className="space-y-4">
              {projects.map(proj => {
                const percentSpent = Math.min(100, Math.round((proj.materialSpend / proj.budgetAllocated) * 100));
                return (
                  <div key={proj.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-white text-xs font-outfit">{proj.name}</h4>
                      <span className="text-[10px] font-mono text-slate-400">{proj.id}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-2 truncate">{proj.location}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-slate-400">Spend: ₹{(proj.materialSpend / 100000).toFixed(1)}L</span>
                        <span className="text-emerald-400 font-bold">{percentSpent}% of Budget</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full" style={{ width: `${percentSpent}%` }}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Direct Procurement Benefits Capsule */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-amber-400">
              <IconCheckCircle className="w-5 h-5" />
              <h4 className="font-bold text-sm text-white font-outfit">Direct Platform Architecture</h4>
            </div>
            <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
              <li>Eliminates dealer & retail warehouse markups.</li>
              <li>Line-item transparent quotes with GST and freight breakdown.</li>
              <li>Digital Goods Received Notes (GRN) for site audit sign-off.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};
