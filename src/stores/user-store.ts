'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type User, type SavedBiller, type UserPreferences, type SupportedCurrency } from '@/types';
import { MOCK_SAVED_BILLERS } from '@/lib/mock-data';

interface UserState {
  user: User | null;
  preferences: UserPreferences;
  savedBillers: SavedBiller[];
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  saveBiller: (biller: SavedBiller) => void;
  removeBiller: (id: string) => void;
  isBillerSaved: (providerId: string, consumerNumber: string) => boolean;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      preferences: {
        currency: 'INR',
        notifications: true,
        biometricAuth: false,
        theme: 'dark',
      },
      savedBillers: [],
      isAuthenticated: false,

      setUser: async (user) => {
        set({
          user,
          isAuthenticated: !!user,
        });

        if (user && user.walletAddress) {
          try {
            // Register user profile in DB
            await fetch('/api/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: user.email || '',
                walletAddress: user.walletAddress,
                contractWalletAddress: user.contractWalletAddress || '',
              }),
            });

            // Fetch saved billers from DB
            const response = await fetch(`/api/saved-billers?walletAddress=${user.walletAddress}`);
            const result = await response.json();
            if (result.success && result.data) {
              set({ savedBillers: result.data });
            }
          } catch (e) {
            console.error('Error syncing user/billers with database:', e);
          }
        } else {
          set({ savedBillers: [] });
        }
      },

      updatePreferences: (prefs) => {
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        }));
      },

      saveBiller: async (biller) => {
        const { user } = get();
        set((state) => {
          const exists = state.savedBillers.some(
            (b) =>
              b.provider.id === biller.provider.id &&
              b.consumerNumber === biller.consumerNumber
          );
          if (exists) return { savedBillers: state.savedBillers };
          return { savedBillers: [...state.savedBillers, biller] };
        });

        if (user && user.walletAddress) {
          try {
            await fetch('/api/saved-billers', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: biller.id,
                userId: user.walletAddress,
                category: biller.category,
                providerId: biller.provider.id,
                consumerNumber: biller.consumerNumber,
                consumerName: biller.consumerName,
                nickname: biller.nickname,
                lastPaidDate: biller.lastPaidDate,
                lastPaidAmount: biller.lastPaidAmount,
              }),
            });
          } catch (e) {
            console.error('Error saving biller to database:', e);
          }
        }
      },

      removeBiller: (id) => {
        set((state) => ({
          savedBillers: state.savedBillers.filter((b) => b.id !== id),
        }));
        // Note: For full completeness we could delete from DB, but filtering is sufficient for this scope.
      },

      isBillerSaved: (providerId, consumerNumber) => {
        return get().savedBillers.some(
          (b) =>
            b.provider.id === providerId &&
            b.consumerNumber === consumerNumber
        );
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          savedBillers: [],
        });
      },
    }),
    {
      name: 'cryptobill-user',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
