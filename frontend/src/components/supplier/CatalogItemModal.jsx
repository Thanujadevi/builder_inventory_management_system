import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { IconX, IconPackage, IconCheckCircle } from '../common/Icons';

export const CatalogItemModal = ({ itemToEdit, isOpen, onClose }) => {
  const { addCatalogItem, updateCatalogItem } = usePortal();

  const [name, setName] = useState(itemToEdit ? itemToEdit.name : '');
  const [category, setCategory] = useState(itemToEdit ? itemToEdit.category : 'Structural Steel');
  const [specifications, setSpecifications] = useState(itemToEdit ? itemToEdit.specifications : '');
  const [hsnCode, setHsnCode] = useState(itemToEdit ? itemToEdit.hsnCode : '72142090');
  const [unit, setUnit] = useState(itemToEdit ? itemToEdit.unit : 'Tons');
  const [baseUnitPrice, setBaseUnitPrice] = useState(itemToEdit ? itemToEdit.baseUnitPrice : 50000);
  const [minOrderQty, setMinOrderQty] = useState(itemToEdit ? itemToEdit.minOrderQty : 5);
  const [stockAvailability, setStockAvailability] = useState(itemToEdit ? itemToEdit.stockAvailability : 'In Stock');
  const [leadTimeDays, setLeadTimeDays] = useState(itemToEdit ? itemToEdit.leadTimeDays : 2);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name,
      category,
      specifications,
      hsnCode,
      unit,
      baseUnitPrice: Number(baseUnitPrice),
      minOrderQty: Number(minOrderQty),
      stockAvailability,
      leadTimeDays: Number(leadTimeDays),
      supplyZones: ["North Zone", "Metropolitan Region"]
    };

    if (itemToEdit) {
      updateCatalogItem({ ...itemToEdit, ...payload });
    } else {
      addCatalogItem(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-100 text-blue-800 border border-blue-200">
              <IconPackage className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-outfit">
                {itemToEdit ? 'Edit Catalog Item' : 'Add New Catalog Material'}
              </h2>
              <p className="text-xs text-slate-500">Manage rates, HSN codes, and stock levels</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition">
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1 font-outfit uppercase">Item Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Fe 550D TMT Rebars 12mm"
                className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl p-3 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1 font-outfit uppercase">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl p-3 outline-none"
              >
                <option value="Structural Steel">Structural Steel</option>
                <option value="Cement & Aggregate">Cement & Aggregate</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Finishes">Finishes</option>
                <option value="Safety">Safety & Gear</option>
                <option value="Tools/Hardware">Tools / Hardware</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-700 font-bold mb-1 font-outfit uppercase">Technical Specifications / Grade *</label>
            <input
              type="text"
              value={specifications}
              onChange={(e) => setSpecifications(e.target.value)}
              placeholder="e.g. IS 1786:2008 Grade Fe 550D High Ductility"
              className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl p-3 text-xs outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1 font-outfit uppercase">HSN Code *</label>
              <input
                type="text"
                value={hsnCode}
                onChange={(e) => setHsnCode(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 font-mono rounded-xl p-2.5 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1 font-outfit uppercase">Unit of Measure *</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl p-2.5 outline-none"
              >
                <option value="Tons">Tons</option>
                <option value="Bags">Bags</option>
                <option value="Cu.m">Cu.m</option>
                <option value="Meters">Meters</option>
                <option value="Units">Units</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1 font-outfit uppercase">Base Unit Price (₹) *</label>
              <input
                type="number"
                min="1"
                value={baseUnitPrice}
                onChange={(e) => setBaseUnitPrice(e.target.value)}
                className="w-full bg-white border border-slate-300 text-amber-800 font-bold font-mono rounded-xl p-2.5 outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1 font-outfit uppercase">Min Order Qty (MOQ)</label>
              <input
                type="number"
                min="1"
                value={minOrderQty}
                onChange={(e) => setMinOrderQty(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 font-mono rounded-xl p-2.5 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1 font-outfit uppercase">Stock Status</label>
              <select
                value={stockAvailability}
                onChange={(e) => setStockAvailability(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl p-2.5 outline-none"
              >
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1 font-outfit uppercase">Lead Time (Days)</label>
              <input
                type="number"
                min="1"
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 font-mono rounded-xl p-2.5 outline-none"
              />
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 pt-4 flex items-center justify-between">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl">
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow"
            >
              <IconCheckCircle className="w-4 h-4" />
              {itemToEdit ? 'Save Changes' : 'Add Item to Catalog'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
