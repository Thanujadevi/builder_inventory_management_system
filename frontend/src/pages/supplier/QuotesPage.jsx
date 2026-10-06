import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { IconFileText, IconClock, IconCheckCircle } from '../../components/common/Icons';
import { StatusBadge } from '../../components/common/StatusBadge';

export const QuotesPage = ({ openBiddingForm }) => {
  const { rfqs, quotes } = usePortal();
  const [activeSubTab, setActiveSubTab] = useState('incoming');

  const openRFQs = rfqs.filter(r => r.status === 'Broadcasted' || r.status === 'Quotes Received');

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-[#0F172A] dark:text-white font-outfit">Supplier Price Bids & Requests</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review live requests from construction builders, submit item prices with taxes, and track accepted orders</p>
        </div>

        <div className="flex items-center bg-[#F3F4F6] dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveSubTab('incoming')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-outfit transition ${
              activeSubTab === 'incoming'
                ? 'bg-gradient-to-r from-[#7C3AED] to-[#844FC1] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
            }`}
          >
            Incoming Material Requests ({openRFQs.length})
          </button>
          <button
            onClick={() => setActiveSubTab('sent')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-outfit transition ${
              activeSubTab === 'sent'
                ? 'bg-gradient-to-r from-[#7C3AED] to-[#844FC1] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
            }`}
          >
            My Submitted Bids ({quotes.length})
          </button>
        </div>
      </div>

      {activeSubTab === 'incoming' && (
        <div className="space-y-4">
          {openRFQs.map(rfq => (
            <div
              key={rfq.id}
              className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs light-card-hover flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#7C3AED] dark:text-purple-300 text-xs">{rfq.id}</span>
                  <StatusBadge type="urgency" value={rfq.urgency} />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono ml-auto">Required Date: {rfq.requiredByDate}</span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#0F172A] dark:text-white font-outfit">{rfq.projectName}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Delivery Location: {rfq.siteAddress}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {rfq.items.map((it, idx) => (
                    <div key={idx} className="px-3 py-1.5 bg-[#F3F4F6] dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                      <span className="font-bold text-[#0F172A] dark:text-white block">{it.name}</span>
                      <span className="text-slate-500 dark:text-slate-400 font-mono">{it.quantity} {it.unit} • Target: ₹{it.targetPrice}/unit</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:w-64 bg-[#F3F4F6]/80 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-3 shrink-0">
                <div className="text-xs space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block">Bidding Deadline</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <IconClock className="w-3.5 h-3.5" /> Open For Bids
                  </span>
                </div>

                <button
                  onClick={() => openBiddingForm(rfq.id)}
                  className="w-full py-2.5 bg-gradient-to-r from-[#7C3AED] via-[#844FC1] to-[#6D28D9] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white font-extrabold rounded-xl text-xs shadow-md shadow-[#7C3AED]/20 flex items-center justify-center gap-2 transition"
                >
                  <IconCheckCircle className="w-4 h-4" />
                  Send Your Price Quote
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSubTab === 'sent' && (
        <div className="space-y-4">
          {quotes.map(qte => (
            <div key={qte.id} className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#7C3AED] dark:text-purple-300 text-sm">{qte.id}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">For Request: {qte.rfqId}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    qte.status === 'Accepted'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-purple-100 text-[#7C3AED] border border-purple-300 dark:bg-[#7C3AED]/20 dark:text-purple-300 dark:border-[#7C3AED]/40'
                  }`}>
                    {qte.status === 'Accepted' ? 'Bid Accepted (PO Generated)' : 'Submitted'}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Total Quotation Bid</span>
                  <span className="font-mono font-extrabold text-[#7C3AED] dark:text-purple-300 text-lg">₹{qte.grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {qte.lineItemQuotes.map((li, idx) => (
                  <div key={idx} className="p-3 bg-[#F3F4F6] dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between">
                    <div>
                      <span className="font-bold text-[#0F172A] dark:text-white block">{li.itemName}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Qty: {li.quantity} {li.unit || 'Units'} • GST: {li.gstPercent}%</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-[#7C3AED] dark:text-purple-300 block">₹{li.unitPrice.toLocaleString()}/unit</span>
                      <span className="font-mono text-slate-500 dark:text-slate-400 text-[10px]">Total: ₹{li.totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-[#F3F4F6]/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs flex flex-wrap justify-between items-center text-slate-700 dark:text-slate-300">
                <span>Freight: <strong className="text-[#0F172A] dark:text-white font-mono">₹{qte.freightCharges.toLocaleString()}</strong></span>
                <span>Lead Time: <strong className="text-[#0F172A] dark:text-white font-mono">{qte.estimatedDeliveryDays} Business Days</strong></span>
                <span>Terms: <strong className="text-[#7C3AED] dark:text-purple-300">{qte.paymentTerms}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
