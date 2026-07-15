'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { MobileNav } from '@/components/layout/mobile-nav';
import { BottomActionsBar } from '@/components/layout/bottom-actions-bar';
import { useAuth } from '@/hooks/use-auth';
import { useWallet } from '@/hooks/use-wallet';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, walletAddress, ready } = useAuth();
  const { fetchBalances } = useWallet();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (ready && !isAuthenticated) {
      router.push('/');
    }
  }, [ready, isAuthenticated, router]);

  // Clean up dark mode from landing page
  React.useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  // Fetch balances when wallet address is available
  React.useEffect(() => {
    if (walletAddress) {
      fetchBalances(walletAddress);
    }
  }, [walletAddress, fetchBalances]);

  // Format header title based on current pathname
  const getHeaderTitle = () => {
    if (pathname === '/dashboard') return 'Fintech Dashboard';
    if (pathname.startsWith('/dashboard/pay')) return 'Pay Bills';
    if (pathname.startsWith('/dashboard/wallet')) return 'My Wallet';
    if (pathname.startsWith('/dashboard/history')) return 'Transaction History';
    if (pathname.startsWith('/dashboard/settings')) return 'Preferences';
    return 'Dashboard';
  };

  if (!ready || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] dark:bg-black flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] dark:bg-black flex overflow-hidden transition-colors duration-300">
      {/* Sidebar for Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-h-screen overflow-hidden pb-32">
        <Header title={getHeaderTitle()} />
        <main className="flex-1 overflow-y-auto px-6 py-6 md:px-8 md:py-8 scrollbar-hide">
          {children}
        </main>
      </div>

      {/* Sticky Bottom Actions Bar */}
      <BottomActionsBar />

      {/* Mobile Navigation bar */}
      <MobileNav />
    </div>
  );
}
