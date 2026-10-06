import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { IconShoppingCart, IconPrinter, IconSearch } from '../../components/common/Icons';
import { StatusBadge } from '../../components/common/StatusBadge';

export const BuilderPOsPage = ({ openPOPrintModal }) => {
  const { purchaseOrders } = usePortal();
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPOs = purchaseOrders.filter(po => {
    const matchesStatus = filterStatus === 'All' || po.fulfillmentStatus === filterStatus;
    const matchesSearch =
      po.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-outfit">Official Purchase Orders (POs)</h1>
          <p className="text-xs text-slate-500 mt-1">Formal commercial contracts, printable PDF views, and fulfillment tracking</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <IconSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by PO #, project, supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['All', 'Issued', 'Dispatched', 'Delivered'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                filterStatus === st
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredPOs.map(po => (
          <div
            key={po.id}
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs light-card-hover flex flex-col lg:flex-row lg:items-center justify-between gap-6"
          >
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-bold text-amber-800 text-sm">{po.id}</span>
                <StatusBadge type="poStatus" value={po.fulfillmentStatus} />
                <span className="text-[11px] text-slate-500 font-mono ml-auto">Date: {po.poDate}</span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 font-outfit">{po.projectName}</h3>
                <p className="text-xs text-slate-500">Supplier: <strong className="text-slate-900">{po.supplierName}</strong> (GSTIN: {po.supplierGSTIN})</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {po.items.map((it, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                    <strong className="text-slate-900">{it.name}</strong> ({it.quantity} {it.unit}) • ₹{it.totalAmount.toLocaleString()}
                  </span>
                ))}
              </div>

              {po.dispatchDetails && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl text-xs flex flex-wrap gap-4 text-purple-900">
                  <span>Vehicle: <strong className="font-mono text-amber-800">{po.dispatchDetails.vehicleNumber}</strong></span>
                  <span>Driver: <strong className="text-slate-900">{po.dispatchDetails.driverName} ({po.dispatchDetails.driverContact})</strong></span>
                  <span>Challan #: <strong className="font-mono text-slate-800">{po.dispatchDetails.challanNumber}</strong></span>
                </div>
              )}
            </div>

            <div className="lg:w-72 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between gap-3 shrink-0">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-outfit font-bold block">Total PO Value</span>
                <span className="font-mono font-black text-amber-800 text-xl">₹{po.grandTotal.toLocaleString()}</span>
                <p className="text-[11px] text-slate-600 mt-0.5 font-medium">{po.paymentTerms}</p>
              </div>

              <button
                onClick={() => openPOPrintModal(po.id)}
                className="w-full py-2 bg-white hover:bg-slate-100 text-amber-900 font-bold rounded-xl text-xs border border-slate-300 flex items-center justify-center gap-1.5 shadow-xs transition"
              >
                <IconPrinter className="w-4 h-4 text-amber-700" />
                Print / PDF Document
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
