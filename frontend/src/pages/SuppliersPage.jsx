import React from 'react';
import { usePortal } from '../context/PortalContext';
import { IconUsers, IconStar, IconShieldCheck, IconCheckCircle, IconTruck, IconFileText } from '../components/common/Icons';

export const SuppliersPage = () => {
  const { suppliers } = usePortal();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white font-outfit">Vetted Supplier Directory</h1>
          <p className="text-xs text-slate-400 mt-1">Registered direct manufacturers & authorized dealers with verified performance metrics</p>
        </div>
        <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 text-xs font-mono font-bold border border-amber-500/20">
          4 Vetted Vendors Live
        </span>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suppliers.map(sup => (
          <div
            key={sup.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl glass-panel-hover flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-400 text-xs">{sup.id}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                      <IconShieldCheck className="w-3 h-3" /> {sup.verificationStatus}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white font-outfit mt-1">{sup.name}</h2>
                </div>

                <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-xl border border-amber-500/20 font-bold text-xs">
                  <IconStar className="w-4 h-4" />
                  <span>{sup.rating}</span>
                  <span className="text-slate-500 text-[10px]">({sup.reviewsCount})</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 font-mono mb-3">GSTIN: {sup.gstin}</p>

              {/* Categories Supplied Pills */}
              <div className="space-y-1 mb-4">
                <span className="text-[10px] text-slate-500 uppercase font-outfit font-semibold block">Supply Categories</span>
                <div className="flex flex-wrap gap-1.5">
                  {sup.categoriesSupplied.map((cat, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 text-xs border border-slate-800">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Coverage Area:</span>
                  <span className="font-semibold text-slate-200">{sup.coverageArea}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Orders Fulfilled:</span>
                  <span className="font-mono font-bold text-emerald-400">{sup.totalFulfilledOrders} Orders</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">On-Time Delivery Rate:</span>
                  <span className="font-mono font-bold text-amber-400">{sup.onTimeDeliveryRate}%</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <div>
                <span className="text-slate-500 block text-[10px]">Key Contact</span>
                <span className="font-bold text-white">{sup.contactPerson}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[10px]">Direct Phone</span>
                <span className="font-mono text-amber-400 font-semibold">{sup.phone}</span>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
