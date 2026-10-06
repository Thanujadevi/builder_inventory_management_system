import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { IconBuilding, IconPlus, IconX } from '../../components/common/Icons';

export const ProjectsPage = ({ openCreateRFQ, openCreateProject }) => {
  const { projects } = usePortal();
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-outfit">Construction Sites & Projects</h1>
          <p className="text-xs text-slate-500 mt-1">Multi-site budget tracking, material consumption, and site manager performance</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openCreateProject}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow transition"
          >
            <IconBuilding className="w-4 h-4 text-amber-400" />
            + Register New Site
          </button>
          <button
            onClick={openCreateRFQ}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-extrabold rounded-2xl text-xs flex items-center gap-2 shadow hover:from-amber-400 transition"
          >
            <IconPlus className="w-4 h-4 stroke-[3]" />
            Create Material RFQ
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map(proj => {
          const percentSpent = Math.min(100, Math.round((proj.materialSpend / proj.budgetAllocated) * 100));

          return (
            <div
              key={proj.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs light-card-hover flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-amber-900 font-mono text-[10px] font-bold border border-slate-200">
                      {proj.id}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 font-outfit mt-1">{proj.name}</h2>
                    <p className="text-xs text-slate-500">{proj.location}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300">
                    {proj.status}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 mb-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Chief Site Engineer:</span>
                    <span className="font-semibold text-slate-900">{proj.siteEngineer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Site Budget:</span>
                    <span className="font-mono font-bold text-slate-900">₹{(proj.budgetAllocated / 10000000).toFixed(2)} Cr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Material Spend to Date:</span>
                    <span className="font-mono font-bold text-emerald-700">₹{(proj.materialSpend / 100000).toFixed(2)} Lakhs</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-500">Budget Utilization</span>
                    <span className="text-amber-800 font-bold">{percentSpent}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500 h-full rounded-full"
                      style={{ width: `${percentSpent}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <span className="text-slate-500 block text-[10px]">Active RFQs</span>
                    <span className="font-mono font-bold text-blue-700 text-sm">{proj.activeRFQsCount || 0}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <span className="text-slate-500 block text-[10px]">Pending Deliveries</span>
                    <span className="font-mono font-bold text-purple-800 text-sm">{proj.pendingDeliveriesCount || 0}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">Target: {proj.targetCompletion}</span>
                <button
                  onClick={() => setSelectedProject(proj)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-amber-900 font-semibold rounded-xl text-xs transition border border-slate-200"
                >
                  View Material Spend Breakdown →
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <div>
                <span className="text-xs font-mono font-bold text-amber-800">{selectedProject.id}</span>
                <h3 className="text-lg font-bold text-slate-900 font-outfit">{selectedProject.name}</h3>
                <p className="text-xs text-slate-500">{selectedProject.location}</p>
              </div>
              <button onClick={() => setSelectedProject(null)} className="p-2 text-slate-400 hover:text-slate-800 rounded-xl">
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-outfit">Material Category Consumption Breakdown</h4>

              <div className="space-y-3">
                {Object.entries(selectedProject.materialBreakdown || {}).map(([cat, val]) => (
                  <div key={cat} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-800 capitalize font-outfit">{cat} Material</span>
                    <span className="font-mono font-bold text-amber-800 text-sm">₹{(val / 100000).toFixed(2)} Lakhs</span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Site Engineer</span>
                  <span className="font-bold text-slate-900">{selectedProject.siteEngineer}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Start Date</span>
                  <span className="font-mono text-slate-900 font-semibold">{selectedProject.startDate}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between">
              <button onClick={() => setSelectedProject(null)} className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl">
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedProject(null);
                  openCreateRFQ();
                }}
                className="px-5 py-2 bg-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow"
              >
                Create RFQ for this Project
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
