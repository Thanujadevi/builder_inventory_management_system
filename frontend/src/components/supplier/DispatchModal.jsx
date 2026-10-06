import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { IconX, IconTruck, IconCheckCircle } from '../common/Icons';

export const DispatchModal = ({ poId, isOpen, onClose }) => {
  const { purchaseOrders, dispatchOrder } = usePortal();

  const targetPO = purchaseOrders.find(p => p.id === poId);

  const [vehicleNumber, setVehicleNumber] = useState("MH-04-EK-9821");
  const [driverName, setDriverName] = useState("Ramesh Sharma");
  const [driverContact, setDriverContact] = useState("+91 98200 11223");
  const [challanNumber, setChallanNumber] = useState(`CH-2026-${Math.floor(7000 + Math.random() * 2000)}`);
  const [ewayBillNumber, setEwayBillNumber] = useState(`EWB-${Math.floor(100000000000 + Math.random() * 900000000000)}`);

  if (!isOpen || !targetPO) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatchOrder(poId, {
      vehicleNumber,
      driverName,
      driverContact,
      challanNumber,
      ewayBillNumber
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-800 border border-purple-200">
              <IconTruck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-outfit">Log Goods Dispatch</h2>
              <p className="text-xs text-slate-500">
                Fulfilling PO <span className="text-amber-800 font-mono font-bold">{targetPO.id}</span>
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition">
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Target Project</span>
              <span className="font-semibold text-slate-900">{targetPO.projectName}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Site Address</span>
              <span className="text-slate-800 truncate max-w-[220px]">{targetPO.deliverySiteAddress}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-outfit uppercase tracking-wider">
              Truck / Dispatch Vehicle Number *
            </label>
            <input
              type="text"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              placeholder="e.g. MH-04-EK-9821"
              className="w-full bg-white border border-slate-300 text-slate-900 font-mono rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-outfit uppercase tracking-wider">
                Driver Name *
              </label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl p-3 text-sm outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-outfit uppercase tracking-wider">
                Driver Phone *
              </label>
              <input
                type="text"
                value={driverContact}
                onChange={(e) => setDriverContact(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl p-3 text-sm outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-outfit uppercase tracking-wider">
                Delivery Challan # *
              </label>
              <input
                type="text"
                value={challanNumber}
                onChange={(e) => setChallanNumber(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 font-mono rounded-xl p-3 text-sm outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-outfit uppercase tracking-wider">
                E-Way Bill Number *
              </label>
              <input
                type="text"
                value={ewayBillNumber}
                onChange={(e) => setEwayBillNumber(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 font-mono rounded-xl p-3 text-sm outline-none"
                required
              />
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 pt-4 flex items-center justify-between">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl">
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow"
            >
              <IconCheckCircle className="w-4 h-4" />
              Confirm Goods Dispatched
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
