import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import { IconX, IconCheckCircle, IconUsers, IconBuilding, IconTruck } from './Icons';

export const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const { showToast } = usePortal();

  const [name, setName] = useState(user ? user.name : '');
  const [email, setEmail] = useState(user ? user.email : '');
  const [title, setTitle] = useState(user ? user.title : '');
  const [organization, setOrganization] = useState(user ? user.organization : '');
  const [phone, setPhone] = useState(user ? user.phone || '+91 98765 43210' : '');
  const [gstin, setGstin] = useState(user ? user.gstin || '07AAACB9912E1ZB' : '');
  const [address, setAddress] = useState(user ? user.address || 'Plot 104, Cyber City, Gurgaon, HR' : '');
  const [avatarColor, setAvatarColor] = useState(user ? user.avatarColor : 'bg-amber-500 text-slate-950');

  if (!isOpen || !user) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      title,
      organization,
      phone,
      gstin,
      address,
      avatarColor
    });
    showToast("Profile updated successfully!");
    onClose();
  };

  const colorOptions = [
    { label: "Construction Amber", value: "bg-amber-500 text-slate-950" },
    { label: "Steel Blue", value: "bg-blue-600 text-white" },
    { label: "Emerald Green", value: "bg-emerald-600 text-white" },
    { label: "Purple Indigo", value: "bg-purple-600 text-white" },
    { label: "Slate Dark", value: "bg-slate-900 text-white" },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl ${avatarColor} font-bold text-sm flex items-center justify-center shadow font-outfit uppercase`}>
              {name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white font-outfit">Manage My Profile</h2>
                <span className={`text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded border ${
                  user.role === 'BUILDER'
                    ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700/60'
                    : 'bg-blue-100 dark:bg-blue-950/50 text-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-700/60'
                }`}>
                  {user.role} ACCOUNT
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Update your contact details, job title, and organization profile</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition">
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 font-outfit uppercase">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-slate-800"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 font-outfit uppercase">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-slate-800"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 font-outfit uppercase">Job Title / Designation *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-3 text-sm outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 font-outfit uppercase">Company / Organization *</label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-3 text-sm outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 font-outfit uppercase">Direct Phone Number *</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono rounded-xl p-3 text-sm outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 font-outfit uppercase">GSTIN / Tax ID Number</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono rounded-xl p-3 text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-700 dark:text-slate-300 font-bold mb-1 font-outfit uppercase">Official Office / Site Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-3 text-xs outline-none"
            />
          </div>

          {/* Avatar Theme Color Selector */}
          <div>
            <label className="block text-xs text-slate-700 dark:text-slate-300 font-bold mb-2 font-outfit uppercase">Badge Theme Color</label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((opt, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setAvatarColor(opt.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                    avatarColor === opt.value
                      ? 'ring-2 ring-slate-900 dark:ring-amber-400 border-slate-900 dark:border-amber-400 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full ${opt.value.split(' ')[0]}`}></span>
                  <span className="text-slate-700 dark:text-slate-300 font-outfit">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 pt-4 flex items-center justify-between">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-semibold rounded-xl">
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow"
            >
              <IconCheckCircle className="w-4 h-4" />
              Save Profile Changes
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
