'use client';

import * as React from 'react';
import { useWalletStore } from '@/stores/wallet-store';
import { useUserStore } from '@/stores/user-store';
import { WalletService } from '@/services/wallet-service';
import { type WalletBalance, type Token } from '@/types';

export const useWallet = () => {
  const { preferences } = useUserStore();
  const {
    balances,
    totalUsdValue,
    totalFiatValue,
    isLoading,
    error,
    selectedToken,
    fetchBalances,
    setSelectedToken,
    deductBalance,
    addBalance,
  } = useWalletStore();

  const activeCurrency = preferences.currency;

  /**
   * Helper to format values automatically using preferences
   */
  const formatFiatValue = React.useCallback(
    (usdValue: number): number => {
      const rate = WalletService.getTokenPrice('USDC', activeCurrency);
      return usdValue * rate;
    },
    [activeCurrency]
  );

  /**
   * Retrieve a specific token balance object by its symbol
   */
  const getBalance = React.useCallback(
    (symbol: string): WalletBalance | undefined => {
      return balances.find((b) => b.token.symbol.toUpperCase() === symbol.toUpperCase());
    },
    [balances]
  );

  return {
    balances,
    totalUsdValue,
    // Convert base values dynamically in case currency changed
    totalFiatValue: formatFiatValue(totalUsdValue),
    isLoading,
    error,
    selectedToken,
    fetchBalances,
    selectToken: setSelectedToken,
    deductBalance,
    addBalance,
    getBalance,
    formatFiatValue,
    activeCurrency,
  };
};
export { useWalletStore };
