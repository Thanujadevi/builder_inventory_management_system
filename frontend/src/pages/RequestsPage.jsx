import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext';
import { IconFileText, IconPlus, IconSearch, IconFilter, IconCheckCircle, IconClock, IconAlertTriangle } from '../components/common/Icons';
import { StatusBadge } from '../components/common/StatusBadge';

export const RequestsPage = ({ openCreateRFQ, openCompareQuote }) => {
  const { rfqs, quotes } = usePortal();
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRFQs = rfqs.filter(r => {
    const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
    const matchesSearch =
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.items.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white font-outfit">Material Requests & RFQ Hub</h1>
          <p className="text-xs text-slate-400 mt-1">Broadcast line-item requirements, collect supplier quotes, and compare bids side-by-side</p>
        </div>
        <button
          onClick={openCreateRFQ}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-2 shadow hover:from-amber-400 transition"
        >
          <IconPlus className="w-4 h-4 stroke-[3]" />
          Create Material Request (RFQ)
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <IconSearch className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by RFQ #, project, material..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['All', 'Broadcasted', 'Quotes Received', 'PO Issued'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                filterStatus === st
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

      </div>

      {/* RFQ Cards List */}
      <div className="space-y-4">
        {filteredRFQs.length === 0 ? (
          <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800 text-slate-500">
            <IconFileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <h3 className="text-base font-bold text-slate-300 font-outfit">No Material Requests Found</h3>
            <p className="text-xs text-slate-500 mt-1">Try changing search filters or create a new RFQ.</p>
          </div>
        ) : (
          filteredRFQs.map(rfq => {
            const rfqQuotes = quotes.filter(q => q.rfqId === rfq.id);
            const lowestQuote = rfqQuotes.length > 0 ? [...rfqQuotes].sort((a, b) => a.grandTotal - b.grandTotal)[0] : null;

            return (
              <div
                key={rfq.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl glass-panel-hover flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Left Section */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-amber-400 text-sm">{rfq.id}</span>
                    <StatusBadge type="urgency" value={rfq.urgency} />
                    <StatusBadge type="rfqStatus" value={rfq.status} />
                    <span className="text-[11px] text-slate-500 font-mono ml-auto">Created: {rfq.createdDate}</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white font-outfit">{rfq.projectName}</h3>
                    <p className="text-xs text-slate-400">{rfq.siteAddress}</p>
                  </div>

                  {/* Line items pills */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {rfq.items.map((it, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
                        <strong className="text-white">{it.name}</strong> ({it.quantity} {it.unit}) • <span className="text-amber-400 font-mono">Target ₹{it.targetPrice}</span>
                      </span>
                    ))}
                  </div>

                  {rfq.notes && (
                    <p className="text-xs text-slate-400 italic bg-slate-950/60 p-2 rounded-lg border border-slate-850">
                      "{rfq.notes}"
                    </p>
                  )}
                </div>

                {/* Right Section: Quotes summary & CTA */}
                <div className="lg:w-72 bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between gap-3 shrink-0">
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-slate-400 font-outfit uppercase font-semibold">Supplier Quotes</span>
                      <span className="font-mono font-bold text-amber-400">{rfqQuotes.length} Submitted</span>
                    </div>

                    {lowestQuote ? (
                      <div className="mt-2 text-xs">
                        <span className="text-[10px] text-slate-500 block">Lowest Bidder:</span>
                        <span className="font-bold text-white block truncate">{lowestQuote.supplierName}</span>
                        <span className="font-mono font-bold text-emerald-400 text-sm block">₹{(lowestQuote.grandTotal / 100000).toFixed(2)} Lakhs</span>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 mt-2 italic">Awaiting supplier responses...</p>
                    )}
                  </div>

                  {rfqQuotes.length > 0 ? (
                    <button
                      onClick={() => openCompareQuote(rfq.id)}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-md flex items-center justify-center gap-1.5"
                    >
                      <IconCheckCircle className="w-4 h-4" />
                      Compare Bids & Issue PO
                    </button>
                  ) : (
                    <div className="w-full py-2 bg-slate-900 text-slate-500 text-xs text-center rounded-xl font-mono border border-slate-800">
                      Broadcast Live to Vendors
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
