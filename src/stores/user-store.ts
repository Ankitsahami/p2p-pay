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

      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      updatePreferences: (prefs) => {
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        }));
      },

      saveBiller: (biller) => {
        set((state) => {
          // Check if already exists to avoid duplicates
          const exists = state.savedBillers.some(
            (b) =>
              b.provider.id === biller.provider.id &&
              b.consumerNumber === biller.consumerNumber
          );
          if (exists) return { savedBillers: state.savedBillers };
          return { savedBillers: [...state.savedBillers, biller] };
        });
      },

      removeBiller: (id) => {
        set((state) => ({
          savedBillers: state.savedBillers.filter((b) => b.id !== id),
        }));
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
        });
      },
    }),
    {
      name: 'cryptobill-user',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
