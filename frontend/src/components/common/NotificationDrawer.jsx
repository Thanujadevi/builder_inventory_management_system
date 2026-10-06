import React from 'react';
import { usePortal } from '../../context/PortalContext';
import { IconBell, IconX, IconCheckCircle, IconTruck, IconFileText, IconAlertTriangle } from './Icons';

export const NotificationDrawer = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, clearAllNotifications } = usePortal();

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotifIcon = (type) => {
    switch (type) {
      case 'dispatch':
        return <IconTruck className="w-5 h-5 text-purple-600" />;
      case 'quote':
        return <IconFileText className="w-5 h-5 text-amber-600" />;
      case 'po':
        return <IconCheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'rfq':
        return <IconAlertTriangle className="w-5 h-5 text-blue-600" />;
      default:
        return <IconBell className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-950/60 rounded-lg text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
              <IconBell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white font-outfit">Portal Notifications</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{unreadCount} unread alert{unreadCount === 1 ? '' : 's'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-amber-700 dark:hover:text-amber-400 px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition font-medium"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition"
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500">
              <IconBell className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No notifications right now</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Actions on RFQs, Quotes, POs and Deliveries will trigger alerts here.</p>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex gap-3 ${
                  n.read
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400'
                    : 'bg-white dark:bg-slate-800 border-amber-300 dark:border-amber-500/50 text-slate-900 dark:text-white shadow-sm ring-1 ring-amber-400/30'
                }`}
              >
                <div className="mt-0.5 p-2 rounded-lg bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 h-fit">
                  {getNotifIcon(n.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white font-outfit">{n.title}</h4>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono whitespace-nowrap">{n.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{n.message}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 font-mono border border-slate-200 dark:border-slate-600">
                      Target: {n.roleTarget}
                    </span>
                    {!n.read && (
                      <span className="text-amber-700 dark:text-amber-400 font-bold hover:underline">Mark read →</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-center text-xs text-slate-500 dark:text-slate-400">
          Real-time Construction Direct Procurement Feed
        </div>
      </div>
    </div>
  );
};
