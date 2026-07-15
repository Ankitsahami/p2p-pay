'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Receipt,
  Wallet as WalletIcon,
  Clock,
  Settings as SettingsIcon,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  LogOut,
  ArrowRight,
  Send,
  HelpCircle,
  Coins
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useThemeStore } from '@/stores/theme-store';

interface SidebarProps {
  className?: string;
}

export const Sidebar = ({ className }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const { theme } = useThemeStore();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const isDark = theme === 'dark';

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Pay Bills', href: '/dashboard/pay', icon: Receipt },
    { label: 'Transactions', href: '/dashboard/history', icon: Clock },
    { label: 'Help & Support', href: '/dashboard/support', icon: HelpCircle },
    { label: 'Settings', href: '/dashboard/settings', icon: SettingsIcon },
  ];

  const isAdmin = user?.email ? ['ankitsahami008@gmail.com', 'admin@cryptobill.com', 'admin@p2p.me'].includes(user.email.toLowerCase()) : false;

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        'hidden md:flex flex-col h-screen fixed left-0 top-0 z-40 overflow-hidden select-none transition-colors duration-300',
        isDark
          ? 'bg-black border-r border-white/[0.06] text-white'
          : 'bg-white border-r border-slate-100 text-slate-800',
        className
      )}
    >
      {/* Logo */}
      <div className={cn('h-20 flex items-center px-6 justify-between border-b', isDark ? 'border-white/[0.06]' : 'border-slate-100')}>
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
            <Coins className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <span className={cn('font-extrabold text-lg tracking-tight', isDark ? 'text-white' : 'text-blue-500')}>
              P2P-Pay
            </span>
          )}
        </Link>
      </div>

      {/* Nav Link Items */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all group relative',
                isDark
                  ? isActive
                    ? 'text-white bg-white/10 liquid-glass'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                  : isActive
                    ? 'text-blue-500 bg-blue-50'
                    : 'text-slate-600 hover:text-blue-500 hover:bg-slate-50'
              )}
            >
              <div className="flex items-center gap-3.5">
                <item.icon className={cn(
                  'w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105',
                  isDark
                    ? isActive ? 'text-white' : 'text-white/50 group-hover:text-white'
                    : isActive ? 'text-blue-500' : 'text-slate-500 group-hover:text-blue-500'
                )} />
                {!isCollapsed && <span>{item.label}</span>}
              </div>
              {!isCollapsed && (
                <ArrowRight className={cn(
                  'w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity',
                  isDark ? 'text-white' : 'text-blue-500'
                )} />
              )}
            </Link>
          );
        })}

        {/* P2P Banner */}
        {!isCollapsed && (
          <div className="pt-4">
            <a
              href="https://p2p.me"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'block p-4 rounded-2xl border transition-all text-left',
                isDark
                  ? 'bg-white/5 border-white/[0.06] hover:bg-white/10'
                  : 'bg-blue-50 border-blue-100/50 hover:bg-blue-100/60'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className={cn('text-xs font-bold', isDark ? 'text-white' : 'text-slate-800')}>P2P-Pay</h4>
                    <p className={cn('text-[10px]', isDark ? 'text-white/40' : 'text-slate-500')}>Send · Receive · Swap</p>
                  </div>
                </div>
                <div className={cn('flex items-center gap-1 text-xs font-bold', isDark ? 'text-white/60' : 'text-blue-500')}>
                  0 <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </a>
          </div>
        )}

        {isAdmin && !isCollapsed && (
          <div className="pt-2">
            <Link
              href="/admin"
              className={cn(
                'flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all group relative',
                pathname.startsWith('/admin')
                  ? 'text-red-400 bg-red-500/10'
                  : isDark
                    ? 'text-white/40 hover:text-red-400 hover:bg-red-500/10'
                    : 'text-slate-500 hover:text-red-500 hover:bg-slate-50'
              )}
            >
              <BarChart3 className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-105" />
              <span>Admin Portal</span>
            </Link>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className={cn('p-4 border-t flex flex-col gap-4', isDark ? 'border-white/[0.06]' : 'border-slate-100')}>
        {!isCollapsed && (
          <div className={cn(
            'p-3 rounded-2xl border flex items-center justify-between',
            isDark ? 'bg-white/5 border-white/[0.06]' : 'bg-slate-50 border-slate-100'
          )}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center font-bold text-white text-xs select-none">
                {user?.name?.slice(0, 1).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className={cn('text-[10px] font-bold uppercase tracking-wider', isDark ? 'text-white/40' : 'text-slate-400')}>Logged in via</p>
                <p className={cn('text-xs font-semibold truncate max-w-[120px]', isDark ? 'text-white/80' : 'text-slate-700')}>
                  {user?.email || 'test@p2p.me'}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className={cn('text-[10px] font-bold leading-none', isDark ? 'text-white/80' : 'text-slate-800')}>p2p</span>
              <span className="text-[10px] font-bold text-blue-500 leading-none">-pay</span>
              <span className={cn('text-[8px] font-medium mt-0.5', isDark ? 'text-white/30' : 'text-slate-400')}>v3.2.3</span>
            </div>
          </div>
        )}

        <div className={cn('flex w-full px-2', isCollapsed ? 'flex-col items-center gap-3' : 'items-center justify-between')}>
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <a href="#" className={cn('transition-colors', isDark ? 'text-white/30 hover:text-white/70' : 'text-slate-400 hover:text-slate-600')} aria-label="X (Twitter)">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className={cn('transition-colors', isDark ? 'text-white/30 hover:text-white/70' : 'text-slate-400 hover:text-slate-600')}>
                <Send className="w-4 h-4" />
              </a>
            </div>
          ) : null}

          <div className={cn('flex items-center', isCollapsed ? 'flex-col gap-3 w-full' : 'gap-2')}>
            <button
              onClick={handleLogout}
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer',
                isDark ? 'text-white/40 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
              )}
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                'w-8 h-8 rounded-lg border flex items-center justify-center cursor-pointer transition-colors',
                isDark ? 'border-white/10 hover:bg-white/5 text-white/50' : 'border-slate-100 hover:bg-slate-50 text-slate-600'
              )}
            >
              {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};
