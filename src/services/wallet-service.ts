import {
  type WalletBalance,
  type Transaction,
  type Token,
  type SupportedCurrency,
} from '@/types';
import { MOCK_WALLET_BALANCES, MOCK_TRANSACTIONS } from '@/lib/mock-data';
import { MOCK_EXCHANGE_RATES, USDC_ADDRESS, ERC20_ABI, TOKENS } from '@/lib/constants';
import { delay } from '@/lib/utils';
import { createPublicClient, http, formatUnits, parseUnits } from 'viem';
import { baseSepolia } from 'viem/chains';

const rpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://sepolia.base.org';
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(rpcUrl),
});

export const WalletService = {
  /**
   * Get wallet balances for a given address
   */
  async getBalances(address: string): Promise<WalletBalance[]> {
    try {
      if (!address || !address.startsWith('0x')) {
        return [];
      }

      // Fetch real USDC balance on Base Sepolia
      const rawBalance = await publicClient.readContract({
        address: USDC_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
      });

      const balanceStr = formatUnits(rawBalance, 6);
      const usdValue = Number(balanceStr);
      const fiatValue = usdValue * 83.50; // USDC/INR rate 83.5

      // Fetch native ETH balance
      const rawEth = await publicClient.getBalance({
        address: address as `0x${string}`,
      });
      const ethBalanceStr = formatUnits(rawEth, 18);
      const ethUsdValue = Number(ethBalanceStr) * 3300.00; // ETH/USD rate 3300
      const ethFiatValue = ethUsdValue * 83.50;

      return [
        {
          token: TOKENS[0], // USDC
          balance: balanceStr,
          usdValue,
          fiatValue,
        },
        {
          token: TOKENS[1], // WETH
          balance: ethBalanceStr,
          usdValue: ethUsdValue,
          fiatValue: ethFiatValue,
        }
      ];
    } catch (e) {
      console.error('Error fetching balance from chain:', e);
      return [];
    }
  },

  /**
   * Get paginated transactions for an address
   */
  async getTransactionHistory(
    address: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ items: Transaction[]; total: number; hasMore: boolean }> {
    if (!address) {
      return { items: [], total: 0, hasMore: false };
    }

    try {
      const response = await fetch(`/api/transactions?walletAddress=${address}`);
      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      const dbTxs: Transaction[] = result.data || [];
      const start = (page - 1) * pageSize;
      const end = start + pageSize;

      return {
        items: dbTxs.slice(start, end),
        total: dbTxs.length,
        hasMore: end < dbTxs.length,
      };
    } catch (e) {
      console.error('Error fetching transactions from API:', e);
      return { items: [], total: 0, hasMore: false };
    }
  },

  /**
   * Record a new transaction in database
   */
  async saveTransaction(address: string, tx: Omit<Transaction, 'walletAddress'>): Promise<void> {
    if (!address) return;
    try {
      await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...tx,
          walletAddress: address,
        }),
      });
    } catch (e) {
      console.error('Error saving transaction to API:', e);
    }
  },

  /**
   * Send tokens from the smart contract wallet to an external address
   */
  async sendTransaction(
    to: string,
    amount: string,
    token: Token,
    walletAddress: string,
    walletClient?: any
  ): Promise<{ txHash: string }> {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error('Invalid transfer amount');
    }

    if (walletClient) {
      try {
        const value = parseUnits(amount, token.decimals);
        let txHash;

        if (token.address.toLowerCase() === USDC_ADDRESS.toLowerCase()) {
          txHash = await walletClient.writeContract({
            address: token.address as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'transfer',
            args: [to as `0x${string}`, value],
          });
        } else {
          // Native transfer
          txHash = await walletClient.sendTransaction({
            to: to as `0x${string}`,
            value,
          });
        }

        // Wait for receipt
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        // Save transaction to database API
        await WalletService.saveTransaction(walletAddress, {
          id: txHash,
          type: 'send',
          description: `Sent ${amount} ${token.symbol} to ${to.slice(0, 6)}...${to.slice(-4)}`,
          fiatAmount: numAmount * WalletService.getTokenPrice(token.symbol, 'INR'),
          fiatCurrency: 'INR',
          cryptoAmount: amount,
          token: token.symbol,
          network: 'Base Sepolia',
          status: 'completed',
          txHash,
          toAddress: to,
          timestamp: new Date().toISOString(),
        });

        return { txHash };
      } catch (err: any) {
        console.error('Send transaction error:', err);
        throw new Error(err.message || 'On-chain transaction execution failed');
      }
    }

    // Fallback if client is missing
    throw new Error('Wallet client is required to perform transfers');
  },

  /**
   * Helper to retrieve exchange rate values dynamically
   */
  getTokenPrice(symbol: string, currency: SupportedCurrency = 'INR'): number {
    const pair = `${symbol}/${currency}`;
    return MOCK_EXCHANGE_RATES[pair] || MOCK_EXCHANGE_RATES['USDC/INR'];
  },
};

