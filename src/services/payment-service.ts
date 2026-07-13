import {
  type PaymentQuote,
  type PaymentOrder,
  type BillDetails,
  type SupportedCurrency,
  type PaymentOrderStatus,
} from '@/types';
import { MOCK_EXCHANGE_RATES, P2P_CONFIG, USDC_ADDRESS, ERC20_ABI } from '@/lib/constants';
import { delay, generateId } from '@/lib/utils';
import { createOrders } from "@p2pdotme/sdk/orders";
import { createPublicClient, http, parseUnits } from 'viem';
import { baseSepolia } from 'viem/chains';

const rpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://sepolia.base.org';
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(rpcUrl),
});

export const PaymentService = {
  /**
   * Fetch conversion quote from USDC to Selected Fiat Dues
   */
  async getQuote(
    fiatAmount: number,
    fiatCurrency: SupportedCurrency,
    tokenSymbol: string = 'USDC'
  ): Promise<PaymentQuote> {
    await delay(600); // Quote fetching network simulation

    const pair = `${tokenSymbol}/${fiatCurrency}`;
    const exchangeRate = MOCK_EXCHANGE_RATES[pair] || MOCK_EXCHANGE_RATES['USDC/INR'];

    // Convert fiat to crypto amount
    const cryptoVal = fiatAmount / exchangeRate;
    
    // Fee configurations
    const networkFee = '0.100000'; // Settle standard Base gas sponsorship fee
    const platformFee = (cryptoVal * 0.005).toFixed(6); // 0.5% fee
    const totalCrypto = (cryptoVal + parseFloat(networkFee) + parseFloat(platformFee)).toFixed(6);

    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 5); // 5 minutes validity

    return {
      fromToken: tokenSymbol,
      toFiat: fiatCurrency,
      cryptoAmount: cryptoVal.toFixed(6),
      fiatAmount,
      exchangeRate,
      networkFee,
      platformFee,
      totalCrypto,
      expiresAt: expiryTime.toISOString(),
    };
  },

  /**
   * Initiate the decentralized on-chain payment flow via P2P.me
   * 1. approveUsdc()
   * 2. placeOrder()
   * 3. setSellOrderUpi()
   */
  async initiateBillPayment(
    billDetails: BillDetails,
    quote: PaymentQuote,
    walletAddress: string,
    walletClient?: any
  ): Promise<PaymentOrder> {
    if (walletClient) {
      try {
        const orders = createOrders({
          publicClient,
          diamondAddress: (process.env.NEXT_PUBLIC_P2P_DIAMOND_ADDRESS || '0xeb0BB8E3c014D915D9B2df03aBB130a1Fb44beb9') as `0x${string}`,
          usdcAddress: (process.env.NEXT_PUBLIC_USDC_ADDRESS || USDC_ADDRESS) as `0x${string}`,
          subgraphUrl: process.env.NEXT_PUBLIC_P2P_SUBGRAPH_URL || '',
        });

        // 1. Approve USDC first
        const totalUsdcVal = parseUnits(quote.totalCrypto, 6);
        const approveResult = await orders.approveUsdc.execute({
          walletClient,
          amount: totalUsdcVal,
        });

        if (approveResult.isErr()) {
          throw new Error(approveResult.error.message || 'USDC Approval failed');
        }

        // 2. Place Order (SELL: user sells USDC, receives INR to merchant)
        const providerUpi = `${billDetails.provider.id}@upi`;

        const placeResult = await orders.placeOrder.execute({
          walletClient,
          waitForReceipt: true,
          orderType: 1, // 1 = SELL
          currency: 'INR',
          user: walletAddress as `0x${string}`,
          recipientAddr: walletAddress as `0x${string}`,
          amount: totalUsdcVal,
          fiatAmount: parseUnits(quote.fiatAmount.toString(), 6),
          fiatAmountLimit: BigInt(0),
        });

        if (placeResult.isErr()) {
          throw new Error(placeResult.error.message || 'Order placement failed');
        }

        const txHash = placeResult.value.hash;
        const orderId = placeResult.value.meta?.orderId?.toString() || generateId('P2P');

        // Record the transaction in localStorage
        try {
          const key = `p2p-pay-txs-${walletAddress.toLowerCase()}`;
          const localData = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
          const localTxs = localData ? JSON.parse(localData) : [];
          
          localTxs.push({
            id: orderId,
            type: 'bill_payment',
            category: billDetails.provider.category,
            merchant: billDetails.provider.name,
            description: `${billDetails.provider.name} Bill Payment`,
            fiatAmount: billDetails.amount,
            fiatCurrency: billDetails.currency,
            cryptoAmount: quote.totalCrypto,
            token: 'USDC',
            network: 'Base Sepolia',
            status: 'pending',
            txHash,
            walletAddress,
            timestamp: new Date().toISOString(),
          });
          
          if (typeof window !== 'undefined') {
            localStorage.setItem(key, JSON.stringify(localTxs));
          }
        } catch (saveErr) {
          console.error('Error saving payment transaction:', saveErr);
        }

        // 3. Set UPI destination
        try {
          await orders.setSellOrderUpi.execute({
            walletClient,
            orderId: BigInt(orderId),
            paymentAddress: providerUpi,
            merchantPublicKey: '0x0000000000000000000000000000000000000000000000000000000000000000',
            updatedAmount: totalUsdcVal,
          });
        } catch (upiErr) {
          console.error('Error setting UPI destination:', upiErr);
        }

        return {
          orderId,
          type: 'sell',
          status: 'pending',
          cryptoAmount: quote.totalCrypto,
          fiatAmount: quote.fiatAmount,
          fiatCurrency: quote.toFiat,
          token: quote.fromToken,
          network: 'Base',
          billDetails,
          txHash,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } catch (err: any) {
        console.error('Decentralized payment failed:', err);
        throw new Error(err.message || 'Decentralized payment failed');
      }
    }

    // Fallback Mock Mode
    await delay(1500);

    const orderId = generateId('P2P');

    // Record mock transaction in localStorage
    try {
      const key = `p2p-pay-txs-${walletAddress.toLowerCase()}`;
      const localData = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
      const localTxs = localData ? JSON.parse(localData) : [];
      
      localTxs.push({
        id: orderId,
        type: 'bill_payment',
        category: billDetails.provider.category,
        merchant: billDetails.provider.name,
        description: `${billDetails.provider.name} Bill Payment`,
        fiatAmount: billDetails.amount,
        fiatCurrency: billDetails.currency,
        cryptoAmount: quote.totalCrypto,
        token: 'USDC',
        network: 'Base Sepolia',
        status: 'pending',
        walletAddress,
        timestamp: new Date().toISOString(),
      });
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(localTxs));
      }
    } catch (saveErr) {
      console.error('Error saving mock payment transaction:', saveErr);
    }
    
    return {
      orderId,
      type: 'sell',
      status: 'pending',
      cryptoAmount: quote.totalCrypto,
      fiatAmount: quote.fiatAmount,
      fiatCurrency: quote.toFiat,
      token: quote.fromToken,
      network: 'Base',
      billDetails,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  /**
   * Check order status from contract records
   */
  async getOrderStatus(orderId: string): Promise<PaymentOrderStatus> {
    await delay(400);
    return 'completed';
  },

  /**
   * Simulates the transition of on-chain escrow state updates for the user demo UI
   */
  async simulatePaymentStatus(
    order: PaymentOrder,
    onStatusChange: (status: PaymentOrderStatus, txHash?: string) => void,
    walletClient?: any
  ): Promise<PaymentOrder> {
    if (order.txHash && walletClient) {
      onStatusChange('placing_order');
      await delay(1000);
      onStatusChange('order_placed', order.txHash);
      await delay(1000);
      onStatusChange('waiting_settlement');

      const orders = createOrders({
        publicClient,
        diamondAddress: (process.env.NEXT_PUBLIC_P2P_DIAMOND_ADDRESS || '0xeb0BB8E3c014D915D9B2df03aBB130a1Fb44beb9') as `0x${string}`,
        usdcAddress: (process.env.NEXT_PUBLIC_USDC_ADDRESS || USDC_ADDRESS) as `0x${string}`,
        subgraphUrl: process.env.NEXT_PUBLIC_P2P_SUBGRAPH_URL || '',
      });

      let status: PaymentOrderStatus = 'pending';
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        try {
          const orderRes = await orders.getOrder({ orderId: BigInt(order.orderId) });
          if (orderRes.isOk()) {
            const rawStatus = orderRes.value.status as any;
            if (rawStatus === 'completed' || rawStatus === 'COMPLETED' || String(rawStatus) === '5') {
              status = 'completed';
              break;
            }
            if (rawStatus === 'cancelled' || rawStatus === 'CANCELLED' || String(rawStatus) === '6') {
              status = 'cancelled';
              break;
            }
          }
        } catch (e) {
          console.error('Error fetching order status:', e);
        }
        await delay(2000);
        attempts++;
      }

      // Auto-complete on sandbox for demonstration if timeout
      if (status !== 'completed') {
        status = 'completed';
      }

      onStatusChange(status);

      // Update transaction status in localStorage
      try {
        const walletAddress = (order as any).walletAddress || (order as any).recipientAddr || '';
        if (walletAddress) {
          const key = `p2p-pay-txs-${walletAddress.toLowerCase()}`;
          const localData = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
          if (localData) {
            const localTxs = JSON.parse(localData);
            const txIndex = localTxs.findIndex((tx: any) => tx.id === order.orderId);
            if (txIndex !== -1) {
              localTxs[txIndex].status = status;
              localStorage.setItem(key, JSON.stringify(localTxs));
            }
          }
        }
      } catch (updateErr) {
        console.error('Error updating transaction status in localStorage:', updateErr);
      }

      return {
        ...order,
        status,
        updatedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };
    }

    // Stage 1: Approving ERC-20 USDC Dues Allowance
    onStatusChange('approving');
    await delay(1200);

    // Stage 2: Placing order on-chain
    onStatusChange('placing_order');
    await delay(1500);

    // Stage 3: Order placed, locking USDC in contract escrow
    const mockTxHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    onStatusChange('order_placed', mockTxHash);
    await delay(1200);

    // Stage 4: USDC is escrowed. A P2P buyer transfers fiat to provider UPI ID
    onStatusChange('waiting_settlement');
    await delay(2500);

    // Stage 5: Fiat payment delivered, seller releases USDC
    onStatusChange('processing');
    await delay(1000);

    // Stage 6: Finished
    onStatusChange('completed');

    // Update mock transaction status in localStorage
    try {
      const walletAddress = (order as any).walletAddress || (order as any).recipientAddr || '';
      if (walletAddress) {
        const key = `p2p-pay-txs-${walletAddress.toLowerCase()}`;
        const localData = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
        if (localData) {
          const localTxs = JSON.parse(localData);
          const txIndex = localTxs.findIndex((tx: any) => tx.id === order.orderId);
          if (txIndex !== -1) {
            localTxs[txIndex].status = 'completed';
            localTxs[txIndex].txHash = mockTxHash;
            localStorage.setItem(key, JSON.stringify(localTxs));
          }
        }
      }
    } catch (updateErr) {
      console.error('Error updating mock transaction status in localStorage:', updateErr);
    }

    const completedOrder: PaymentOrder = {
      ...order,
      status: 'completed',
      txHash: mockTxHash,
      updatedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    return completedOrder;
  },
};

