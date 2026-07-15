import type { Metadata } from 'next';
import { Barlow, Instrument_Serif } from 'next/font/google';
import { AppProviders } from '@/providers/app-providers';
import './globals.css';

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-barlow',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'P2P-Pay — Pay Utility Bills with USDC on Base',
  description:
    'Pay electricity, water, gas, broadband, FASTag, credit card bills, and more using USDC on Base. Secured by on-chain P2P escrow — no banks, no spreads, instant settlement.',
  keywords: ['p2p pay', 'crypto bill payment', 'USDC', 'Base', 'blockchain', 'utility bills', 'decentralised payments'],
  authors: [{ name: 'P2P-Pay' }],
  openGraph: {
    title: 'P2P-Pay — Pay Utility Bills with USDC on Base',
    description: 'Decentralised bill payments powered by on-chain escrow on Base.',
    type: 'website',
    siteName: 'P2P-Pay',
  },
};

import { initDb } from '@/lib/db';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Initialize database tables on server-side startup/render
  initDb().catch((err) => console.error('[DB] Initialization failed:', err));

  return (
    <html lang="en" className={`${barlow.variable} ${instrumentSerif.variable} light`}>
      <body className="bg-[#F8F9FC] text-slate-900 min-h-screen font-sans antialiased overflow-x-hidden">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
