import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { IconX, IconBuilding, IconCheckCircle } from '../common/Icons';

export const ProjectCreateModal = ({ isOpen, onClose }) => {
  const { addProject } = usePortal();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [siteEngineer, setSiteEngineer] = useState('Vikram Malhotra (Senior PM)');
  const [budgetAllocated, setBudgetAllocated] = useState(20000000); // Default ₹2 Cr
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [targetCompletion, setTargetCompletion] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !location) return;

    addProject({
      name,
      location,
      siteEngineer,
      budgetAllocated: Number(budgetAllocated),
      startDate,
      targetCompletion
    });

    // Reset form & close
    setName('');
    setLocation('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-900 border border-amber-200">
              <IconBuilding className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-outfit">Create Construction Site / Project</h2>
              <p className="text-xs text-slate-500">Register new project site to manage budgets and material RFQs</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition">
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-outfit uppercase tracking-wider">
              Project / Site Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Prestige Tech Park Tower 3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-outfit uppercase tracking-wider">
              Site Location Address *
            </label>
            <input
              type="text"
              placeholder="e.g. Plot 42, Outer Ring Road, Bengaluru, KA"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-outfit uppercase tracking-wider">
                Chief Site Engineer / PM *
              </label>
              <input
                type="text"
                value={siteEngineer}
                onChange={(e) => setSiteEngineer(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl p-3 text-sm outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-outfit uppercase tracking-wider">
                Allocated Material Budget (₹) *
              </label>
              <input
                type="number"
                min="100000"
                step="500000"
                value={budgetAllocated}
                onChange={(e) => setBudgetAllocated(e.target.value)}
                className="w-full bg-white border border-slate-300 text-amber-800 font-bold font-mono rounded-xl p-3 text-sm outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-outfit uppercase tracking-wider">
                Project Start Date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl p-3 text-sm outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-outfit uppercase tracking-wider">
                Target Completion Date *
              </label>
              <input
                type="date"
                value={targetCompletion}
                onChange={(e) => setTargetCompletion(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl p-3 text-sm outline-none"
                required
              />
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 space-y-1">
            <span className="font-bold uppercase font-outfit text-[10px] tracking-wider block">Auto Budget Allocation Preview</span>
            <p className="text-[11px] leading-relaxed">
              Budget of <strong>₹{(budgetAllocated / 100000).toFixed(2)} Lakhs</strong> will be split into structural steel (40%), cement & concrete (30%), electrical (15%), plumbing (10%), and finishing (5%).
            </p>
          </div>

          <div className="p-4 border-t border-slate-200 pt-4 flex items-center justify-between">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl">
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-md"
            >
              <IconCheckCircle className="w-4 h-4" />
              Register New Construction Site
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
