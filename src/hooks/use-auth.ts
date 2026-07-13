'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { usePrivy } from '@/providers/privy-provider';
import { useUserStore } from '@/stores/user-store';
import { useNotificationStore } from '@/stores/notification-store';
import { NotificationService } from '@/services/notification-service';
import { type User } from '@/types';

export const useAuth = () => {
  const router = useRouter();
  const privy = usePrivy();
  const { user, isAuthenticated, setUser, logout: clearStore } = useUserStore();
  const { addNotification } = useNotificationStore();

  // Sync privy state to user store with mapping
  React.useEffect(() => {
    if (privy.ready) {
      if (privy.authenticated && privy.user) {
        const privyUser = privy.user;
        const email = privyUser.email?.address || privyUser.google?.email || '';
        const name = privyUser.google?.name || privyUser.email?.address?.split('@')[0] || 'User';
        const avatar = (privyUser.google as any)?.picture || '';
        const walletAddress = privyUser.wallets?.find(
          (w) => w.walletClientType === 'privy' || w.connectorType === 'embedded'
        )?.address || privyUser.wallet?.address || '';
        
        const mappedUser: User = {
          id: privyUser.id,
          email,
          name,
          avatar,
          walletAddress,
          kycStatus: 'verified',
          role: email === 'ankitsahani008@gmail.com' ? 'admin' : 'user',
          currency: 'INR',
          createdAt: privyUser.createdAt instanceof Date ? privyUser.createdAt.toISOString() : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setUser(mappedUser);
      } else {
        setUser(null);
      }
    }
  }, [privy.ready, privy.authenticated, privy.user, setUser]);

  const login = async () => {
    try {
      await privy.login();
      toast.success('Logged in successfully');
      
      const newNotif = NotificationService.notifyWalletCreated();
      addNotification(newNotif);

      router.push('/dashboard');
    } catch (err) {
      console.error('Login error', err);
      toast.error('Failed to log in. Please try again.');
    }
  };

  const logout = async () => {
    try {
      await privy.logout();
      clearStore();
      toast.success('Logged out successfully');
      router.push('/');
    } catch (err) {
      console.error('Logout error', err);
      toast.error('Failed to log out.');
    }
  };

  const embeddedWalletAddress = privy.user?.wallets?.find(
    (w) => w.walletClientType === 'privy' || w.connectorType === 'embedded'
  )?.address || privy.user?.wallet?.address || user?.walletAddress || '';

  return {
    ready: privy.ready,
    isAuthenticated: privy.authenticated || isAuthenticated,
    user: user,
    walletAddress: embeddedWalletAddress,
    login,
    logout,
  };
};
export { usePrivy };

