import { type Notification, type NotificationType } from '@/types';
import { generateId } from '@/lib/utils';

export const NotificationService = {
  /**
   * Create a standard formatted notification object
   */
  createNotification(
    type: NotificationType,
    title: string,
    message: string,
    actionUrl?: string
  ): Notification {
    return {
      id: generateId('NOTIF'),
      type,
      title,
      message,
      read: false,
      timestamp: new Date().toISOString(),
      actionUrl,
    };
  },

  /**
   * Quick utility templates
   */
  notifyWalletCreated(): Notification {
    return this.createNotification(
      'wallet_created',
      'Smart Wallet Created',
      'Your embedded on-chain smart wallet is active on Base network.'
    );
  },

  notifyDepositReceived(amount: string, tokenSymbol: string): Notification {
    return this.createNotification(
      'deposit_received',
      'Deposit Received',
      `You have received ${amount} ${tokenSymbol} into your smart wallet.`
    );
  },

  notifyPaymentInitiated(providerName: string, amount: string): Notification {
    return this.createNotification(
      'payment_initiated',
      'Payment Initiated',
      `Payment order of ${amount} USDC for ${providerName} is now pending.`
    );
  },

  notifyPaymentCompleted(providerName: string, amount: string): Notification {
    return this.createNotification(
      'payment_completed',
      'Bill Payment Successful',
      `Your bill payment of ${amount} USDC to ${providerName} is completed.`
    );
  },

  notifyPaymentFailed(providerName: string, error: string): Notification {
    return this.createNotification(
      'payment_failed',
      'Bill Payment Failed',
      `Payment to ${providerName} failed: ${error}`
    );
  },
};
