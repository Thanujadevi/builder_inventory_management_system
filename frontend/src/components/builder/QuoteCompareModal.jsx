import React from 'react';
import { usePortal } from '../../context/PortalContext';
import { IconX, IconCheckCircle, IconStar, IconClock, IconTruck, IconFileText } from '../common/Icons';

export const QuoteCompareModal = ({ rfqId, isOpen, onClose }) => {
  const { rfqs, quotes, acceptQuoteAndGeneratePO } = usePortal();

  if (!isOpen || !rfqId) return null;

  const targetRFQ = rfqs.find(r => r.id === rfqId);
  const rfqQuotes = quotes.filter(q => q.rfqId === rfqId);

  if (!targetRFQ) return null;

  let lowestQuoteId = null;
  let fastestQuoteId = null;

  if (rfqQuotes.length > 0) {
    lowestQuoteId = [...rfqQuotes].sort((a, b) => a.grandTotal - b.grandTotal)[0]?.id;
    fastestQuoteId = [...rfqQuotes].sort((a, b) => a.estimatedDeliveryDays - b.estimatedDeliveryDays)[0]?.id;
  }

  const handleAccept = (quoteId) => {
    if (window.confirm("Are you sure you want to accept this quotation and generate an official Purchase Order (PO)?")) {
      acceptQuoteAndGeneratePO(quoteId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800 border border-amber-200">
              <IconFileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 font-outfit">Side-by-Side Quote Comparison</h2>
                <span className="px-2 py-0.5 rounded bg-slate-200 text-amber-900 font-mono text-xs font-bold border border-slate-300">
                  {targetRFQ.id}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Comparing {rfqQuotes.length} supplier response{rfqQuotes.length === 1 ? '' : 's'} for <span className="text-slate-900 font-semibold">{targetRFQ.projectName}</span>
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition">
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Requested Items Summary */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <h3 className="text-xs font-bold text-slate-700 font-outfit uppercase tracking-wider mb-2">Requested Material Line Items</h3>
            <div className="flex flex-wrap gap-3">
              {targetRFQ.items.map((it, i) => (
                <div key={i} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs shadow-xs">
                  <span className="font-bold text-slate-900 block">{it.name}</span>
                  <span className="text-slate-500">{it.quantity} {it.unit} • Target: ₹{it.targetPrice}/unit</span>
                </div>
              ))}
            </div>
          </div>

          {rfqQuotes.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
              <IconFileText className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-50" />
              <h4 className="text-base font-bold text-slate-800 font-outfit">No Supplier Bids Submitted Yet</h4>
              <p className="text-xs text-slate-500 mt-1">Suppliers are actively reviewing this RFQ. Notifications will pop up as quotes arrive.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {rfqQuotes.map(quote => {
                const isLowest = quote.id === lowestQuoteId;
                const isFastest = quote.id === fastestQuoteId;

                return (
                  <div
                    key={quote.id}
                    className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                      quote.status === 'Accepted'
                        ? 'bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-md'
                        : isLowest
                        ? 'bg-amber-50/50 border-amber-300 shadow-md ring-2 ring-amber-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    {/* Header */}
                    <div className="p-4 border-b border-slate-200 bg-slate-50">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-bold text-slate-900 text-base font-outfit">{quote.supplierName}</h4>
                          <div className="flex items-center gap-1 text-xs text-amber-700 mt-0.5">
                            <IconStar className="w-3.5 h-3.5 fill-current text-amber-500" />
                            <span className="font-bold">{quote.supplierRating}</span>
                            <span className="text-slate-500 text-[10px]">(Verified Vendor)</span>
                          </div>
                        </div>

                        {quote.status === 'Accepted' && (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 text-xs font-bold rounded-full border border-emerald-300">
                            PO Active
                          </span>
                        )}
                      </div>

                      {/* Highlight Pills */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {isLowest && (
                          <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider shadow-xs">
                            ★ Lowest Price
                          </span>
                        )}
                        {isFastest && (
                          <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-xs">
                            ⚡ Fastest Delivery ({quote.estimatedDeliveryDays} Days)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-4 flex-1 space-y-4">
                      <div>
                        <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">
                          Line Item Rates
                        </h5>
                        <div className="space-y-2">
                          {quote.lineItemQuotes.map((li, idx) => (
                            <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                              <div>
                                <span className="font-bold text-slate-900 block">{li.itemName}</span>
                                <span className="text-[10px] text-slate-500">Qty: {li.quantity} {li.unit || 'Units'} • GST: {li.gstPercent}%</span>
                              </div>
                              <div className="text-right">
                                <span className="font-mono font-bold text-amber-800 text-xs block">₹{li.unitPrice.toLocaleString()}/unit</span>
                                <span className="text-[10px] text-slate-500 font-mono">₹{li.totalPrice.toLocaleString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Summary Pricing */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                        <div className="flex justify-between text-slate-600">
                          <span>Subtotal</span>
                          <span className="font-mono text-slate-900">₹{quote.subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Taxes (GST)</span>
                          <span className="font-mono text-slate-900">₹{quote.taxTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Freight</span>
                          <span className="font-mono text-slate-900">₹{quote.freightCharges.toLocaleString()}</span>
                        </div>
                        <div className="border-t border-slate-200 pt-1.5 flex justify-between items-center text-sm font-extrabold text-slate-900 font-outfit">
                          <span>Grand Total</span>
                          <span className="font-mono text-amber-700 text-base">₹{quote.grandTotal.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-700">
                        <div className="flex items-center gap-2">
                          <IconClock className="w-4 h-4 text-slate-500 shrink-0" />
                          <span>Delivery Lead Time: <strong className="text-slate-900 font-mono">{quote.estimatedDeliveryDays} Business Days</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <IconTruck className="w-4 h-4 text-slate-500 shrink-0" />
                          <span>Payment Terms: <strong className="text-amber-800">{quote.paymentTerms}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="p-4 border-t border-slate-200 bg-slate-50">
                      {quote.status === 'Accepted' ? (
                        <div className="w-full py-2.5 bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl text-center border border-emerald-300 flex items-center justify-center gap-1.5">
                          <IconCheckCircle className="w-4 h-4 text-emerald-700" />
                          Purchase Order Active
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAccept(quote.id)}
                          className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 font-extrabold rounded-xl text-xs transition shadow-md shadow-amber-500/10 flex items-center justify-center gap-2"
                        >
                          <IconCheckCircle className="w-4 h-4" />
                          Accept Quote & Issue PO
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Issuing a PO automatically reserves supplier inventory and notifies their fulfillment center.
          </span>
          <button onClick={onClose} className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl text-xs">
            Close Comparison
          </button>
        </div>

      </div>
    </div>
  );
};
