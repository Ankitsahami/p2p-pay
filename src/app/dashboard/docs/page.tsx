'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { BookOpen, Shield, HelpCircle, Cpu, FileText, ArrowRight, Zap, CheckCircle, Smartphone, Key } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto flex flex-col gap-6 select-none animate-fade-in text-slate-800">
      {/* Header section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Project Documentation</h1>
        <p className="text-xs text-slate-500 font-medium">Understand the architecture, developer integration, and user workflow of P2P-Pay.</p>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="max-w-full" />

      {/* Tab Contents */}
      <div className="mt-2">
        {activeTab === 'intro' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <Card className="p-6 flex flex-col gap-4">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                About P2P-Pay
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>P2P-Pay</strong> is a decentralized fintech middleware that allows users to settle real-world utility bills (electricity, water, internet, recharges) directly using stablecoins (USDC) from their smart contract wallet. 
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                By combining account abstraction, decentralized peer-to-peer (P2P) on-chain escrow pools, and automated off-chain banking payment processors (like UPI), P2P-Pay bridges the gap between digital assets and everyday expenses without relying on traditional centralized exchanges or fiat off-ramps.
              </p>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-5 flex flex-col gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">Decentralized Escrow</h3>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  USDC remains locked safely in smart contracts on-chain until the bill payment is confirmed off-chain by the provider.
                </p>
              </Card>

              <Card className="p-5 flex flex-col gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                  <Key className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">Account Abstraction</h3>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Users sign in using social logins (Google) powered by Privy, creating a seamless, gasless smart account (ERC-4337).
                </p>
              </Card>

              <Card className="p-5 flex flex-col gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">Instant Clearing</h3>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Off-chain payment processors settle payments directly to utility providers in local fiat currency in seconds.
                </p>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'problem' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <Card className="p-6 flex flex-col gap-4">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-500" />
                The Core Problem &amp; Solution
              </h2>
              
              <div className="flex flex-col gap-4 mt-2">
                <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl flex flex-col gap-2">
                  <h3 className="text-xs font-bold text-red-700 uppercase tracking-wider">The Problem: Traditional Off-Ramping Friction</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Off-ramping crypto to spend it on daily utilities is a painful process:
                  </p>
                  <ul className="text-[11px] text-slate-600 list-disc list-inside flex flex-col gap-1 mt-1 pl-1">
                    <li>Requires sending funds to centralized exchanges (CEXs) and waiting for verification.</li>
                    <li>Incurs high spreads, trading fees, and network transfer fees.</li>
                    <li>Sells assets at sub-optimal exchange rates.</li>
                    <li>Requires users to link bank accounts, raising privacy issues and slow transaction processing times.</li>
                  </ul>
                </div>

                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex flex-col gap-2">
                  <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">The Solution: Direct P2P Escrow Clearing</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    P2P-Pay bypasses CEXs and traditional banks completely:
                  </p>
                  <ul className="text-[11px] text-slate-600 list-disc list-inside flex flex-col gap-1 mt-1 pl-1">
                    <li>The user locks equivalent USDC in an on-chain escrow smart contract.</li>
                    <li>A verified merchant bot picks up the request and fulfills the fiat payment (e.g. ₹INR via UPI) directly to the utility provider.</li>
                    <li>Once the payment is settled, the merchant claims the USDC from the escrow contract.</li>
                    <li>User gets their bill paid instantly directly using digital assets, and merchants earn yield.</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'sdk' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <Card className="p-6 flex flex-col gap-4">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-500" />
                Integration with P2P.me SDK
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                P2P-Pay utilizes the <strong>@p2pdotme/sdk</strong> to orchestrate peer-to-peer asset locks, merchant matching, and cryptographic UPI signature generation. The SDK interfaces directly with the P2P.me Diamond Contract deployed on Base Sepolia.
              </p>

              <h3 className="text-xs font-extrabold text-slate-800 mt-2">Core SDK Workflow &amp; Code Patterns</h3>
              
              <div className="flex flex-col gap-3 mt-1">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 font-mono text-[10px] text-slate-700 overflow-x-auto leading-relaxed">
                  <span className="text-slate-400">// 1. Import the creation module from SDK</span><br/>
                  <span className="text-blue-600">import</span> &#123; createOrders &#125; <span className="text-blue-600">from</span> <span className="text-emerald-600">&apos;@p2pdotme/sdk/orders&apos;</span>;<br/><br/>

                  <span className="text-slate-400">// 2. Initialize the order service instance</span><br/>
                  <span className="text-blue-600">const</span> orders = <span className="text-blue-600">createOrders</span>(&#123;<br/>
                  &nbsp;&nbsp;publicClient: chainPublicClient,<br/>
                  &nbsp;&nbsp;diamondAddress: <span className="text-emerald-600">&apos;0xeb0BB8E3c014D915D9B2df03aBB130a1Fb44beb9&apos;</span>,<br/>
                  &nbsp;&nbsp;usdcAddress: <span className="text-emerald-600">&apos;0x036CbD53842c5426634e7929541eC2318f3dCF7e&apos;</span>,<br/>
                  &nbsp;&nbsp;subgraphUrl: <span className="text-emerald-600">&apos;https://api.studio.thegraph.com/...&apos;</span><br/>
                  &#125;);<br/><br/>

                  <span className="text-slate-400">// 3. Execute the peer escrow UPI lock transfer</span><br/>
                  <span className="text-blue-600">const</span> result = <span className="text-blue-600">await</span> orders.setSellOrderUpi.<span className="text-blue-600">execute</span>(&#123;<br/>
                  &nbsp;&nbsp;walletClient: smartWalletClient,<br/>
                  &nbsp;&nbsp;orderId: BigInt(activeOrderId),<br/>
                  &nbsp;&nbsp;paymentAddress: <span className="text-emerald-600">&apos;provider@upi&apos;</span>,<br/>
                  &nbsp;&nbsp;merchantPublicKey: merchantPublicKey,<br/>
                  &nbsp;&nbsp;updatedAmount: merchantClaimAmount,<br/>
                  &nbsp;&nbsp;waitForReceipt: <span className="text-blue-600">true</span><br/>
                  &#125;);
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <h4 className="text-xs font-bold text-slate-800">Why `@p2pdotme/sdk` is Essential:</h4>
                  <ul className="text-[11px] text-slate-600 list-disc list-inside flex flex-col gap-1.5 pl-1 leading-relaxed">
                    <li><strong>Cryptographic Safety:</strong> Formulates cryptographic hashes of merchant details to prevent frontrunning.</li>
                    <li><strong>On-chain Verification:</strong> Allows users to query the exact status of the escrow directly from diamond facets.</li>
                    <li><strong>Subscribing to Events:</strong> Emits updates whenever a merchant accepts or completes order settlements.</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'tutorial' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* SVG Flow diagram - Capsule & Circle based, no square boxes */}
            <Card className="p-6 flex flex-col gap-4 items-center">
              <h2 className="text-base font-extrabold text-slate-900 w-full text-left">
                Step-by-Step Payment Flow
              </h2>
              
              <div className="w-full flex justify-center py-4 bg-slate-50 border border-slate-100 rounded-2xl overflow-x-auto">
                <svg width="680" height="120" viewBox="0 0 680 120" className="min-w-[600px]">
                  {/* Step 1: User Input */}
                  <g transform="translate(10, 20)">
                    <rect x="0" y="0" width="120" height="50" rx="25" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="2" />
                    <text x="60" y="22" textAnchor="middle" fill="#0369A1" fontSize="10" fontWeight="bold">1. USER INPUT</text>
                    <text x="60" y="37" textAnchor="middle" fill="#0284C7" fontSize="8">Select Biller &amp; ID</text>
                  </g>

                  {/* Connect arrow 1 */}
                  <path d="M 140 45 L 180 45" fill="none" stroke="#CBD5E1" strokeWidth="2" markerEnd="url(#arrow)" />

                  {/* Step 2: Quote */}
                  <g transform="translate(190, 20)">
                    <rect x="0" y="0" width="120" height="50" rx="25" fill="#F3E8FF" stroke="#C084FC" strokeWidth="2" />
                    <text x="60" y="22" textAnchor="middle" fill="#6B21A8" fontSize="10" fontWeight="bold">2. FETCH QUOTE</text>
                    <text x="60" y="37" textAnchor="middle" fill="#8B5CF6" fontSize="8">Get USDC Exchange</text>
                  </g>

                  {/* Connect arrow 2 */}
                  <path d="M 320 45 L 360 45" fill="none" stroke="#CBD5E1" strokeWidth="2" markerEnd="url(#arrow)" />

                  {/* Step 3: Escrow */}
                  <g transform="translate(370, 20)">
                    <rect x="0" y="0" width="120" height="50" rx="25" fill="#FEF3C7" stroke="#FCD34D" strokeWidth="2" />
                    <text x="60" y="22" textAnchor="middle" fill="#92400E" fontSize="10" fontWeight="bold">3. LOCK ESCROW</text>
                    <text x="60" y="37" textAnchor="middle" fill="#D97706" fontSize="8">Lock USDC on Base</text>
                  </g>

                  {/* Connect arrow 3 */}
                  <path d="M 500 45 L 540 45" fill="none" stroke="#CBD5E1" strokeWidth="2" markerEnd="url(#arrow)" />

                  {/* Step 4: Complete */}
                  <g transform="translate(550, 20)">
                    <rect x="0" y="0" width="120" height="50" rx="25" fill="#D1FAE5" stroke="#34D399" strokeWidth="2" />
                    <text x="60" y="22" textAnchor="middle" fill="#065F46" fontSize="10" fontWeight="bold">4. SETTLEMENT</text>
                    <text x="60" y="37" textAnchor="middle" fill="#059669" fontSize="8">UPI Paid &amp; receipt</text>
                  </g>

                  {/* Arrow marker definition */}
                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#94A3B8" />
                    </marker>
                  </defs>
                </svg>
              </div>
            </Card>

            <div className="flex flex-col gap-4">
              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  1
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-xs font-bold text-slate-900">Choose Utility Biller Category</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Navigate to <strong>Pay Bills</strong> in the sidebar. Select your category (e.g., electricity, mobile recharge), then choose your local distributor and input your consumer/account number.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-xs font-bold text-slate-900">Review Exchange Quote</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    The platform automatically fetches your outstanding bills off-chain and presents an escrow quote showing the amount of USDC needed for direct P2P lock.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  3
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-xs font-bold text-slate-900">Authorize Escrow Lock</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Confirm and sign the lock request in your smart wallet. This moves your USDC safely into the P2P escrow contract. The system connects you to Goofy Faucet merchant automatically.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  4
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-xs font-bold text-slate-900">Receive Receipt</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    The merchant transfers fiat directly to the biller. Once confirmed, the USDC is released to the merchant on-chain, and you receive your cryptographically secured billing receipt!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
