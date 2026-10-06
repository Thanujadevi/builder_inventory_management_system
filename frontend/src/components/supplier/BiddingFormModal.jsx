import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { IconX, IconFileText, IconCheckCircle, IconTruck, IconClock } from '../common/Icons';

export const BiddingFormModal = ({ rfqId, isOpen, onClose }) => {
  const { rfqs, submitQuotation } = usePortal();

  const targetRFQ = rfqs.find(r => r.id === rfqId);

  const [lineQuotes, setLineQuotes] = useState(() => {
    if (targetRFQ && targetRFQ.items) {
      return targetRFQ.items.map(it => ({
        itemId: it.id,
        itemName: it.name,
        quantity: it.quantity,
        unit: it.unit,
        unitPrice: it.targetPrice || 1000,
        gstPercent: 18,
        totalPrice: (it.quantity * (it.targetPrice || 1000) * 1.18)
      }));
    }
    return [];
  });

  const [freightCharges, setFreightCharges] = useState(5000);
  const [estimatedDeliveryDays, setEstimatedDeliveryDays] = useState(3);
  const [paymentTerms, setPaymentTerms] = useState("30-Day Credit (Net 30)");
  const [notes, setNotes] = useState("Mill Test Certificates & free site offloading included.");

  if (!isOpen || !targetRFQ) return null;

  const handlePriceChange = (index, field, val) => {
    setLineQuotes(prev => prev.map((lq, i) => {
      if (i === index) {
        const numVal = Math.max(0, Number(val));
        const updated = { ...lq, [field]: numVal };
        const baseTotal = updated.quantity * updated.unitPrice;
        const taxAmount = baseTotal * (updated.gstPercent / 100);
        updated.totalPrice = baseTotal + taxAmount;
        return updated;
      }
      return lq;
    }));
  };

  const subtotal = lineQuotes.reduce((acc, lq) => acc + (lq.quantity * lq.unitPrice), 0);
  const taxTotal = lineQuotes.reduce((acc, lq) => acc + (lq.quantity * lq.unitPrice * (lq.gstPercent / 100)), 0);
  const grandTotal = subtotal + taxTotal + Number(freightCharges || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    submitQuotation({
      rfqId: targetRFQ.id,
      supplierId: "SUP-001",
      supplierName: "Apex Steel Mills Ltd",
      supplierRating: 4.8,
      lineItemQuotes: lineQuotes,
      subtotal,
      taxTotal,
      freightCharges: Number(freightCharges || 0),
      grandTotal,
      estimatedDeliveryDays: Number(estimatedDeliveryDays),
      paymentTerms,
      notes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-100 text-blue-800 border border-blue-200">
              <IconFileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 font-outfit">Submit B2B Quotation</h2>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-mono text-xs font-bold border border-blue-200">
                  {targetRFQ.id}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Builder: <span className="text-slate-900 font-semibold">{targetRFQ.projectName}</span> • Site: {targetRFQ.siteAddress}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition">
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 block">Required Site Delivery Date</span>
              <span className="font-mono font-bold text-amber-800 text-sm">{targetRFQ.requiredByDate}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Builder Site Urgency</span>
              <span className="font-bold text-red-700 uppercase tracking-wider font-outfit">{targetRFQ.urgency}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Total Line Items</span>
              <span className="font-bold text-emerald-700 font-mono">{targetRFQ.items.length} items</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-700 font-outfit uppercase tracking-wider">
              Fill Line Item Unit Rates & Tax %
            </h3>

            {lineQuotes.map((lq, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{lq.itemName}</h4>
                    <span className="text-xs text-slate-500">Required Quantity: <strong className="text-amber-800 font-mono">{lq.quantity} {lq.unit || 'Units'}</strong></span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">Line Total (Incl. Tax)</span>
                    <span className="font-mono font-bold text-emerald-700 text-sm">₹{lq.totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-700 text-[11px] font-bold mb-1">Supplier Unit Rate (₹) *</label>
                    <input
                      type="number"
                      min="1"
                      value={lq.unitPrice}
                      onChange={(e) => handlePriceChange(idx, 'unitPrice', e.target.value)}
                      className="w-full bg-white border border-slate-300 text-slate-900 font-bold font-mono rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 text-[11px] font-bold mb-1">GST Tax Rate *</label>
                    <select
                      value={lq.gstPercent}
                      onChange={(e) => handlePriceChange(idx, 'gstPercent', e.target.value)}
                      className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl p-2.5 outline-none"
                    >
                      <option value={5}>5% GST (Basic Materials)</option>
                      <option value={12}>12% GST (Standard Hardware)</option>
                      <option value={18}>18% GST (Steel / Electrical / Fittings)</option>
                      <option value={28}>28% GST (Cement / Heavy Goods)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 text-[11px] font-bold mb-1">Tax Amount (₹)</label>
                    <div className="w-full bg-slate-100 border border-slate-200 text-slate-900 font-mono rounded-xl p-2.5 text-xs font-semibold">
                      ₹{((lq.quantity * lq.unitPrice) * (lq.gstPercent / 100)).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-700 font-outfit uppercase tracking-wider">
              Logistics & Payment Terms
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Freight / Delivery Charges (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={freightCharges}
                  onChange={(e) => setFreightCharges(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 font-mono rounded-xl p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Estimated Lead Time (Days)</label>
                <input
                  type="number"
                  min="1"
                  value={estimatedDeliveryDays}
                  onChange={(e) => setEstimatedDeliveryDays(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 font-mono rounded-xl p-2.5 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Payment Terms Offered *</label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl p-2.5 outline-none"
                >
                  <option value="30-Day Credit (Net 30)">30-Day Credit (Net 30)</option>
                  <option value="50% Advance, 50% on Delivery">50% Advance, 50% on Delivery</option>
                  <option value="100% Advance with 2% Cash Discount">100% Advance with 2% Cash Discount</option>
                  <option value="Cash on Delivery (COD)">Cash on Delivery (COD)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1">Supplier Quote Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl p-2.5 text-xs h-20 outline-none"
                placeholder="Include details about brand origin, warranties, offloading support..."
              />
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between">
            <div className="space-y-1 text-xs text-slate-600">
              <span>Subtotal: <strong className="text-slate-900 font-mono">₹{subtotal.toLocaleString()}</strong></span> • 
              <span> Total GST: <strong className="text-slate-900 font-mono">₹{taxTotal.toLocaleString()}</strong></span> • 
              <span> Freight: <strong className="text-slate-900 font-mono">₹{Number(freightCharges || 0).toLocaleString()}</strong></span>
            </div>

            <div className="text-right">
              <span className="text-xs text-blue-900 font-outfit uppercase font-bold tracking-wider block">Grand Total Bid</span>
              <span className="text-2xl font-extrabold text-blue-900 font-mono">₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>

        </form>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button onClick={onClose} className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow"
          >
            <IconCheckCircle className="w-4 h-4" />
            Submit Formal Quotation
          </button>
        </div>

      </div>
    </div>
  );
};
