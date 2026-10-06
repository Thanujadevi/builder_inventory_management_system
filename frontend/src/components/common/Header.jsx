import React, { useState } from 'react';
import { useRole } from '../../context/RoleContext';
import { usePortal } from '../../context/PortalContext';
import { IconBell, IconRefresh, IconBuilding, IconTruck, IconUsers, IconLayers } from './Icons';
import { NotificationDrawer } from './NotificationDrawer';

export const Header = () => {
  const { role, toggleRole, activeUserInfo } = useRole();
  const { notifications, resetDemoData } = usePortal();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3 transition-all">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-construction-amber flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20 ring-1 ring-white/20">
              <IconBuilding className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-white font-outfit">BuildHub Pro</h1>
                <span className="text-[10px] uppercase font-bold font-mono tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Direct B2B Hub
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Construction Material Procurement Portal</p>
            </div>
          </div>

          {/* Center Role Switcher (Hero Demo Toggle) */}
          <div className="hidden md:flex items-center bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
            <button
              onClick={() => role !== 'BUILDER' && toggleRole()}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-outfit transition-all duration-200 ${
                role === 'BUILDER'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <IconBuilding className="w-4 h-4" />
              <span>BUILDER ROLE</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${role === 'BUILDER' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                Buyer / Site
              </span>
            </button>

            <button
              onClick={() => role !== 'SUPPLIER' && toggleRole()}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-outfit transition-all duration-200 ${
                role === 'SUPPLIER'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <IconTruck className="w-4 h-4" />
              <span>SUPPLIER ROLE</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${role === 'SUPPLIER' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                Seller / Vendor
              </span>
            </button>
          </div>

          {/* Right Utilities: Notifications, Demo Reset, User Profile */}
          <div className="flex items-center gap-3">
            
            {/* Reset Demo Button */}
            <button
              onClick={resetDemoData}
              title="Reset initial demo data"
              className="p-2 text-slate-400 hover:text-amber-400 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition flex items-center gap-1.5 text-xs font-medium"
            >
              <IconRefresh className="w-4 h-4" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2.5 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition"
              aria-label="Open notifications"
            >
              <IconBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[10px] flex items-center justify-center animate-pulse shadow-md">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Profile Capsule */}
            <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
              <div className={`w-9 h-9 rounded-xl ${activeUserInfo.avatarColor} font-bold text-xs flex items-center justify-center shadow-md font-outfit uppercase`}>
                {activeUserInfo.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-100 font-outfit flex items-center gap-1.5">
                  {activeUserInfo.name}
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${role === 'BUILDER' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'}`}>
                    {role}
                  </span>
                </p>
                <p className="text-[11px] text-slate-400 truncate max-w-[170px]">{activeUserInfo.organization}</p>
              </div>
            </div>

          </div>
        </div>

        {/* Mobile Role Switcher Bar */}
        <div className="md:hidden mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Current Role Mode:</span>
          <button
            onClick={toggleRole}
            className={`px-3 py-1 rounded-lg text-xs font-bold ${
              role === 'BUILDER' ? 'bg-amber-500 text-slate-950' : 'bg-blue-600 text-white'
            }`}
          >
            Switch to {role === 'BUILDER' ? 'Supplier Sales' : 'Builder Site'} →
          </button>
        </div>
      </header>

      {/* Notifications Drawer */}
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
};
