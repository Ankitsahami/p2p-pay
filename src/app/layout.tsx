import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { AppProviders } from '@/providers/app-providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'P2P Pay — Pay Utility Bills with USDC on Base',
  description: 'Pay electricity, water, gas, broadband, FASTag, credit card bills, and more using USDC on Base. Secure, P2P on-chain escrow.',
};

import { initDb } from '@/lib/db';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize database tables on server-side startup/render
  initDb().catch((err) => console.error('[DB] Initialization failed:', err));

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} light`}>
      <body className="bg-[#F8F9FC] text-slate-900 min-h-screen font-sans antialiased overflow-x-hidden">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
