import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { IconX, IconClipboardCheck, IconAlertTriangle, IconCheckCircle, IconShieldCheck, IconTruck } from '../common/Icons';

export const GRNSignOffModal = ({ deliveryId, isOpen, onClose }) => {
  const { deliveries, submitGRNSignOff } = usePortal();

  const targetDelivery = deliveries.find(d => d.id === deliveryId);

  const [inspectedBy, setInspectedBy] = useState("Vikram Malhotra (Senior PM)");
  const [siteEngineerNotes, setSiteEngineerNotes] = useState("");
  const [items, setItems] = useState(() => {
    if (targetDelivery && targetDelivery.items) {
      return targetDelivery.items.map(i => ({ ...i }));
    }
    return [];
  });

  if (!isOpen || !targetDelivery) return null;

  const handleQtyChange = (index, field, val) => {
    setItems(prev => prev.map((it, i) => {
      if (i === index) {
        const numVal = Math.max(0, Number(val));
        const updated = { ...it, [field]: numVal };
        if (field === 'damagedQty' || field === 'shortageQty') {
          const totalLoss = (field === 'damagedQty' ? numVal : it.damagedQty || 0) + (field === 'shortageQty' ? numVal : it.shortageQty || 0);
          updated.acceptedQty = Math.max(0, it.orderedQty - totalLoss);
        }
        return updated;
      }
      return it;
    }));
  };

  const handleRemarksChange = (index, remarks) => {
    setItems(prev => prev.map((it, i) => i === index ? { ...it, remarks } : it));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const hasDiscrepancy = items.some(i => (i.damagedQty > 0 || i.shortageQty > 0));
    submitGRNSignOff(deliveryId, {
      items,
      inspectedBy,
      siteEngineerNotes,
      hasDiscrepancy
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800 border border-amber-200">
              <IconClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-outfit">Site Material Inspection & GRN Sign-Off</h2>
              <p className="text-xs text-slate-500">
                Log goods arrival for PO <span className="text-amber-800 font-mono font-bold">{targetDelivery.poId}</span>
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition">
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Dispatch Info */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">Vehicle Number</span>
              <span className="font-mono font-bold text-amber-800 text-sm flex items-center gap-1">
                <IconTruck className="w-4 h-4 text-amber-600" />
                {targetDelivery.vehicleNumber}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Driver Contact</span>
              <span className="font-semibold text-slate-900">{targetDelivery.driverName} ({targetDelivery.driverContact})</span>
            </div>
            <div>
              <span className="text-slate-500 block">Challan Number</span>
              <span className="font-mono text-slate-900 font-semibold">{targetDelivery.challanNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block">E-Way Bill</span>
              <span className="font-mono text-slate-700">{targetDelivery.ewayBillNumber}</span>
            </div>
          </div>

          {/* Line items verification */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 font-outfit uppercase tracking-wider">
              Item Discrepancy & Verification Matrix
            </h3>

            {items.map((it, idx) => {
              const isDiscrepant = it.damagedQty > 0 || it.shortageQty > 0;
              return (
                <div key={idx} className={`p-4 rounded-2xl border space-y-3 ${isDiscrepant ? 'bg-red-50 border-red-300' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{it.name}</h4>
                      <p className="text-xs text-slate-500">Ordered Quantity: <strong className="text-amber-800 font-mono">{it.orderedQty} {it.unit}</strong></p>
                    </div>

                    {isDiscrepant ? (
                      <span className="px-2.5 py-1 bg-red-100 text-red-800 border border-red-300 text-xs font-bold rounded-lg flex items-center gap-1">
                        <IconAlertTriangle className="w-3.5 h-3.5 text-red-600" /> Discrepancy Flagged
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold rounded-lg flex items-center gap-1">
                        <IconCheckCircle className="w-3.5 h-3.5 text-emerald-700" /> Verified Intact
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-600 text-[11px] font-bold mb-1">Accepted Qty ({it.unit})</label>
                      <input
                        type="number"
                        min="0"
                        max={it.orderedQty}
                        value={it.acceptedQty}
                        onChange={(e) => handleQtyChange(idx, 'acceptedQty', e.target.value)}
                        className="w-full bg-white border border-slate-300 text-emerald-800 font-bold font-mono rounded-xl p-2 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 text-[11px] font-bold mb-1">Damaged Qty ({it.unit})</label>
                      <input
                        type="number"
                        min="0"
                        value={it.damagedQty || 0}
                        onChange={(e) => handleQtyChange(idx, 'damagedQty', e.target.value)}
                        className="w-full bg-white border border-slate-300 text-red-700 font-bold font-mono rounded-xl p-2 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 text-[11px] font-bold mb-1">Shortage Qty ({it.unit})</label>
                      <input
                        type="number"
                        min="0"
                        value={it.shortageQty || 0}
                        onChange={(e) => handleQtyChange(idx, 'shortageQty', e.target.value)}
                        className="w-full bg-white border border-slate-300 text-amber-800 font-bold font-mono rounded-xl p-2 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Inspection remarks / batch test note..."
                      value={it.remarks || ''}
                      onChange={(e) => handleRemarksChange(idx, e.target.value)}
                      className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-xl p-2.5 outline-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sign off field */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-700 font-outfit uppercase tracking-wider flex items-center gap-2">
              <IconShieldCheck className="w-4 h-4 text-amber-700" />
              Digital GRN Sign-Off Stamp
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Inspector / Site Engineer Name *</label>
                <input
                  type="text"
                  value={inspectedBy}
                  onChange={(e) => setInspectedBy(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl p-2.5 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Overall Site Engineer Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Weighbridge slip matched, unload approved..."
                  value={siteEngineerNotes}
                  onChange={(e) => setSiteEngineerNotes(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl p-2.5 outline-none"
                />
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-mono">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                Digital Verification Stamp: <strong className="text-emerald-700 font-bold">BUILDHUB-GRN-{Date.now()}</strong>
              </div>
              <span className="text-slate-500 font-mono">{new Date().toLocaleDateString()}</span>
            </div>
          </div>

        </form>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button onClick={onClose} className="px-5 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-xl text-xs font-semibold">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow"
          >
            <IconCheckCircle className="w-4 h-4" />
            Issue Official Goods Received Note (GRN)
          </button>
        </div>

      </div>
    </div>
  );
};
