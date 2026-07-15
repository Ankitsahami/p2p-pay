import {
  type WalletBalance,
  type Transaction,
  type Notification,
  type SavedBiller,
  type AdminMetrics,
  type AdminUser,
  type AnalyticsDataPoint,
  type CategoryAnalytics,
} from '@/types';

export const MOCK_WALLET_BALANCES: WalletBalance[] = [];
export const MOCK_TRANSACTIONS: Transaction[] = [];
export const MOCK_NOTIFICATIONS: Notification[] = [];
export const MOCK_SAVED_BILLERS: SavedBiller[] = [];
export const MOCK_ADMIN_METRICS: AdminMetrics = {
  totalUsers: 0,
  activeWallets: 0,
  totalTransactions: 0,
  totalVolume: 0,
  volumeCurrency: 'INR',
  successRate: 100,
  avgTransactionValue: 0,
  newUsersToday: 0,
  transactionsToday: 0,
  volumeToday: 0,
};
export const MOCK_ADMIN_USERS: AdminUser[] = [];
export const MOCK_ANALYTICS_DATA: AnalyticsDataPoint[] = [];
export const MOCK_CATEGORY_ANALYTICS: CategoryAnalytics[] = [];
