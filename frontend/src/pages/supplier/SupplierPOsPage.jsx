import React from 'react';
import { usePortal } from '../../context/PortalContext';
import { IconShoppingCart, IconPrinter, IconTruck } from '../../components/common/Icons';
import { StatusBadge } from '../../components/common/StatusBadge';

export const SupplierPOsPage = ({ openPOPrintModal, openDispatchModal }) => {
  const { purchaseOrders } = usePortal();

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-outfit">Incoming Purchase Orders (POs)</h1>
          <p className="text-xs text-slate-500 mt-1">Confirmed orders from construction builders requiring dispatch logistics</p>
        </div>
      </div>

      <div className="space-y-4">
        {purchaseOrders.map(po => (
          <div
            key={po.id}
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs light-card-hover flex flex-col lg:flex-row lg:items-center justify-between gap-6"
          >
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-bold text-blue-800 text-sm">{po.id}</span>
                <StatusBadge type="poStatus" value={po.fulfillmentStatus} />
                <span className="text-[11px] text-slate-500 font-mono ml-auto">Date: {po.poDate}</span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 font-outfit">{po.projectName}</h3>
                <p className="text-xs text-slate-500">Site Address: <span className="text-slate-900 font-semibold">{po.deliverySiteAddress}</span></p>
              </div>

              <div className="flex flex-wrap gap-2">
                {po.items.map((it, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                    <strong className="text-slate-900">{it.name}</strong> ({it.quantity} {it.unit}) • ₹{it.totalAmount.toLocaleString()}
                  </span>
                ))}
              </div>
            </div>

            <div className="lg:w-72 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between gap-3 shrink-0">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-outfit font-bold block">Order Amount</span>
                <span className="font-mono font-black text-blue-900 text-xl">₹{po.grandTotal.toLocaleString()}</span>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => openPOPrintModal(po.id)}
                  className="w-full py-2 bg-white hover:bg-slate-100 text-blue-900 font-bold rounded-xl text-xs border border-slate-300 flex items-center justify-center gap-1.5 shadow-xs transition"
                >
                  <IconPrinter className="w-4 h-4 text-blue-700" />
                  View Formal PO Document
                </button>

                {po.fulfillmentStatus !== 'Delivered' && (
                  <button
                    onClick={() => openDispatchModal(po.id)}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
                  >
                    <IconTruck className="w-4 h-4" />
                    Log Truck Dispatch
                  </button>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
