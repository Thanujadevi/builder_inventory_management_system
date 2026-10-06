import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { IconFileText, IconPlus, IconSearch, IconCheckCircle } from '../../components/common/Icons';
import { StatusBadge } from '../../components/common/StatusBadge';

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
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-[#0F172A] dark:text-white font-outfit">Material Price Requests (RFQs)</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ask verified suppliers for material prices, compare responses side-by-side, and issue purchase orders</p>
        </div>
        <button
          onClick={openCreateRFQ}
          className="px-5 py-3 bg-gradient-to-r from-[#7C3AED] via-[#844FC1] to-[#6D28D9] text-white font-extrabold rounded-2xl text-xs flex items-center gap-2 shadow-md shadow-[#7C3AED]/30 hover:scale-[1.02] transition"
        >
          <IconPlus className="w-4 h-4 stroke-[3]" />
          Request Material Prices (RFQ)
        </button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#0F172A] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <IconSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by request #, site, material..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F3F4F6] dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[#0F172A] dark:text-white rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-[#7C3AED] font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['All', 'Broadcasted', 'Quotes Received', 'PO Issued'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                filterStatus === st
                  ? 'bg-gradient-to-r from-[#7C3AED] to-[#844FC1] text-white shadow-xs font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
              }`}
            >
              {st === 'Broadcasted' ? 'Sent to Suppliers' : st === 'Quotes Received' ? 'Bids Received' : st === 'PO Issued' ? 'Orders Placed' : 'All Requests'}
            </button>
          ))}
        </div>
      </div>

      {/* RFQ Cards */}
      <div className="space-y-4">
        {filteredRFQs.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
            <IconFileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-outfit">No Material Requests Found</h3>
            <p className="text-xs text-slate-500 mt-1">Try changing search filters or create a new material request.</p>
          </div>
        ) : (
          filteredRFQs.map(rfq => {
            const rfqQuotes = quotes.filter(q => q.rfqId === rfq.id);
            const lowestQuote = rfqQuotes.length > 0 ? [...rfqQuotes].sort((a, b) => a.grandTotal - b.grandTotal)[0] : null;

            return (
              <div
                key={rfq.id}
                className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs light-card-hover flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-[#7C3AED] dark:text-purple-300 text-sm">{rfq.id}</span>
                    <StatusBadge type="urgency" value={rfq.urgency} />
                    <StatusBadge type="rfqStatus" value={rfq.status} />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono ml-auto">Created Date: {rfq.createdDate}</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#0F172A] dark:text-white font-outfit">{rfq.projectName}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Delivery Address: {rfq.siteAddress}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {rfq.items.map((it, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-xl bg-[#F3F4F6] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-medium">
                        <strong className="text-[#0F172A] dark:text-white">{it.name}</strong> ({it.quantity} {it.unit}) • <span className="text-[#7C3AED] dark:text-purple-300 font-mono font-bold">Target ₹{it.targetPrice}/unit</span>
                      </span>
                    ))}
                  </div>

                  {rfq.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic bg-[#F3F4F6]/80 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      "{rfq.notes}"
                    </p>
                  )}
                </div>

                <div className="lg:w-72 bg-[#F3F4F6]/80 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-3 shrink-0">
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-slate-500 dark:text-slate-400 font-outfit uppercase font-bold">Supplier Price Bids</span>
                      <span className="font-mono font-bold text-[#7C3AED] dark:text-purple-300">{rfqQuotes.length} Received</span>
                    </div>

                    {lowestQuote ? (
                      <div className="mt-2 text-xs">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Lowest Bidder:</span>
                        <span className="font-bold text-[#0F172A] dark:text-white block truncate">{lowestQuote.supplierName}</span>
                        <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm block">₹{(lowestQuote.grandTotal / 100000).toFixed(2)} Lakhs</span>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">Awaiting supplier responses...</p>
                    )}
                  </div>

                  {rfqQuotes.length > 0 ? (
                    <button
                      onClick={() => openCompareQuote(rfq.id)}
                      className="w-full py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#844FC1] hover:from-[#6D28D9] text-white font-extrabold rounded-xl text-xs shadow-md shadow-[#7C3AED]/20 flex items-center justify-center gap-1.5 transition"
                    >
                      <IconCheckCircle className="w-4 h-4" />
                      Compare Bids & Place Order
                    </button>
                  ) : (
                    <div className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs text-center rounded-xl font-mono border border-slate-200 dark:border-slate-700">
                      Sent to Suppliers
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
