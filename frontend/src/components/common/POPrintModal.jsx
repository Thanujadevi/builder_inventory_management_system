import React from 'react';
import { usePortal } from '../../context/PortalContext';
import { IconX, IconPrinter, IconBuilding, IconCheckCircle, IconShieldCheck } from './Icons';

export const POPrintModal = ({ poId, isOpen, onClose }) => {
  const { purchaseOrders } = usePortal();

  const targetPO = purchaseOrders.find(p => p.id === poId);

  if (!isOpen || !targetPO) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Controls Bar (No Print) */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-mono text-xs font-bold rounded-lg border border-amber-300">
              FORMAL PO SPECIFICATION
            </span>
            <h3 className="text-sm font-bold text-slate-900 font-outfit">{targetPO.id}</h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow"
            >
              <IconPrinter className="w-4 h-4" />
              Print / Save PDF
            </button>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition">
              <IconX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE DOCUMENT CONTAINER */}
        <div className="flex-1 overflow-y-auto p-8 bg-white text-slate-900" id="printable-po">
          
          {/* Header */}
          <div className="border-b border-slate-200 pb-6 mb-6 flex flex-col md:flex-row justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center shadow">
                  <IconBuilding className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 font-outfit tracking-tight">BuildCorp Infrastructure Ltd.</h1>
              </div>
              <p className="text-xs text-slate-500">Headquarters: Plot 104, Cyber City, Gurgaon, HR - 122002</p>
              <p className="text-xs text-slate-500 font-mono">GSTIN: 07AAACB9912E1ZB • CIN: U45200HR2020PLC08821</p>
            </div>

            <div className="text-left md:text-right bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h2 className="text-lg font-black text-amber-700 font-outfit uppercase tracking-wider">OFFICIAL PURCHASE ORDER</h2>
              <p className="text-sm font-mono font-bold text-slate-900 mt-1">PO #: {targetPO.id}</p>
              <p className="text-xs text-slate-500 font-mono">Date Issued: {targetPO.poDate}</p>
              <p className="text-xs text-slate-600">Status: <strong className="text-emerald-700 uppercase font-bold">{targetPO.fulfillmentStatus}</strong></p>
            </div>
          </div>

          {/* Vendor & Consignee Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-amber-800 font-bold font-outfit uppercase tracking-wider block mb-1">VENDOR / SUPPLIER DETAILS</span>
              <h3 className="text-sm font-bold text-slate-900">{targetPO.supplierName}</h3>
              <p className="text-slate-700">GSTIN: <span className="font-mono text-slate-900 font-semibold">{targetPO.supplierGSTIN}</span></p>
              <p className="text-slate-500">B2B Material Direct Fulfillment Network</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-amber-800 font-bold font-outfit uppercase tracking-wider block mb-1">CONSIGNEE / SITE DELIVERY ADDRESS</span>
              <h3 className="text-sm font-bold text-slate-900">{targetPO.projectName}</h3>
              <p className="text-slate-700">{targetPO.deliverySiteAddress}</p>
              <p className="text-slate-500">Site Manager: <span className="text-slate-900 font-semibold">{targetPO.siteEngineer}</span></p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-mono uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Item Name & Specifications</th>
                  <th className="p-3 text-center">Qty & Unit</th>
                  <th className="p-3 text-right">Unit Rate (₹)</th>
                  <th className="p-3 text-center">GST %</th>
                  <th className="p-3 text-right">Total Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {targetPO.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{it.name}</span>
                      <span className="text-[10px] text-slate-500">{it.specifications}</span>
                    </td>
                    <td className="p-3 text-center font-mono text-slate-800 font-semibold">{it.quantity} {it.unit}</td>
                    <td className="p-3 text-right font-mono text-amber-700 font-semibold">₹{it.unitPrice.toLocaleString()}</td>
                    <td className="p-3 text-center font-mono text-slate-700">{it.gstPercent}%</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">₹{it.totalAmount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Commercial Terms & Totals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="font-bold text-slate-900 font-outfit uppercase tracking-wider block">Commercial Terms & Conditions</span>
              <p className="text-slate-700">Payment Terms: <strong className="text-amber-800">{targetPO.paymentTerms}</strong></p>
              <p className="text-slate-600 leading-relaxed">
                1. Delivery must comply strictly with IS standard specifications.<br />
                2. Goods subject to site weighbridge tally and site engineer GRN sign-off.<br />
                3. Tax invoice & E-way bill required with dispatch vehicle.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-right">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-mono text-slate-900">₹{targetPO.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Taxes (GST Total)</span>
                <span className="font-mono text-slate-900">₹{targetPO.taxTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Freight & Site Offloading</span>
                <span className="font-mono text-slate-900">₹{targetPO.freightCharges.toLocaleString()}</span>
              </div>
              <div className="border-t border-slate-300 pt-2 flex justify-between items-center text-sm font-black text-slate-900 font-outfit">
                <span className="uppercase text-amber-700">PO Grand Total</span>
                <span className="font-mono text-xl text-amber-700">₹{targetPO.grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Authorized Signatures */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-6 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div className="w-10 h-10 rounded-full border-2 border-emerald-500 text-emerald-700 flex items-center justify-center mx-auto mb-2 font-mono font-bold text-[10px]">
                <IconShieldCheck className="w-5 h-5" />
              </div>
              <p className="font-bold text-slate-900">Authorized Procurement Officer</p>
              <p className="text-[10px] text-slate-500">BuildCorp Infrastructure Ltd.</p>
              <span className="text-[9px] font-mono text-emerald-700 font-bold block mt-1">Digitally Signed & Validated</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div className="w-10 h-10 rounded-full border-2 border-amber-500 text-amber-700 flex items-center justify-center mx-auto mb-2 font-mono font-bold text-[10px]">
                <IconCheckCircle className="w-5 h-5" />
              </div>
              <p className="font-bold text-slate-900">Accepted & Confirmed Supplier</p>
              <p className="text-[10px] text-slate-500">{targetPO.supplierName}</p>
              <span className="text-[9px] font-mono text-amber-700 font-bold block mt-1">System Acknowledged</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
