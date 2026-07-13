'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  ArrowLeftRight,
  TrendingUp,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, user, ready, isAuthenticated } = useAuth();

  const adminEmail = 'ankitsahani008@gmail.com';
  const isAdmin = user?.email === adminEmail;

  React.useEffect(() => {
    if (ready && (!isAuthenticated || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [ready, isAuthenticated, isAdmin, router]);

  const navItems = [
    { label: 'Overview', href: '/admin', icon: BarChart3 },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Transactions', href: '/admin/transactions', icon: ArrowLeftRight },
    { label: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
  ];

  const getHeaderTitle = () => {
    if (pathname === '/admin') return 'Admin Overview';
    if (pathname === '/admin/users') return 'User Management';
    if (pathname === '/admin/transactions') return 'Transaction Monitoring';
    if (pathname === '/admin/analytics') return 'Analytics & Revenue';
    return 'Admin Control Panel';
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex overflow-hidden text-slate-800">
      {/* Admin Sidebar */}
      <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 z-40 bg-white border-r border-slate-100 overflow-hidden select-none">
        <div className="h-20 flex items-center px-6 border-b border-slate-100">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              P2P
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">
              P2P Pay Admin
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all group relative',
                  isActive
                    ? 'text-red-500 bg-red-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="admin-nav-indicator"
                    className="absolute left-0 top-3 bottom-3 w-1 bg-red-500 rounded-r"
                  />
                )}
                <item.icon className={cn('w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105', isActive ? 'text-red-500' : 'text-slate-500 group-hover:text-slate-900')} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="h-px bg-slate-100 my-4" />

          <Link
            href="/dashboard"
            className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all group"
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105 text-slate-500 group-hover:text-slate-900" />
            <span>Dashboard</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:text-red-500 hover:bg-red-50 transition-all group cursor-pointer"
          >
            <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-105" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <div className="flex-1 flex flex-col md:pl-64 min-h-screen overflow-hidden pb-16 md:pb-0">
        <header className="h-20 px-6 md:px-8 border-b border-slate-100 bg-white/85 backdrop-blur-md flex items-center justify-between sticky top-0 z-30 select-none">
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-950">
            {getHeaderTitle()}
          </h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-red-500 bg-red-50 border border-red-100 rounded-full">
            Admin View
          </span>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6 md:px-8 md:py-8 scrollbar-hide">
          {children}
        </main>
      </div>
    </div>
  );
}
