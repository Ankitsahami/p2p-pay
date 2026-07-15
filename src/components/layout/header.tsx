'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, ChevronDown, LogOut, Settings, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useThemeStore } from '@/stores/theme-store';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
}

export const Header = ({ title }: HeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useThemeStore();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);

  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const notifRef = React.useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark';

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
    <header className={cn(
      'h-20 px-6 md:px-8 border-b flex items-center justify-between sticky top-0 z-30 select-none transition-colors duration-300',
      isDark
        ? 'border-white/[0.06] bg-black/80 backdrop-blur-xl text-white'
        : 'border-slate-100 bg-white/85 backdrop-blur-md text-slate-800'
    )}>
      {/* Title */}
      <div>
        <h1 className={cn(
          'text-lg md:text-xl font-bold tracking-tight',
          isDark ? 'text-white' : 'text-slate-900'
        )}>
          {title}
        </h1>
        {pathname === '/dashboard' && (
          <p className={cn('text-xs font-medium', isDark ? 'text-white/50' : 'text-slate-500')}>
            Welcome back, {user?.name || 'User'}
          </p>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Network Badge */}
        <span className={cn(
          'hidden sm:inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border',
          isDark
            ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
            : 'text-blue-500 bg-blue-50 border-blue-100'
        )}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          Sepolia Testnet
        </span>



        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={cn(
              'w-10 h-10 rounded-xl border transition-all flex items-center justify-center cursor-pointer relative',
              isDark
                ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
                : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800'
            )}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500 border border-current" />
          </button>

          {isNotifOpen && (
            <div className={cn(
              'absolute right-0 mt-3 w-80 rounded-2xl shadow-2xl p-4 flex flex-col gap-3 z-50 border',
              isDark
                ? 'bg-[#111] border-white/10 text-white'
                : 'bg-white border-slate-200 text-slate-800'
            )}>
              <div className={cn('flex items-center justify-between pb-2 border-b', isDark ? 'border-white/5' : 'border-slate-100')}>
                <span className={cn('text-xs font-bold', isDark ? 'text-white' : 'text-slate-900')}>Recent Activity</span>
                <span className="text-[10px] text-blue-500 font-semibold cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto scrollbar-hide">
                {mockNotifications.map((n) => (
                  <div key={n.id} className={cn(
                    'p-3 rounded-xl border cursor-pointer transition-all',
                    isDark ? 'bg-white/5 border-white/5 hover:border-white/10' : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                  )}>
                    <div className="flex justify-between items-start">
                      <span className={cn('text-xs font-semibold', isDark ? 'text-white' : 'text-slate-900')}>{n.title}</span>
                      <span className={cn('text-[9px]', isDark ? 'text-white/40' : 'text-slate-400')}>{n.time}</span>
                    </div>
                    <p className={cn('text-[11px] mt-1', isDark ? 'text-white/50' : 'text-slate-500')}>{n.desc}</p>
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
            className={cn(
              'flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border transition-all cursor-pointer',
              isDark
                ? 'border-white/10 bg-white/5 hover:bg-white/10'
                : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
            )}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center font-bold text-white text-sm">
              {user?.name?.slice(0, 1).toUpperCase() || 'U'}
            </div>
            <span className={cn('hidden sm:inline text-xs font-semibold max-w-[100px] truncate', isDark ? 'text-white/80' : 'text-slate-700')}>
              {user?.name || 'User'}
            </span>
            <ChevronDown className={cn('w-4 h-4', isDark ? 'text-white/40' : 'text-slate-500')} />
          </button>

          {isDropdownOpen && (
            <div className={cn(
              'absolute right-0 mt-3 w-56 rounded-2xl shadow-2xl overflow-hidden py-1 z-50 border',
              isDark ? 'bg-[#111] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
            )}>
              <div className={cn('px-4 py-3 border-b', isDark ? 'border-white/5' : 'border-slate-100')}>
                <p className={cn('text-xs font-semibold truncate', isDark ? 'text-white' : 'text-slate-900')}>{user?.name}</p>
                <p className={cn('text-[10px] truncate mt-0.5', isDark ? 'text-white/40' : 'text-slate-500')}>{user?.email}</p>
              </div>
              <button
                onClick={() => { router.push('/dashboard/settings'); setIsDropdownOpen(false); }}
                className={cn(
                  'w-full px-4 py-2.5 text-xs text-left flex items-center gap-2 cursor-pointer transition-colors',
                  isDark ? 'text-white/70 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-blue-500 hover:bg-slate-50'
                )}
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button
                onClick={logout}
                className="w-full px-4 py-2.5 text-xs text-left text-red-400 hover:bg-red-500/10 flex items-center gap-2 cursor-pointer transition-colors"
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
