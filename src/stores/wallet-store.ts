'use client';

import { create } from 'zustand';
import { type WalletBalance, type Token } from '@/types';
import { WalletService } from '@/services/wallet-service';
import { TOKENS } from '@/lib/constants';

interface WalletState {
  balances: WalletBalance[];
  totalUsdValue: number;
  totalFiatValue: number;
  isLoading: boolean;
  error: string | null;
  selectedToken: Token;
  fetchBalances: (address: string) => Promise<void>;
  setSelectedToken: (token: Token) => void;
  deductBalance: (symbol: string, amount: string) => void;
  addBalance: (symbol: string, amount: string) => void;
  reset: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  balances: [],
  totalUsdValue: 0,
  totalFiatValue: 0,
  isLoading: false,
  error: null,
  selectedToken: TOKENS[0], // Default USDC

  fetchBalances: async (address: string) => {
    set({ isLoading: true, error: null });
    try {
      const balances = await WalletService.getBalances(address);
      
      const totalUsdValue = balances.reduce((sum, bal) => sum + bal.usdValue, 0);
      const totalFiatValue = balances.reduce((sum, bal) => sum + bal.fiatValue, 0);

      set({
        balances,
        totalUsdValue,
        totalFiatValue,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch balances', isLoading: false });
    }
  },

  setSelectedToken: (token: Token) => {
    set({ selectedToken: token });
  },

  deductBalance: (symbol: string, amount: string) => {
    const deductAmount = parseFloat(amount);
    if (isNaN(deductAmount)) return;

    const { balances, fetchBalances } = get();
    const updated = balances.map((bal) => {
      if (bal.token.symbol === symbol) {
        const currentBal = parseFloat(bal.balance);
        const newBalStr = Math.max(0, currentBal - deductAmount).toFixed(6);
        const newUsd = Math.max(0, bal.usdValue - deductAmount);
        // Recalculate fiat conversion rate
        const rate = bal.usdValue > 0 ? bal.fiatValue / bal.usdValue : 83.5;
        const newFiat = newUsd * rate;

        return {
          ...bal,
          balance: newBalStr,
          usdValue: newUsd,
          fiatValue: newFiat,
        };
      }
      return bal;
    });

    const totalUsdValue = updated.reduce((sum, bal) => sum + bal.usdValue, 0);
    const totalFiatValue = updated.reduce((sum, bal) => sum + bal.fiatValue, 0);

    set({
      balances: updated,
      totalUsdValue,
      totalFiatValue,
    });
  },

  addBalance: (symbol: string, amount: string) => {
    const addAmount = parseFloat(amount);
    if (isNaN(addAmount)) return;

    const { balances } = get();
    const updated = balances.map((bal) => {
      if (bal.token.symbol === symbol) {
        const currentBal = parseFloat(bal.balance);
        const newBalStr = (currentBal + addAmount).toFixed(6);
        const newUsd = bal.usdValue + addAmount;
        const rate = bal.usdValue > 0 ? bal.fiatValue / bal.usdValue : 83.5;
        const newFiat = newUsd * rate;

        return {
          ...bal,
          balance: newBalStr,
          usdValue: newUsd,
          fiatValue: newFiat,
        };
      }
      return bal;
    });

    const totalUsdValue = updated.reduce((sum, bal) => sum + bal.usdValue, 0);
    const totalFiatValue = updated.reduce((sum, bal) => sum + bal.fiatValue, 0);

    set({
      balances: updated,
      totalUsdValue,
      totalFiatValue,
    });
  },

  reset: () => {
    set({
      balances: [],
      totalUsdValue: 0,
      totalFiatValue: 0,
      isLoading: false,
      error: null,
      selectedToken: TOKENS[0],
    });
  },
}));
