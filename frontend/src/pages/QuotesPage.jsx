import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext';
import { IconFileText, IconClock, IconTruck, IconCheckCircle, IconSearch } from '../components/common/Icons';
import { StatusBadge } from '../components/common/StatusBadge';

export const QuotesPage = ({ openBiddingForm }) => {
  const { rfqs, quotes } = usePortal();
  const [activeSubTab, setActiveSubTab] = useState('incoming'); // 'incoming' | 'sent'

  const openRFQs = rfqs.filter(r => r.status === 'Broadcasted' || r.status === 'Quotes Received');

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white font-outfit">Supplier Bidding Workbench & Quotes</h1>
          <p className="text-xs text-slate-400 mt-1">Review live builder RFQs, submit competitive unit prices with GST, and track accepted PO bids</p>
        </div>

        {/* Sub-tab switcher */}
        <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('incoming')}
            className={`px-4 py-2 rounded-lg text-xs font-bold font-outfit transition ${
              activeSubTab === 'incoming'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Incoming Builder RFQs ({openRFQs.length})
          </button>
          <button
            onClick={() => setActiveSubTab('sent')}
            className={`px-4 py-2 rounded-lg text-xs font-bold font-outfit transition ${
              activeSubTab === 'sent'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sent Quotations Log ({quotes.length})
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: INCOMING RFQS FEED */}
      {activeSubTab === 'incoming' && (
        <div className="space-y-4">
          {openRFQs.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800 text-slate-500">
              <IconFileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <h3 className="text-base font-bold text-slate-300 font-outfit">No Open Builder RFQs Right Now</h3>
              <p className="text-xs text-slate-500 mt-1">New material requests from construction sites will appear here automatically.</p>
            </div>
          ) : (
            openRFQs.map(rfq => (
              <div
                key={rfq.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl glass-panel-hover flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-400 text-xs">{rfq.id}</span>
                    <StatusBadge type="urgency" value={rfq.urgency} />
                    <span className="text-[11px] text-slate-500 font-mono ml-auto">Required: {rfq.requiredByDate}</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white font-outfit">{rfq.projectName}</h3>
                    <p className="text-xs text-slate-400">{rfq.siteAddress}</p>
                  </div>

                  {/* Required items */}
                  <div className="flex flex-wrap gap-2">
                    {rfq.items.map((it, idx) => (
                      <div key={idx} className="px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                        <span className="font-bold text-white block">{it.name}</span>
                        <span className="text-slate-400 font-mono">{it.quantity} {it.unit} • Target: ₹{it.targetPrice}/unit</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:w-64 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-3 shrink-0">
                  <div className="text-xs space-y-1">
                    <span className="text-slate-400 block">RFQ Deadline Status</span>
                    <span className="font-mono font-bold text-emerald-400 flex items-center gap-1">
                      <IconClock className="w-3.5 h-3.5" /> Bidding Open
                    </span>
                  </div>

                  <button
                    onClick={() => openBiddingForm(rfq.id)}
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 text-white font-extrabold rounded-xl text-xs shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                  >
                    <IconCheckCircle className="w-4 h-4" />
                    Submit Line-Item Quote
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SUB-TAB 2: SENT QUOTATIONS LOG */}
      {activeSubTab === 'sent' && (
        <div className="space-y-4">
          {quotes.map(qte => (
            <div key={qte.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-400 text-sm">{qte.id}</span>
                  <span className="text-xs text-slate-400 font-mono">For RFQ: {qte.rfqId}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    qte.status === 'Accepted'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    Status: {qte.status}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Grand Total Quotation</span>
                  <span className="font-mono font-extrabold text-amber-400 text-lg">₹{qte.grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Line Items Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {qte.lineItemQuotes.map((li, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex justify-between">
                    <div>
                      <span className="font-bold text-white block">{li.itemName}</span>
                      <span className="text-[11px] text-slate-400">Qty: {li.quantity} {li.unit || 'Units'} • GST: {li.gstPercent}%</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-amber-400 block">₹{li.unitPrice.toLocaleString()}/unit</span>
                      <span className="font-mono text-slate-400 text-[10px]">Total: ₹{li.totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex flex-wrap justify-between items-center text-slate-300">
                <span>Freight: <strong className="text-white font-mono">₹{qte.freightCharges.toLocaleString()}</strong></span>
                <span>Lead Time: <strong className="text-white font-mono">{qte.estimatedDeliveryDays} Business Days</strong></span>
                <span>Terms: <strong className="text-amber-400">{qte.paymentTerms}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
