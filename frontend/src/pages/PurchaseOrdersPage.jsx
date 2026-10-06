import React, { useState } from 'react';
import { useRole } from '../context/RoleContext';
import { usePortal } from '../context/PortalContext';
import { IconShoppingCart, IconPrinter, IconTruck, IconCheckCircle, IconSearch } from '../components/common/Icons';
import { StatusBadge } from '../components/common/StatusBadge';

export const PurchaseOrdersPage = ({ openPOPrintModal, openDispatchModal }) => {
  const { role } = useRole();
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
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white font-outfit">Official Purchase Orders (POs)</h1>
          <p className="text-xs text-slate-400 mt-1">Formal commercial contracts, printable PDF views, and fulfillment tracking</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <IconSearch className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by PO #, project, supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['All', 'Issued', 'Dispatched', 'Delivered'].map(st => (
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

      {/* PO Cards Grid */}
      <div className="space-y-4">
        {filteredPOs.length === 0 ? (
          <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800 text-slate-500">
            <IconShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <h3 className="text-base font-bold text-slate-300 font-outfit">No Purchase Orders Found</h3>
            <p className="text-xs text-slate-500 mt-1">Accepting winning supplier quotations will generate POs here.</p>
          </div>
        ) : (
          filteredPOs.map(po => (
            <div
              key={po.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl glass-panel-hover flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-amber-400 text-sm">{po.id}</span>
                  <StatusBadge type="poStatus" value={po.fulfillmentStatus} />
                  <span className="text-[11px] text-slate-500 font-mono ml-auto">Date: {po.poDate}</span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white font-outfit">{po.projectName}</h3>
                  <p className="text-xs text-slate-400">Supplier: <strong className="text-slate-200">{po.supplierName}</strong> (GSTIN: {po.supplierGSTIN})</p>
                </div>

                {/* Items preview */}
                <div className="flex flex-wrap gap-2">
                  {po.items.map((it, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
                      <strong className="text-white">{it.name}</strong> ({it.quantity} {it.unit}) • ₹{it.totalAmount.toLocaleString()}
                    </span>
                  ))}
                </div>

                {po.dispatchDetails && (
                  <div className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-xl text-xs flex flex-wrap gap-4 text-purple-300">
                    <span>Vehicle: <strong className="font-mono text-amber-400">{po.dispatchDetails.vehicleNumber}</strong></span>
                    <span>Driver: <strong className="text-white">{po.dispatchDetails.driverName} ({po.dispatchDetails.driverContact})</strong></span>
                    <span>Challan #: <strong className="font-mono text-slate-200">{po.dispatchDetails.challanNumber}</strong></span>
                  </div>
                )}
              </div>

              {/* Total & Action Buttons */}
              <div className="lg:w-72 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-3 shrink-0">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-outfit font-semibold block">Total PO Value</span>
                  <span className="font-mono font-extrabold text-amber-400 text-xl">₹{po.grandTotal.toLocaleString()}</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">{po.paymentTerms}</p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => openPOPrintModal(po.id)}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-xl text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition"
                  >
                    <IconPrinter className="w-4 h-4" />
                    Print / PDF Document
                  </button>

                  {role === 'SUPPLIER' && po.fulfillmentStatus !== 'Delivered' && (
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
          ))
        )}
      </div>

    </div>
  );
};
