// ============================================================
// User & Authentication
// ============================================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  walletAddress: string;
  kycStatus: KYCStatus;
  role: UserRole;
  currency: SupportedCurrency;
  createdAt: string;
  updatedAt: string;
}

export type KYCStatus = 'none' | 'pending' | 'verified' | 'rejected';
export type UserRole = 'user' | 'admin';
export type SupportedCurrency = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface UserPreferences {
  currency: SupportedCurrency;
  notifications: boolean;
  biometricAuth: boolean;
  theme: 'dark' | 'light';
}

// ============================================================
// Wallet & Tokens
// ============================================================

export interface WalletBalance {
  token: Token;
  balance: string;
  usdValue: number;
  fiatValue: number;
}

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  icon: string;
  chainId: number;
  coingeckoId?: string;
}

export interface ChainConfig {
  id: number;
  name: string;
  shortName: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface PortfolioAsset {
  token: Token;
  balance: string;
  usdValue: number;
  fiatValue: number;
  percentage: number;
  change24h: number;
}

// ============================================================
// Bill Payment
// ============================================================

export interface BillCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  gradient: string;
  description: string;
  providers: BillProvider[];
  consumerNumberLabel: string;
  consumerNumberPlaceholder: string;
  consumerNumberPattern?: string;
}

export interface BillProvider {
  id: string;
  name: string;
  logo: string;
  category: string;
  region?: string;
  upiId?: string;
}

export interface BillDetails {
  provider: BillProvider;
  consumerNumber: string;
  consumerName: string;
  amount: number;
  currency: SupportedCurrency;
  dueDate: string;
  billDate: string;
  billNumber: string;
  status: BillStatus;
  additionalInfo?: Record<string, string>;
}

export type BillStatus = 'unpaid' | 'partially_paid' | 'paid' | 'overdue';

export interface SavedBiller {
  id: string;
  category: string;
  provider: BillProvider;
  consumerNumber: string;
  consumerName: string;
  nickname?: string;
  lastPaidDate?: string;
  lastPaidAmount?: number;
}

// ============================================================
// Payment & P2P.me
// ============================================================

export interface PaymentQuote {
  fromToken: string;
  toFiat: SupportedCurrency;
  cryptoAmount: string;
  fiatAmount: number;
  exchangeRate: number;
  networkFee: string;
  platformFee: string;
  totalCrypto: string;
  expiresAt: string;
}

export interface PaymentOrder {
  orderId: string;
  type: 'buy' | 'sell';
  status: PaymentOrderStatus;
  cryptoAmount: string;
  fiatAmount: number;
  fiatCurrency: SupportedCurrency;
  token: string;
  network: string;
  txHash?: string;
  billDetails?: BillDetails;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export type PaymentOrderStatus =
  | 'pending'
  | 'approving'
  | 'approved'
  | 'placing_order'
  | 'order_placed'
  | 'waiting_settlement'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'expired'
  | 'disputed';

export type PaymentFlowStep =
  | 'idle'
  | 'fetching_bill'
  | 'bill_fetched'
  | 'getting_quote'
  | 'quote_ready'
  | 'confirming'
  | 'approving_usdc'
  | 'placing_order'
  | 'waiting_settlement'
  | 'completed'
  | 'failed';

// ============================================================
// Transactions
// ============================================================

export interface Transaction {
  id: string;
  type: TransactionType;
  category?: string;
  merchant?: string;
  description: string;
  fiatAmount: number;
  fiatCurrency: SupportedCurrency;
  cryptoAmount: string;
  token: string;
  network: string;
  status: TransactionStatus;
  txHash?: string;
  walletAddress: string;
  fromAddress?: string;
  toAddress?: string;
  receipt?: TransactionReceipt;
  timestamp: string;
  merchantAddress?: string;
  fee?: string;
  completedIn?: string;
}

export type TransactionType =
  | 'bill_payment'
  | 'deposit'
  | 'withdrawal'
  | 'send'
  | 'receive';

export type TransactionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface TransactionReceipt {
  receiptId: string;
  transactionId: string;
  txHash: string;
  billDetails?: BillDetails;
  cryptoAmount: string;
  fiatAmount: number;
  fiatCurrency: SupportedCurrency;
  networkFee: string;
  token: string;
  network: string;
  timestamp: string;
  status: TransactionStatus;
}

// ============================================================
// Notifications
// ============================================================

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  actionUrl?: string;
  icon?: string;
  metadata?: Record<string, unknown>;
}

export type NotificationType =
  | 'wallet_created'
  | 'deposit_received'
  | 'payment_initiated'
  | 'payment_completed'
  | 'payment_failed'
  | 'bill_paid'
  | 'withdrawal_completed'
  | 'system'
  | 'security';

// ============================================================
// Admin
// ============================================================

export interface AdminMetrics {
  totalUsers: number;
  activeWallets: number;
  totalTransactions: number;
  totalVolume: number;
  volumeCurrency: SupportedCurrency;
  successRate: number;
  avgTransactionValue: number;
  newUsersToday: number;
  transactionsToday: number;
  volumeToday: number;
}

export interface AdminUser extends User {
  transactionCount: number;
  totalVolume: number;
  lastActive: string;
  status: 'active' | 'suspended' | 'pending';
}

export interface AdminTransaction extends Transaction {
  userName: string;
  userEmail: string;
}

export interface AnalyticsDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface CategoryAnalytics {
  category: string;
  count: number;
  volume: number;
  percentage: number;
}

// ============================================================
// Currency
// ============================================================

export interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  name: string;
  locale: string;
  decimals: number;
}

export const CURRENCY_CONFIG: Record<SupportedCurrency, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN', decimals: 2 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US', decimals: 2 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'en-DE', decimals: 2 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB', decimals: 2 },
};

// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
