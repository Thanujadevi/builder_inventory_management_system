import React from 'react';

export const StatusBadge = ({ type, value }) => {
  let colorStyle = "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  let displayLabel = value;

  if (type === 'urgency') {
    switch (value) {
      case 'Emergency':
        colorStyle = "bg-red-100 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800 font-extrabold animate-pulse-subtle";
        displayLabel = "Urgent: Site Stopped";
        break;
      case 'High':
        colorStyle = "bg-purple-100 text-[#7C3AED] border-purple-300 dark:bg-[#7C3AED]/20 dark:text-purple-300 dark:border-[#7C3AED]/50 font-bold";
        displayLabel = "High Priority (3-5 Days)";
        break;
      case 'Normal':
        colorStyle = "bg-indigo-50 text-[#844FC1] border-indigo-200 dark:bg-[#844FC1]/20 dark:text-indigo-300 dark:border-[#844FC1]/40 font-medium";
        displayLabel = "Standard (7-14 Days)";
        break;
      default:
        break;
    }
  } else if (type === 'rfqStatus') {
    switch (value) {
      case 'Draft':
        colorStyle = "bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
        displayLabel = "Draft Request";
        break;
      case 'Broadcasted':
        colorStyle = "bg-indigo-100 text-[#844FC1] border-indigo-300 dark:bg-[#844FC1]/20 dark:text-indigo-300 dark:border-[#844FC1]/40 font-semibold";
        displayLabel = "Sent to Suppliers";
        break;
      case 'Quotes Received':
        colorStyle = "bg-purple-100 text-[#7C3AED] border-purple-300 dark:bg-[#7C3AED]/25 dark:text-purple-300 dark:border-[#7C3AED]/50 font-bold";
        displayLabel = "Supplier Bids Received";
        break;
      case 'PO Issued':
        colorStyle = "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 font-bold";
        displayLabel = "Order Placed (PO Sent)";
        break;
      case 'Fulfilled':
        colorStyle = "bg-teal-100 text-teal-900 border-teal-300 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800";
        displayLabel = "Delivered & Completed";
        break;
      default:
        break;
    }
  } else if (type === 'poStatus') {
    switch (value) {
      case 'Issued':
        colorStyle = "bg-indigo-100 text-[#844FC1] border-indigo-300 dark:bg-[#844FC1]/20 dark:text-indigo-300 dark:border-[#844FC1]/40 font-semibold";
        displayLabel = "Order Placed (Awaiting Truck)";
        break;
      case 'Processing':
        colorStyle = "bg-purple-100 text-[#7C3AED] border-purple-300 dark:bg-[#7C3AED]/20 dark:text-purple-300 dark:border-[#7C3AED]/40 font-semibold";
        displayLabel = "Supplier Packing Items";
        break;
      case 'Dispatched':
        colorStyle = "bg-purple-100 text-[#7C3AED] border-purple-300 dark:bg-[#7C3AED]/30 dark:text-purple-200 dark:border-[#7C3AED] font-bold animate-pulse-subtle";
        displayLabel = "Truck En-Route to Site";
        break;
      case 'Delivered':
        colorStyle = "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 font-bold";
        displayLabel = "Delivered & Inspected";
        break;
      default:
        break;
    }
  } else if (type === 'grnStatus') {
    switch (value) {
      case 'Pending Site Sign-Off':
        colorStyle = "bg-purple-100 text-[#7C3AED] border-purple-300 dark:bg-[#7C3AED]/25 dark:text-purple-300 dark:border-[#7C3AED]/50 font-bold";
        displayLabel = "Needs Site Inspection";
        break;
      case 'Approved / GRN Issued':
        colorStyle = "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 font-extrabold";
        displayLabel = "Approved & Received (GRN Signed)";
        break;
      case 'Discrepancy Flagged':
        colorStyle = "bg-red-100 text-red-900 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800 font-extrabold";
        displayLabel = "Damaged / Missing Goods Flagged";
        break;
      default:
        break;
    }
  } else if (type === 'stock') {
    switch (value) {
      case 'In Stock':
        colorStyle = "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 font-semibold";
        displayLabel = "In Stock (Available)";
        break;
      case 'Low Stock':
        colorStyle = "bg-purple-100 text-[#7C3AED] border-purple-300 dark:bg-[#7C3AED]/20 dark:text-purple-300 dark:border-[#7C3AED]/40 font-semibold";
        displayLabel = "Low Stock";
        break;
      case 'Out of Stock':
        colorStyle = "bg-red-100 text-red-900 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800 font-semibold";
        displayLabel = "Out of Stock";
        break;
      default:
        break;
    }
  }

  return (
    <span className={`px-2.5 py-1 text-[11px] rounded-full border tracking-wide uppercase inline-flex items-center gap-1.5 ${colorStyle}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {displayLabel}
    </span>
  );
};
