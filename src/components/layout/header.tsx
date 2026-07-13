'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, ChevronDown, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
}

export const Header = ({ title }: HeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);

  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const notifRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Simple placeholder notifications
  const mockNotifications = [
    { id: '1', title: 'Wallet Deployed', desc: 'Your smart contract wallet is active.', time: '10m ago' },
    { id: '2', title: 'Deposit Received', desc: 'Received 500 USDC on Sepolia.', time: '1h ago' },
  ];

  return (
    <header className="h-20 px-6 md:px-8 border-b border-slate-100 bg-white/85 backdrop-blur-md flex items-center justify-between sticky top-0 z-30 select-none text-slate-800">
      {/* Title */}
      <div>
        <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900">{title}</h1>
        {pathname === '/dashboard' && (
          <p className="text-xs text-slate-500 font-medium">Welcome back, {user?.name || 'User'}</p>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Network Badge */}
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-blue-500 bg-blue-50 border border-blue-100 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          Sepolia Testnet
        </span>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="w-10 h-10 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 transition-all flex items-center justify-center cursor-pointer relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500 border border-white" />
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 flex flex-col gap-3 z-50 text-slate-800">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">Recent Activity</span>
                <span className="text-[10px] text-blue-500 font-semibold cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto scrollbar-hide">
                {mockNotifications.map((n) => (
                  <div key={n.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all cursor-pointer">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-semibold text-slate-900">{n.title}</span>
                      <span className="text-[9px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User profile dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center font-bold text-white text-sm">
              {user?.name?.slice(0, 1).toUpperCase() || 'U'}
            </div>
            <span className="hidden sm:inline text-xs font-semibold text-slate-700 max-w-[100px] truncate">{user?.name || 'User'}</span>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden py-1 z-50 text-slate-800 animate-scale-in">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  router.push('/dashboard/settings');
                  setIsDropdownOpen(false);
                }}
                className="w-full px-4 py-2.5 text-xs text-left text-slate-600 hover:text-blue-500 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button
                onClick={logout}
                className="w-full px-4 py-2.5 text-xs text-left text-red-500 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
