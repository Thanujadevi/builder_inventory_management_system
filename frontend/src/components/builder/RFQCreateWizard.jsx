import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { IconX, IconPlus, IconAlertTriangle, IconFileText, IconCheckCircle } from '../common/Icons';

export const RFQCreateWizard = ({ isOpen, onClose }) => {
  const { projects, catalog, createRFQ } = usePortal();

  const [step, setStep] = useState(1);
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
  const [siteAddress, setSiteAddress] = useState(projects[0]?.location || '');
  const [requiredByDate, setRequiredByDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [urgency, setUrgency] = useState('Normal');
  const [notes, setNotes] = useState('');

  // Line Items State
  const [items, setItems] = useState([
    {
      id: "ITEM-1",
      category: "Structural Steel",
      name: "Fe 550D TMT Rebars 12mm",
      specifications: "IS 1786 Grade Fe 550D thermo-mechanically treated steel bars",
      quantity: 20,
      unit: "Tons",
      targetPrice: 54000
    }
  ]);

  if (!isOpen) return null;

  const activeProject = projects.find(p => p.id === selectedProjectId);

  const handleProjectChange = (projId) => {
    setSelectedProjectId(projId);
    const p = projects.find(item => item.id === projId);
    if (p) {
      setSiteAddress(p.location);
    }
  };

  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      {
        id: `ITEM-${prev.length + 1}`,
        category: "Cement & Aggregate",
        name: "OPC 53 Grade Cement Bags",
        specifications: "IS 12269, 50kg fresh cement bags",
        quantity: 500,
        unit: "Bags",
        targetPrice: 380
      }
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const handlePresetSelect = (index, catItemId) => {
    const catItem = catalog.find(c => c.id === catItemId);
    if (!catItem) return;
    setItems(prev => prev.map((item, i) => i === index ? {
      ...item,
      category: catItem.category,
      name: catItem.name,
      specifications: catItem.specifications,
      unit: catItem.unit,
      targetPrice: catItem.baseUnitPrice
    } : item));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createRFQ({
      projectId: selectedProjectId,
      projectName: activeProject ? activeProject.name : "Construction Site",
      siteAddress,
      requiredByDate,
      urgency,
      notes,
      items
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Wizard Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-900 border border-amber-200">
              <IconFileText className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-outfit">Create New Material Price Request (RFQ)</h2>
              <p className="text-xs text-slate-500">Ask verified material suppliers for line-item rates and delivery lead times</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Easy 3 Step Bar */}
        <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-around text-xs font-outfit font-bold">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-amber-900' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-amber-500 text-slate-950 font-extrabold' : 'bg-slate-200 text-slate-600'}`}>1</span>
            <span>1. Select Site & Delivery Date</span>
          </div>
          <div className="w-12 h-0.5 bg-slate-200"></div>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-amber-900' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-amber-500 text-slate-950 font-extrabold' : 'bg-slate-200 text-slate-600'}`}>2</span>
            <span>2. Add Materials Needed ({items.length})</span>
          </div>
          <div className="w-12 h-0.5 bg-slate-200"></div>
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-amber-900' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-amber-500 text-slate-950 font-extrabold' : 'bg-slate-200 text-slate-600'}`}>3</span>
            <span>3. Review & Send to Suppliers</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-outfit uppercase tracking-wider">
                    Which Construction Site Needs Materials? *
                  </label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => handleProjectChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none font-medium"
                    required
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.location})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-outfit uppercase tracking-wider">
                    Site Delivery Address *
                  </label>
                  <input
                    type="text"
                    value={siteAddress}
                    onChange={(e) => setSiteAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-outfit uppercase tracking-wider">
                    When Do You Need Materials Delivered to Site? *
                  </label>
                  <input
                    type="date"
                    value={requiredByDate}
                    onChange={(e) => setRequiredByDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-outfit uppercase tracking-wider">
                    Delivery Urgency *
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none font-medium"
                  >
                    <option value="Normal">Standard Priority (Deliver in 7-14 Days)</option>
                    <option value="High">High Priority (Deliver in 3-5 Days)</option>
                    <option value="Emergency">Urgent: Site Work Stopped! (Immediate Truck Dispatch Needed)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-outfit uppercase tracking-wider">
                  Special Notes for Suppliers (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Please provide manufacturer test certificates upon truck arrival at gate..."
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl p-3 text-sm h-24 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-500">Specify the items, quantities, and target prices for your site. You can pick from preset items or enter custom names.</p>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow"
                >
                  <IconPlus className="w-4 h-4 stroke-[3]" />
                  + Add Another Material
                </button>
              </div>

              {items.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold text-amber-900 font-outfit uppercase">
                      Material Item #{idx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <select
                        onChange={(e) => handlePresetSelect(idx, e.target.value)}
                        className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg px-2.5 py-1 outline-none"
                      >
                        <option value="">Load Sample Material Preset...</option>
                        {catalog.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.category})
                          </option>
                        ))}
                      </select>

                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-red-500 hover:text-red-700 p-1 hover:bg-slate-200 rounded transition"
                          title="Remove item"
                        >
                          <IconX className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Material Name *</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                        placeholder="e.g. Fe 550D TMT Rebars 12mm"
                        className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Category *</label>
                      <select
                        value={item.category}
                        onChange={(e) => handleItemChange(idx, 'category', e.target.value)}
                        className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
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

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Specifications / Grade *</label>
                      <input
                        type="text"
                        value={item.specifications}
                        onChange={(e) => handleItemChange(idx, 'specifications', e.target.value)}
                        placeholder="e.g. IS 1786 Grade Fe 550D"
                        className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Quantity Needed *</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 text-slate-900 font-mono font-bold rounded-lg p-2 text-xs outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Unit of Measure *</label>
                      <select
                        value={item.unit}
                        onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                        className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg p-2 text-xs outline-none"
                      >
                        <option value="Tons">Tons</option>
                        <option value="Bags">Bags (50kg)</option>
                        <option value="Cu.m">Cu.m (Cubic Meters)</option>
                        <option value="Meters">Meters</option>
                        <option value="Units">Units / Pieces</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Target Unit Rate (₹) *</label>
                      <input
                        type="number"
                        min="1"
                        value={item.targetPrice}
                        onChange={(e) => handleItemChange(idx, 'targetPrice', Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 text-amber-800 font-bold font-mono rounded-lg p-2 text-xs outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h3 className="text-xs font-bold text-slate-700 font-outfit uppercase tracking-wider flex items-center gap-2">
                  <IconCheckCircle className="w-4 h-4 text-emerald-600" />
                  Review Material Request Details
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Construction Site</span>
                    <span className="font-bold text-slate-900">{activeProject?.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Delivery Priority</span>
                    <span className={`font-bold ${urgency === 'Emergency' ? 'text-red-600' : 'text-amber-800'}`}>{urgency}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Required By Date</span>
                    <span className="font-mono text-slate-900 font-semibold">{requiredByDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Total Items Requested</span>
                    <span className="font-bold text-emerald-700 font-mono">{items.length} items</span>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-3">Material</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Quantity</th>
                      <th className="p-3">Target Unit Price</th>
                      <th className="p-3 text-right">Est. Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {items.map((it, i) => (
                      <tr key={i}>
                        <td className="p-3 font-semibold text-slate-900">{it.name} <span className="block text-[10px] text-slate-500 font-normal">{it.specifications}</span></td>
                        <td className="p-3 text-slate-600">{it.category}</td>
                        <td className="p-3 font-mono text-slate-900 font-bold">{it.quantity} {it.unit}</td>
                        <td className="p-3 font-mono text-amber-800 font-semibold">₹{it.targetPrice.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">₹{(it.quantity * it.targetPrice).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 flex items-start gap-2">
                <IconAlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
                <p className="leading-relaxed">
                  When you click <strong>"Send Price Request to Suppliers"</strong>, all verified suppliers supplying these categories will receive an instant notification to submit their best price bids.
                </p>
              </div>
            </div>
          )}

        </form>

        {/* Wizard Footer Controls */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold"
            >
              ← Back
            </button>
          ) : <div></div>}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow"
            >
              Next Step: {step === 1 ? 'Add Materials' : 'Review'} →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <IconCheckCircle className="w-4 h-4" />
              Send Price Request to Suppliers
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
