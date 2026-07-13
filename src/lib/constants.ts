import { type ChainConfig, type Token } from '@/types';

// ============================================================
// Chain Configuration — Base Sepolia Testnet
// ============================================================

export const SEPOLIA_CHAIN_ID = 84532;

export const SEPOLIA_CHAIN: ChainConfig = {
  id: 84532,
  name: 'Base Sepolia Testnet',
  shortName: 'BASE_SEPOLIA',
  rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://sepolia.base.org',
  explorerUrl: 'https://sepolia.basescan.org',
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
};

// ============================================================
// Token Addresses on Base Sepolia
// ============================================================

export const USDC_ADDRESS = '0x4095fE4f1E636f11A95820BA2bB87F335Bd1040d'; // Custom P2P.me USDC on Base Sepolia
export const USDT_ADDRESS = '0xaA8E23Fb1079EA71e0a56F48a2AA51851D8433D0'; // Placeholder
export const DAI_ADDRESS = '0x3e622317f8C93f7328150cf4B8516Ba613D2e824'; // Placeholder
export const WETH_ADDRESS = '0x4200000000000000000000000000000000000006'; // Wrapped Ether on Base Sepolia

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
    chainId: SEPOLIA_CHAIN_ID,
    coingeckoId: 'usd-coin',
  },
  {
    address: WETH_ADDRESS,
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    icon: '/tokens/weth.svg',
    chainId: SEPOLIA_CHAIN_ID,
    coingeckoId: 'weth',
  },
];

export const DEFAULT_TOKEN = TOKENS[0]; // USDC

// ============================================================
// P2P.me Configuration
// ============================================================

export const P2P_CONFIG = {
  primaryChain: 'baseSepolia',
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
  name: 'P2P Pay',
  tagline: 'Pay Utility Bills with USDC. Seamlessly.',
  description: 'Pay your utility bills using USDC on Base Sepolia with on-chain security and instant settlements.',
  version: '1.0.0',
  defaultCurrency: 'INR' as const,
  defaultChainId: SEPOLIA_CHAIN_ID,
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
