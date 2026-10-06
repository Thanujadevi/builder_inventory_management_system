import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { IconPackage, IconPlus, IconSearch } from '../../components/common/Icons';
import { StatusBadge } from '../../components/common/StatusBadge';

export const CatalogPage = ({ openCatalogModal }) => {
  const { catalog } = usePortal();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredCatalog = catalog.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.specifications.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.hsnCode.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-outfit">Supplier Product Catalog & Rate Matrix</h1>
          <p className="text-xs text-slate-500 mt-1">Manage base unit prices, HSN codes, MOQ limits, lead times, and stock availability</p>
        </div>
        <button
          onClick={() => openCatalogModal(null)}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-extrabold rounded-2xl text-xs flex items-center gap-2 shadow hover:from-blue-500 transition"
        >
          <IconPlus className="w-4 h-4 stroke-[3]" />
          Add Catalog Material
        </button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <IconSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by material, spec, HSN code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['All', 'Structural Steel', 'Cement & Aggregate', 'Electrical', 'Plumbing', 'Safety'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase font-mono text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-4">Material & Specifications</th>
                <th className="p-4">Category</th>
                <th className="p-4">HSN Code</th>
                <th className="p-4">Base Unit Price (₹)</th>
                <th className="p-4">Stock Status</th>
                <th className="p-4">Lead Time</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredCatalog.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="p-4">
                    <span className="font-bold text-slate-900 block font-outfit text-sm">{item.name}</span>
                    <span className="text-[11px] text-slate-500">{item.specifications}</span>
                  </td>
                  <td className="p-4 font-semibold text-slate-700">{item.category}</td>
                  <td className="p-4 font-mono text-slate-500">{item.hsnCode}</td>
                  <td className="p-4">
                    <span className="font-mono font-bold text-amber-800 text-sm">₹{item.baseUnitPrice.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-500 block">Per {item.unit} (MOQ: {item.minOrderQty})</span>
                  </td>
                  <td className="p-4">
                    <StatusBadge type="stock" value={item.stockAvailability} />
                  </td>
                  <td className="p-4 font-mono text-slate-700">{item.leadTimeDays} Days</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => openCatalogModal(item)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-blue-700 font-semibold rounded-xl text-xs border border-slate-200 transition"
                    >
                      Edit Rate / Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
