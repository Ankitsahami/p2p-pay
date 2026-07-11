import { type ChainConfig, type Token } from '@/types';

// ============================================================
// Chain Configuration — Base Only
// ============================================================

export const BASE_CHAIN_ID = 8453;

export const BASE_CHAIN: ChainConfig = {
  id: 8453,
  name: 'Base',
  shortName: 'BASE',
  rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org',
  explorerUrl: 'https://basescan.org',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
};

// ============================================================
// Token Addresses on Base
// ============================================================

export const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // USDC on Base
export const USDT_ADDRESS = '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2'; // USDT on Base
export const DAI_ADDRESS = '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb'; // DAI on Base
export const WETH_ADDRESS = '0x4200000000000000000000000000000000000006'; // WETH on Base

// ============================================================
// Supported Tokens
// ============================================================

export const TOKENS: Token[] = [
  {
    address: USDC_ADDRESS,
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    icon: '/tokens/usdc.svg',
    chainId: BASE_CHAIN_ID,
    coingeckoId: 'usd-coin',
  },
  {
    address: USDT_ADDRESS,
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    icon: '/tokens/usdt.svg',
    chainId: BASE_CHAIN_ID,
    coingeckoId: 'tether',
  },
  {
    address: DAI_ADDRESS,
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    icon: '/tokens/dai.svg',
    chainId: BASE_CHAIN_ID,
    coingeckoId: 'dai',
  },
  {
    address: WETH_ADDRESS,
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    icon: '/tokens/weth.svg',
    chainId: BASE_CHAIN_ID,
    coingeckoId: 'weth',
  },
];

export const DEFAULT_TOKEN = TOKENS[0]; // USDC

// ============================================================
// P2P.me Configuration
// ============================================================

export const P2P_CONFIG = {
  primaryChain: 'base',
  supportedFiatRails: ['UPI', 'PIX', 'QRIS', 'MercadoPago', 'PagoMovil'] as const,
  defaultFiatRail: 'UPI' as const,
  escrowTimeout: 30 * 60 * 1000, // 30 minutes
  maxOrderAmount: 50000, // USD equivalent
  minOrderAmount: 1, // USD equivalent
};

// ============================================================
// Exchange Rates (Mock — in production, fetch from P2P.me)
// ============================================================

export const MOCK_EXCHANGE_RATES: Record<string, number> = {
  'USDC/INR': 83.50,
  'USDC/USD': 1.00,
  'USDC/EUR': 0.92,
  'USDC/GBP': 0.79,
  'ETH/INR': 292250.00,
  'ETH/USD': 3500.00,
  'ETH/EUR': 3220.00,
  'ETH/GBP': 2765.00,
};

// ============================================================
// App Configuration
// ============================================================

export const APP_CONFIG = {
  name: 'CryptoBill',
  tagline: 'Pay Bills with Crypto. Seamlessly.',
  description: 'Pay your utility bills using cryptocurrency with on-chain security and instant settlements.',
  version: '1.0.0',
  defaultCurrency: 'INR' as const,
  defaultChainId: BASE_CHAIN_ID,
  maxRecentTransactions: 50,
  maxSavedBillers: 20,
  billFetchTimeout: 10000,
  paymentTimeout: 300000, // 5 minutes
  refreshInterval: 30000, // 30 seconds
};

// ============================================================
// Navigation Configuration
// ============================================================

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Pay Bills', href: '/dashboard/pay', icon: 'Receipt' },
  { label: 'Wallet', href: '/dashboard/wallet', icon: 'Wallet' },
  { label: 'History', href: '/dashboard/history', icon: 'Clock' },
  { label: 'Settings', href: '/dashboard/settings', icon: 'Settings' },
] as const;

export const ADMIN_NAV_ITEMS = [
  { label: 'Overview', href: '/admin', icon: 'BarChart3' },
  { label: 'Users', href: '/admin/users', icon: 'Users' },
  { label: 'Transactions', href: '/admin/transactions', icon: 'ArrowLeftRight' },
  { label: 'Analytics', href: '/admin/analytics', icon: 'TrendingUp' },
] as const;

// ============================================================
// Gas & Fee Estimates
// ============================================================

export const FEE_ESTIMATES = {
  usdcTransfer: '0.10', // USDC
  usdcApproval: '0.05', // USDC
  p2pOrderCreation: '0.50', // USDC
  totalEstimatedFee: '0.65', // USDC
  networkFee: '< $0.01', // Base L2 gas
};

// ============================================================
// ERC-20 ABI (minimal for balance + approve)
// ============================================================

export const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    name: 'symbol',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
] as const;
