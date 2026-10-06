import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import { useTheme } from '../../context/ThemeContext';
import { IconBell, IconBuilding, IconSun, IconMoon, IconMenu } from '../common/Icons';
import { NotificationDrawer } from '../common/NotificationDrawer';

export const Header = ({ openProfileModal, isSidebarOpen, setIsSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { notifications } = usePortal();
  const { isDark, toggleTheme } = useTheme();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  if (!user) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 lg:px-8 py-3 transition-colors shadow-xs">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Platform Branding */}
          <div className="flex items-center gap-3">
            {/* Sidebar Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen(prev => !prev)}
              className="p-2 text-slate-700 dark:text-slate-300 hover:text-[#7C3AED] dark:hover:text-purple-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition flex items-center justify-center"
              title={isSidebarOpen ? "Close / Collapse Sidebar" : "Open / Expand Sidebar"}
              aria-label="Toggle Navigation Sidebar"
            >
              <IconMenu className="w-5 h-5" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] via-[#844FC1] to-[#6D28D9] flex items-center justify-center text-white font-bold shadow-md shadow-[#7C3AED]/30 ring-2 ring-purple-100 dark:ring-purple-900/40">
              <IconBuilding className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-[#0F172A] dark:text-white font-outfit">BuildHub Pro</h1>
                <span className={`text-[10px] uppercase font-bold font-mono tracking-wider px-2.5 py-0.5 rounded-lg border ${
                  user.role === 'BUILDER'
                    ? 'bg-purple-50 dark:bg-[#7C3AED]/20 text-[#7C3AED] dark:text-purple-300 border-purple-200 dark:border-[#7C3AED]/40'
                    : 'bg-indigo-50 dark:bg-[#844FC1]/20 text-[#844FC1] dark:text-indigo-300 border-indigo-200 dark:border-[#844FC1]/40'
                }`}>
                  {user.role} WORKSPACE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Construction Material Direct Tech Hub</p>
            </div>
          </div>

          {/* Right Utilities: Theme Toggle, Notifications, User Profile & Logout */}
          <div className="flex items-center gap-2.5">
            
            {/* Theme Toggle Button (Light <-> Dark) */}
            <button
              onClick={toggleTheme}
              className="p-2.5 text-slate-700 dark:text-purple-300 hover:text-slate-900 dark:hover:text-purple-200 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold"
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Theme Mode`}
            >
              {isDark ? <IconSun className="w-4 h-4 text-purple-400" /> : <IconMoon className="w-4 h-4 text-slate-600" />}
              <span className="hidden sm:inline">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2.5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl transition"
              aria-label="Open notifications"
            >
              <IconBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#7C3AED] text-white font-extrabold text-[10px] flex items-center justify-center animate-pulse shadow-md shadow-[#7C3AED]/50">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Interactive Manageable Profile Capsule */}
            <div className="flex items-center gap-3 pl-2.5 border-l border-slate-200 dark:border-slate-800">
              <button
                onClick={openProfileModal}
                className="flex items-center gap-2.5 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-left group"
                title="Manage Profile Settings"
              >
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#844FC1] text-white font-bold text-xs flex items-center justify-center shadow-sm font-outfit uppercase group-hover:scale-105 transition`}>
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="hidden lg:block">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 font-outfit flex items-center gap-1 group-hover:text-[#7C3AED] dark:group-hover:text-purple-400 transition">
                    {user.name}
                    <span className="text-[10px] text-slate-400">⚙️</span>
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[170px]">{user.organization}</p>
                </div>
              </button>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition font-outfit"
                title="Sign out of workspace"
              >
                Sign Out
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Notifications Drawer */}
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
};
