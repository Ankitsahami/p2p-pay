'use client';

import * as React from 'react';
import { BookOpen, Shield, HelpCircle, Cpu, FileText, Zap, CheckCircle, Smartphone, Key } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DocsPage() {
  const [activeTab, setActiveTab] = React.useState('intro');

  const tabs = [
    { id: 'intro', label: '1. Introduction', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'problem', label: '2. Problem & Solution', icon: <HelpCircle className="w-3.5 h-3.5" /> },
    { id: 'sdk', label: '3. P2P.me SDK Integration', icon: <Cpu className="w-3.5 h-3.5" /> },
    { id: 'tutorial', label: '4. User Flow Guide', icon: <FileText className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 select-none py-4 text-slate-700">
      {/* Header section - Flat and clean */}
      <div className="flex flex-col gap-2 pb-6 border-b border-slate-100">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Project Documentation</h1>
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">P2P-Pay Platform Specifications</p>
      </div>

      {/* Flat Tab Menu - No boxed tabs, simple flat text links with active line */}
      <div className="flex gap-6 border-b border-slate-100 pb-px overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 pb-3 text-xs font-bold transition-all relative cursor-pointer select-none",
                isActive
                  ? "text-blue-600"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Contents - Completely Flat, Cardless, and Box-Free */}
      <div className="flex flex-col gap-6 leading-relaxed">
        {activeTab === 'intro' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-black text-slate-950 flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-blue-500" />
                About P2P-Pay
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                P2P-Pay is a decentralized fintech middleware allowing users to settle utility bill payments—including electricity, water, internet, and mobile recharges—using digital stablecoins (USDC) held in their smart account wallets.
              </p>
              <p className="text-xs text-slate-600 leading-relaxed font-light">
                By combining account abstraction, decentralized peer-to-peer (P2P) escrows, and automated fiat settlement processors, P2P-Pay bridges the gap between digital assets and real-world expenses. It eliminates the friction of traditional fiat off-ramps and centralized exchanges.
              </p>
            </div>

            {/* Flat Row of Features - No cards/boxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
              <div className="flex flex-col gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 font-bold text-xs">
                  01
                </div>
                <h3 className="text-xs font-black text-slate-900 uppercase">Decentralized Escrow</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed font-light">
                  Stablecoins remain locked on-chain within smart contracts until bill clearance is confirmed off-chain, ensuring secure transactions.
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 font-bold text-xs">
                  02
                </div>
                <h3 className="text-xs font-black text-slate-900 uppercase">Account Abstraction</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed font-light">
                  Privy-based social sign-in generates a gasless smart account (ERC-4337) automatically, removing recovery phrase requirements.
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 font-bold text-xs">
                  03
                </div>
                <h3 className="text-xs font-black text-slate-900 uppercase">Instant Settlements</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed font-light">
                  Off-chain payment processors push fiat directly to utility operators in seconds, completing the payment instantly.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'problem' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-black text-slate-955 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-500" />
                The Core Problem &amp; Solution
              </h2>
              <p className="text-xs text-slate-500">Why direct P2P settlement is necessary for real-world crypto spending.</p>
            </div>

            {/* Flat Text Columns - No cards/boxes */}
            <div className="flex flex-col gap-8 pt-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest">// The Off-Ramping Friction</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-light">
                  Traditional web3 spending requires off-ramping. Users must transfer funds to centralized exchanges, wait for trading orders to execute, accept high conversion spreads, incur transfer fees, and undergo intrusive KYC checks simply to settle monthly expenses.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-widest">// Direct Escrow Clearing</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-light">
                  P2P-Pay streamlines this process. Users deposit USDC directly into an on-chain escrow contract. A matched peer merchant settles the fiat payment with the utility provider via instant banking rails (such as UPI) and receives the locked USDC trustlessly, minimizing friction.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sdk' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-black text-slate-950 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-500" />
                P2P.me SDK Integration
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed font-light">
                P2P-Pay utilizes the <strong>@p2pdotme/sdk</strong> to manage order placement, peer matching, cryptographic signatures, and contract updates. The SDK interfaces directly with the diamond contract deployed on Base Sepolia.
              </p>
            </div>

            <div className="flex flex-col gap-4 mt-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">// Core SDK Integration Snippet</h3>
              
              {/* Flat Code snippet - No background card card styles */}
              <div className="py-4 px-2 overflow-x-auto text-[11px] font-mono text-slate-700 leading-relaxed border-l-2 border-blue-500 pl-4 bg-slate-50/50 rounded-xl">
                <span className="text-slate-400">// Initialize client and execute UPI escrow order</span><br/>
                <span className="text-blue-600">const</span> orders = <span className="text-blue-600">createOrders</span>(&#123; publicClient, diamondAddress, usdcAddress &#125;);<br/>
                <span className="text-blue-600">const</span> result = <span className="text-blue-600">await</span> orders.setSellOrderUpi.<span className="text-blue-600">execute</span>(&#123;<br/>
                &nbsp;&nbsp;walletClient: smartWalletClient,<br/>
                &nbsp;&nbsp;orderId: BigInt(activeOrderId),<br/>
                &nbsp;&nbsp;paymentAddress: <span className="text-emerald-600">&apos;merchant@upi&apos;</span>,<br/>
                &nbsp;&nbsp;merchantPublicKey: key,<br/>
                &nbsp;&nbsp;updatedAmount: amount,<br/>
                &nbsp;&nbsp;waitForReceipt: <span className="text-blue-600">true</span><br/>
                &#125;);
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <h3 className="text-xs font-bold text-slate-950 uppercase">// Key SDK Capabilities</h3>
              <ul className="text-xs text-slate-600 list-disc list-inside flex flex-col gap-1.5 font-light">
                <li>Locks digital assets securely within the Base diamond contract.</li>
                <li>Validates cryptographic signatures to confirm off-chain UPI transaction logs.</li>
                <li>Leverages Subgraph indexing to track state changes and merchant availability.</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'tutorial' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-black text-slate-950 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                User Flow Guide
              </h2>
              <p className="text-xs text-slate-500">A step-by-step walkthrough of paying a utility bill using USDC.</p>
            </div>

            {/* Flat SVG Flowchart - Strictly circles and capsules, absolutely NO boxes */}
            <div className="w-full flex justify-center py-6 border-t border-b border-slate-100">
              <svg width="680" height="120" viewBox="0 0 680 120" className="min-w-[600px]">
                {/* Step 1 */}
                <g transform="translate(10, 20)">
                  <rect x="0" y="0" width="120" height="50" rx="25" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1.5" />
                  <text x="60" y="24" textAnchor="middle" fill="#1D4ED8" fontSize="10" fontWeight="bold">1. INPUT DATA</text>
                  <text x="60" y="38" textAnchor="middle" fill="#3B82F6" fontSize="8">Select Biller &amp; ID</text>
                </g>

                {/* Arrow 1 */}
                <path d="M 140 45 L 180 45" fill="none" stroke="#E2E8F0" strokeWidth="1.5" markerEnd="url(#arrow-light)" />

                {/* Step 2 */}
                <g transform="translate(190, 20)">
                  <rect x="0" y="0" width="120" height="50" rx="25" fill="#FAF5FF" stroke="#A855F7" strokeWidth="1.5" />
                  <text x="60" y="24" textAnchor="middle" fill="#6B21A8" fontSize="10" fontWeight="bold">2. RATE QUOTE</text>
                  <text x="60" y="38" textAnchor="middle" fill="#A855F7" fontSize="8">Exchange Rate Locked</text>
                </g>

                {/* Arrow 2 */}
                <path d="M 320 45 L 360 45" fill="none" stroke="#E2E8F0" strokeWidth="1.5" markerEnd="url(#arrow-light)" />

                {/* Step 3 */}
                <g transform="translate(370, 20)">
                  <rect x="0" y="0" width="120" height="50" rx="25" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="1.5" />
                  <text x="60" y="24" textAnchor="middle" fill="#B45309" fontSize="10" fontWeight="bold">3. LOCK USDC</text>
                  <text x="60" y="38" textAnchor="middle" fill="#F59E0B" fontSize="8">USDC in Escrow</text>
                </g>

                {/* Arrow 3 */}
                <path d="M 500 45 L 540 45" fill="none" stroke="#E2E8F0" strokeWidth="1.5" markerEnd="url(#arrow-light)" />

                {/* Step 4 */}
                <g transform="translate(550, 20)">
                  <rect x="0" y="0" width="120" height="50" rx="25" fill="#ECFDF5" stroke="#10B981" strokeWidth="1.5" />
                  <text x="60" y="24" textAnchor="middle" fill="#047857" fontSize="10" fontWeight="bold">4. CLEARING</text>
                  <text x="60" y="38" textAnchor="middle" fill="#10B981" fontSize="8">UPI Paid &amp; Settled</text>
                </g>

                <defs>
                  <marker id="arrow-light" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#CBD5E1" />
                  </marker>
                </defs>
              </svg>
            </div>

            <div className="flex flex-col gap-4 font-light text-xs text-slate-600 leading-relaxed">
              <p>
                <strong>01. Select Biller</strong><br/>
                Go to the bill payment tab, choose the utility type (broadband, electricity, water, etc.), choose your distributor and input your connection ID.
              </p>
              <p>
                <strong>02. Fetch Dues &amp; Quote</strong><br/>
                The system fetches the due amount off-chain and locks a USDC-to-fiat quote.
              </p>
              <p>
                <strong>03. Confirm Escrow Lock</strong><br/>
                Approve and execute the transfer to deposit your USDC into the diamond contract.
              </p>
              <p>
                <strong>04. Payment Verification</strong><br/>
                The merchant settles the bill in local currency. The system confirms the transaction off-chain, releases the USDC, and registers your payment receipt.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
