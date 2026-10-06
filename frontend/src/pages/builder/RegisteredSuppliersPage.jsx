import React from 'react';
import { usePortal } from '../../context/PortalContext';
import { IconStar, IconShieldCheck } from '../../components/common/Icons';

export const RegisteredSuppliersPage = () => {
  const { suppliers } = usePortal();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-outfit">Vetted Supplier Directory</h1>
          <p className="text-xs text-slate-500 mt-1">Registered direct manufacturers & authorized dealers with verified performance metrics</p>
        </div>
        <span className="px-3.5 py-1.5 rounded-2xl bg-amber-100 text-amber-900 text-xs font-mono font-bold border border-amber-300">
          4 Vetted Vendors Live
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suppliers.map(sup => (
          <div
            key={sup.id}
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs light-card-hover flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-800 text-xs">{sup.id}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-bold border border-emerald-300 flex items-center gap-1">
                      <IconShieldCheck className="w-3 h-3 text-emerald-700" /> {sup.verificationStatus}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 font-outfit mt-1">{sup.name}</h2>
                </div>

                <div className="flex items-center gap-1 bg-amber-50 text-amber-900 px-2.5 py-1 rounded-xl border border-amber-200 font-bold text-xs">
                  <IconStar className="w-4 h-4 fill-current text-amber-500" />
                  <span>{sup.rating}</span>
                  <span className="text-slate-500 text-[10px]">({sup.reviewsCount})</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 font-mono mb-3">GSTIN: {sup.gstin}</p>

              <div className="space-y-1 mb-4">
                <span className="text-[10px] text-slate-500 uppercase font-outfit font-bold block">Supply Categories</span>
                <div className="flex flex-wrap gap-1.5">
                  {sup.categoriesSupplied.map((cat, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-xl bg-slate-50 text-slate-700 text-xs border border-slate-200 font-medium">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Coverage Area:</span>
                  <span className="font-semibold text-slate-900">{sup.coverageArea}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Orders Fulfilled:</span>
                  <span className="font-mono font-bold text-emerald-700">{sup.totalFulfilledOrders} Orders</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">On-Time Delivery Rate:</span>
                  <span className="font-mono font-bold text-amber-800">{sup.onTimeDeliveryRate}%</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-700">
              <div>
                <span className="text-slate-500 block text-[10px]">Key Contact</span>
                <span className="font-bold text-slate-900">{sup.contactPerson}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[10px]">Direct Phone</span>
                <span className="font-mono text-amber-800 font-bold">{sup.phone}</span>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
