import React from 'react';
import { usePortal } from '../../context/PortalContext';
import { IconClipboardCheck, IconTruck, IconShieldCheck, IconCheckCircle } from '../../components/common/Icons';
import { StatusBadge } from '../../components/common/StatusBadge';

export const SiteDeliveriesPage = ({ openGRNModal }) => {
  const { deliveries } = usePortal();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-outfit">Site Deliveries & Goods Received Notes (GRN)</h1>
          <p className="text-xs text-slate-500 mt-1">Truck dispatch verification, damaged/shortage qty logging, and site engineer sign-off</p>
        </div>
      </div>

      <div className="space-y-4">
        {deliveries.map(del => (
          <div
            key={del.id}
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-purple-800 text-sm">{del.id}</span>
                <span className="text-xs text-slate-500 font-mono">PO #: {del.poId}</span>
                <StatusBadge type="grnStatus" value={del.status} />
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 block font-outfit">Consignee Site</span>
                <span className="font-bold text-slate-900 text-sm">{del.projectName}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Dispatch Vehicle</span>
                <span className="font-mono font-bold text-amber-800 text-sm flex items-center gap-1">
                  <IconTruck className="w-4 h-4 text-amber-600" />
                  {del.vehicleNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Driver Contact</span>
                <span className="font-semibold text-slate-900">{del.driverName} ({del.driverContact})</span>
              </div>
              <div>
                <span className="text-slate-500 block">Challan #</span>
                <span className="font-mono text-slate-900 font-semibold">{del.challanNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block">E-Way Bill #</span>
                <span className="font-mono text-slate-700">{del.ewayBillNumber}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider font-mono">Delivered Material Line Tally</h4>
              {del.items.map((it, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{it.name}</span>
                    <span className="text-slate-500 text-[11px]">Ordered Qty: {it.orderedQty} {it.unit} • Remarks: {it.remarks}</span>
                  </div>

                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-emerald-700 font-bold">Accepted: {it.acceptedQty} {it.unit}</span>
                    {(it.damagedQty > 0 || it.shortageQty > 0) && (
                      <span className="text-red-700 font-bold">Short/Damaged: {(it.damagedQty || 0) + (it.shortageQty || 0)} {it.unit}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-600 font-mono">
                <IconShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Inspected By: <strong className="text-slate-900">{del.inspectedBy}</strong> {del.grnSignedAt && `at ${del.grnSignedAt}`}</span>
              </div>

              {del.status === 'Pending Site Sign-Off' && (
                <button
                  onClick={() => openGRNModal(del.id)}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-extrabold rounded-xl text-xs shadow flex items-center justify-center gap-2"
                >
                  <IconCheckCircle className="w-4 h-4" />
                  Inspect & Sign-Off GRN
                </button>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
