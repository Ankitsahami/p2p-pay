'use client';

import { create } from 'zustand';
import {
  type BillDetails,
  type PaymentQuote,
  type PaymentOrder,
  type PaymentFlowStep,
  type SupportedCurrency,
  type PaymentOrderStatus,
} from '@/types';
import { PaymentService } from '@/services/payment-service';

interface PaymentState {
  currentBill: BillDetails | null;
  currentQuote: PaymentQuote | null;
  currentOrder: PaymentOrder | null;
  flowStep: PaymentFlowStep;
  error: string | null;
  isProcessing: boolean;
  setBill: (bill: BillDetails) => void;
  fetchQuote: (amount: number, currency: SupportedCurrency) => Promise<void>;
  startPayment: (walletAddress: string, onProgress: (status: PaymentOrderStatus, txHash?: string) => void) => Promise<void>;
  resetPayment: () => void;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  currentBill: null,
  currentQuote: null,
  currentOrder: null,
  flowStep: 'idle',
  error: null,
  isProcessing: false,

  setBill: (bill: BillDetails) => {
    set({
      currentBill: bill,
      flowStep: 'bill_fetched',
      error: null,
    });
  },

  fetchQuote: async (amount: number, currency: SupportedCurrency) => {
    set({ flowStep: 'getting_quote', error: null });
    try {
      const quote = await PaymentService.getQuote(amount, currency, 'USDC');
      set({
        currentQuote: quote,
        flowStep: 'quote_ready',
      });
    } catch (err: any) {
      set({
        error: err.message || 'Failed to get conversion quote',
        flowStep: 'bill_fetched',
      });
    }
  },

  startPayment: async (
    walletAddress: string,
    onProgress: (status: PaymentOrderStatus, txHash?: string) => void
  ) => {
    const { currentBill, currentQuote } = get();
    if (!currentBill || !currentQuote) {
      set({ error: 'Missing bill details or quote' });
      return;
    }

    set({ isProcessing: true, error: null });

    try {
      // 1. Initiate order creation
      set({ flowStep: 'approving_usdc' });
      const order = await PaymentService.initiateBillPayment(currentBill, currentQuote, walletAddress);
      set({ currentOrder: order });

      // 2. Simulate complete on-chain P2P escrow payment flow steps
      const finalOrder = await PaymentService.simulatePaymentStatus(
        order,
        (status, txHash) => {
          // Map internal order status updates to flow steps
          if (status === 'approving') set({ flowStep: 'approving_usdc' });
          if (status === 'placing_order') set({ flowStep: 'placing_order' });
          if (status === 'waiting_settlement') set({ flowStep: 'waiting_settlement' });
          
          onProgress(status, txHash);
        }
      );

      set({
        currentOrder: finalOrder,
        flowStep: 'completed',
        isProcessing: false,
      });
    } catch (err: any) {
      set({
        error: err.message || 'Transaction failed',
        flowStep: 'failed',
        isProcessing: false,
      });
    }
  },

  resetPayment: () => {
    set({
      currentBill: null,
      currentQuote: null,
      currentOrder: null,
      flowStep: 'idle',
      error: null,
      isProcessing: false,
    });
  },
}));
