import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { IconBuilding, IconTruck, IconShieldCheck, IconAlertTriangle } from '../../components/common/Icons';

export const LoginPage = () => {
  const { login, demoLogin, authError } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleFormSubmit = (e) => {
    e.preventDefault();
    login(emailOrUsername, password);
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#0F172A] flex flex-col justify-center items-center p-4 selection:bg-[#7C3AED] selection:text-white transition-colors">
      
      {/* Brand Logo & Title */}
      <div className="mb-8 text-center max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7C3AED] via-[#844FC1] to-[#6D28D9] flex items-center justify-center text-white font-bold mx-auto mb-4 shadow-xl shadow-[#7C3AED]/30 ring-4 ring-white dark:ring-slate-800">
          <IconBuilding className="w-8 h-8 stroke-[2.2]" />
        </div>
        <h1 className="text-3xl font-black text-[#0F172A] dark:text-white font-outfit tracking-tight">BuildHub Pro</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
          Construction Material Procurement Portal • Sophisticated Tech Direct B2B Hub
        </p>
      </div>

      {/* Main Single Authentication Card */}
      <div className="w-full max-w-md bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Card Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-[#F3F4F6]/50 dark:bg-slate-900/60">
          <h2 className="text-lg font-bold text-[#0F172A] dark:text-white font-outfit">Account Portal Sign-In</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enter your credentials. The system automatically detects whether you are logging in as a <strong className="text-[#7C3AED] dark:text-purple-400">Builder</strong> or a <strong className="text-[#844FC1] dark:text-indigo-400">Supplier</strong>.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          
          {authError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl text-xs text-red-700 dark:text-red-400 flex items-center gap-2 font-medium">
              <IconAlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
              {authError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-outfit uppercase tracking-wider">
              Email or Username *
            </label>
            <input
              type="text"
              placeholder="e.g. builder@buildcorp.com or supplier@apexsteel.com"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              className="w-full bg-[#F3F4F6] dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-[#0F172A] dark:text-white rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-[#7C3AED] focus:border-[#7C3AED] focus:bg-white dark:focus:bg-slate-800 outline-none transition font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-outfit uppercase tracking-wider">
              Password *
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#F3F4F6] dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-[#0F172A] dark:text-white rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-[#7C3AED] focus:border-[#7C3AED] focus:bg-white dark:focus:bg-slate-800 outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-[#7C3AED] via-[#844FC1] to-[#6D28D9] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white font-black text-xs rounded-xl transition shadow-lg shadow-[#7C3AED]/30 flex items-center justify-center gap-2 font-outfit tracking-wide uppercase"
          >
            <IconShieldCheck className="w-4 h-4 stroke-[2.5]" />
            Sign In to Workspace
          </button>

          {/* Preset Credentials Guide Capsule */}
          <div className="p-3.5 bg-[#F3F4F6]/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <span className="font-bold text-[#0F172A] dark:text-slate-100 uppercase font-outfit text-[10px] tracking-wider block">Registered Account Credentials</span>
            <div className="flex justify-between items-center text-[11px]">
              <span>Builder Account:</span>
              <code className="font-mono font-bold text-[#7C3AED] dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800/50">builder@buildcorp.com</code>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span>Supplier Account:</span>
              <code className="font-mono font-bold text-[#844FC1] dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/50">supplier@apexsteel.com</code>
            </div>
          </div>

          {/* Quick One-Click Demo Sign-In Buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center font-outfit">
              Or Instant One-Click Login
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => demoLogin('BUILDER')}
                className="p-3 bg-purple-50 dark:bg-[#7C3AED]/20 border border-purple-200 dark:border-[#7C3AED]/50 text-[#7C3AED] dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-[#7C3AED]/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
              >
                <IconBuilding className="w-4 h-4 text-[#7C3AED] dark:text-purple-400" />
                Login as Builder
              </button>

              <button
                type="button"
                onClick={() => demoLogin('SUPPLIER')}
                className="p-3 bg-indigo-50 dark:bg-[#844FC1]/20 border border-indigo-200 dark:border-[#844FC1]/50 text-[#844FC1] dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-[#844FC1]/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
              >
                <IconTruck className="w-4 h-4 text-[#844FC1] dark:text-indigo-400" />
                Login as Supplier
              </button>
            </div>
          </div>

        </form>

        <div className="p-3 bg-[#F3F4F6]/50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 text-center text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          Automated Role Detection Protocol • Direct Procurement Tech Hub
        </div>

      </div>
    </div>
  );
};
