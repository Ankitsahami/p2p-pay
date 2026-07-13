import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CURRENCY_CONFIG, type SupportedCurrency } from '@/types';

/**
 * Merge Tailwind CSS classes with proper conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a fiat currency amount with proper locale and symbol
 */
export function formatCurrency(
  amount: number,
  currency: SupportedCurrency = 'INR'
): string {
  const config = CURRENCY_CONFIG[currency];
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  }).format(amount);
}

/**
 * Format a crypto amount with proper decimals
 */
export function formatCrypto(amount: string | number, decimals: number = 6): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0.00';
  
  if (num === 0) return '0.00';
  if (num < 0.000001) return '< 0.000001';
  
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  });
}

/**
 * Truncate an Ethereum address for display
 */
export function truncateAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return date.toLocaleDateString();
}

/**
 * Format a date for display
 */
export function formatDate(dateString: string, format: 'short' | 'long' | 'datetime' = 'short'): string {
  const date = new Date(dateString);
  switch (format) {
    case 'short':
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    case 'long':
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    case 'datetime':
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    default:
      return date.toLocaleDateString();
  }
}

/**
 * Generate a unique receipt/transaction ID
 */
export function generateId(prefix: string = 'TXN'): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Get block explorer URL for a transaction hash
 */
export function getExplorerUrl(txHash: string, type: 'tx' | 'address' = 'tx'): string {
  return `https://sepolia.basescan.org/${type}/${txHash}`;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
}

/**
 * Calculate crypto equivalent for a fiat amount
 */
export function calculateCryptoAmount(
  fiatAmount: number,
  exchangeRate: number,
  networkFee: number = 0.5 // USDC
): { cryptoAmount: string; networkFee: string; totalCrypto: string } {
  const crypto = fiatAmount / exchangeRate;
  const total = crypto + networkFee;
  return {
    cryptoAmount: crypto.toFixed(6),
    networkFee: networkFee.toFixed(6),
    totalCrypto: total.toFixed(6),
  };
}

/**
 * Validate an Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Delay utility for simulating async operations
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get transaction status color classes
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    completed: 'text-emerald-400 bg-emerald-400/10',
    pending: 'text-amber-400 bg-amber-400/10',
    processing: 'text-blue-400 bg-blue-400/10',
    failed: 'text-red-400 bg-red-400/10',
    cancelled: 'text-gray-400 bg-gray-400/10',
  };
  return colors[status] || colors.pending;
}

/**
 * Get transaction type icon name (lucide-react)
 */
export function getTransactionIcon(type: string): string {
  const icons: Record<string, string> = {
    bill_payment: 'Receipt',
    deposit: 'ArrowDownLeft',
    withdrawal: 'ArrowUpRight',
    send: 'Send',
    receive: 'ArrowDownLeft',
  };
  return icons[type] || 'CircleDot';
}

/**
 * Format large numbers with abbreviations (1.2K, 3.5M, etc.)
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
