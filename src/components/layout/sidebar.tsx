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

interface SidebarProps {
  className?: string;
}

export const Sidebar = ({ className }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

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
        'hidden md:flex flex-col h-screen fixed left-0 top-0 z-40 bg-white border-r border-slate-100 overflow-hidden select-none text-slate-800',
        className
      )}
    >
      {/* Logo */}
      <div className="h-20 flex items-center px-6 justify-between border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center gap-3">
          {/* Brand Purple Logo matching P2P.me */}
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
            <Coins className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <span className="font-extrabold text-lg tracking-tight text-blue-500">
              P2P.ME
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
                isActive
                  ? 'text-blue-500 bg-blue-50'
                  : 'text-slate-600 hover:text-blue-500 hover:bg-slate-50'
              )}
            >
              <div className="flex items-center gap-3.5">
                <item.icon className={cn('w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105', isActive ? 'text-blue-500' : 'text-slate-500 group-hover:text-blue-500')} />
                {!isCollapsed && <span>{item.label}</span>}
              </div>
              {!isCollapsed && (
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
              )}
            </Link>
          );
        })}

        {/* Custom Wallet Token Banner (mimics the $P2P Token row in screenshot) */}
        {!isCollapsed && (
          <div className="pt-4">
            <a
              href="https://p2p.me"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 rounded-2xl bg-blue-50 border border-blue-100/50 hover:bg-blue-100/60 transition-all text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">P2P.me</h4>
                    <p className="text-[10px] text-slate-500">Send · Receive · Swap</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-blue-500">
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
                  ? 'text-red-500 bg-red-50'
                  : 'text-slate-500 hover:text-red-500 hover:bg-slate-50'
              )}
            >
              <BarChart3 className={cn('w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-105', pathname.startsWith('/admin') ? 'text-red-500' : 'text-slate-500 group-hover:text-red-500')} />
              <span>Admin Portal</span>
            </Link>
          </div>
        )}
      </nav>

      {/* Footer Profile or Collapse Action */}
      <div className="p-4 border-t border-slate-100 flex flex-col gap-4">
        {/* User profile card box matching screenshot */}
        {!isCollapsed && (
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white text-xs select-none">
                {user?.name?.slice(0, 1).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Logged in via</p>
                <p className="text-xs font-semibold text-slate-700 truncate max-w-[120px]">{user?.email || 'test@p2p.me'}</p>
              </div>
            </div>
            
            {/* coins.me mini brand */}
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-800 leading-none">coins</span>
              <span className="text-[10px] font-bold text-blue-500 leading-none">.me</span>
              <span className="text-[8px] text-slate-400 font-medium mt-0.5">Try now</span>
            </div>
          </div>
        )}

        {/* Socials & Sign Out Drawer */}
        <div className={cn("flex w-full px-2", isCollapsed ? "flex-col items-center gap-3" : "items-center justify-between")}>
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors" aria-label="X (formerly Twitter)">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors">
                <Send className="w-4 h-4" />
              </a>
              <span className="text-[10px] text-slate-400 font-bold ml-2">v3.2.3</span>
            </div>
          ) : null}

          <div className={cn("flex items-center", isCollapsed ? "flex-col gap-3 w-full" : "gap-2")}>
            <button
              onClick={handleLogout}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-8 h-8 rounded-lg border border-slate-100 hover:bg-slate-50 flex items-center justify-center cursor-pointer"
            >
              {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};
