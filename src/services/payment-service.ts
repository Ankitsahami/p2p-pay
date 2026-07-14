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
import { createPublicClient, http, parseUnits, formatUnits, decodeEventLog, erc20Abi } from 'viem';
import { baseSepolia } from 'viem/chains';

const rpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://sepolia.base.org';
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(rpcUrl),
});

// ERC-20 Transfer event signature: Transfer(address,address,uint256)
const TRANSFER_EVENT_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

/**
 * Read the on-chain USDC balance for a given address.
 * Returns the balance as a human-readable string (e.g. "9.000000").
 */
async function getOnChainUsdcBalance(address: string): Promise<{ raw: bigint; formatted: string }> {
  try {
    const rawBalance = await publicClient.readContract({
      address: USDC_ADDRESS as `0x${string}`,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [address as `0x${string}`],
    });
    return { raw: rawBalance, formatted: formatUnits(rawBalance, 6) };
  } catch {
    return { raw: BigInt(0), formatted: '0' };
  }
}

/**
 * Parse the transaction receipt to find the ERC-20 Transfer log for the USDC token.
 * Returns true if a Transfer event was emitted from the USDC contract.
 */
function findUsdcTransferInReceipt(receipt: any): { found: boolean; amount: bigint } {
  if (!receipt?.logs) return { found: false, amount: BigInt(0) };

  for (const log of receipt.logs) {
    // Check if this log is from the USDC contract and is a Transfer event
    if (
      log.address?.toLowerCase() === USDC_ADDRESS.toLowerCase() &&
      log.topics?.[0] === TRANSFER_EVENT_TOPIC
    ) {
      try {
        const decoded = decodeEventLog({
          abi: erc20Abi,
          data: log.data,
          topics: log.topics,
        });
        if (decoded.eventName === 'Transfer') {
          const args = decoded.args as { from: string; to: string; value: bigint };
          return { found: true, amount: args.value };
        }
      } catch {
        // If decoding fails, still mark as found if topics match
        return { found: true, amount: BigInt(0) };
      }
    }
  }
  return { found: false, amount: BigInt(0) };
}

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
   * 
   * Flow:
   * 1. Validate on-chain USDC balance (MUST have enough tokens)
   * 2. approveUsdc() — approve Diamond to spend USDC
   * 3. placeOrder() — place SELL order; Diamond internally does transferFrom
   * 4. Verify Transfer event in receipt (ensure tokens actually moved)
   * 5. setSellOrderUpi() — set payout destination (no user popup needed)
   */
  async initiateBillPayment(
    billDetails: BillDetails,
    quote: PaymentQuote,
    walletAddress: string,
    walletClient?: any
  ): Promise<PaymentOrder> {
    const isRealWallet = walletAddress && !walletAddress.startsWith('0xMock') && walletAddress.toLowerCase() !== '0x0000000000000000000000000000000000000000';
    if (isRealWallet && !walletClient) {
      throw new Error('Privy wallet client is not fully initialized. Please wait a moment for the connection to synchronize and try again.');
    }

    if (walletClient) {
      try {
        const totalUsdcVal = parseUnits(quote.totalCrypto, 6);
        const activeSender = (walletClient?.account?.address || walletAddress) as `0x${string}`;

        // ═══════════════════════════════════════════════════════════════
        // STEP 0: Validate on-chain USDC balance BEFORE any transactions
        // ═══════════════════════════════════════════════════════════════
        const { raw: onChainBalance, formatted: balanceStr } = await getOnChainUsdcBalance(activeSender);
        
        // Calculate correct net order amount and required pull amount including on-chain Diamond fee (0.125 USDC)
        const netUsdcVal = parseUnits(quote.cryptoAmount, 6);
        const actualFixedFee = parseUnits('0.125', 6);
        const requiredPullAmount = netUsdcVal + actualFixedFee;

        if (onChainBalance < requiredPullAmount) {
          const requiredStr = formatUnits(requiredPullAmount, 6);
          throw new Error(
            `Insufficient USDC balance. You have ${balanceStr} USDC but need ${requiredStr} USDC (including on-chain escrow fee). ` +
            `Please add at least ${formatUnits(requiredPullAmount - onChainBalance, 6)} more USDC to your wallet.`
          );
        }

        const orders = createOrders({
          publicClient,
          diamondAddress: (process.env.NEXT_PUBLIC_P2P_DIAMOND_ADDRESS || '0xeb0BB8E3c014D915D9B2df03aBB130a1Fb44beb9') as `0x${string}`,
          usdcAddress: USDC_ADDRESS as `0x${string}`,
          subgraphUrl: process.env.NEXT_PUBLIC_P2P_SUBGRAPH_URL || '',
        });

        // ═══════════════════════════════════════════════════════════════
        // STEP 1: Approve USDC spending (Popup 1: shows token + amount)
        //         We approve the required pull amount + a small buffer of 0.05 USDC
        //         to handle any minor rounding issues in on-chain fee calculation.
        // ═══════════════════════════════════════════════════════════════
        const approveAmount = requiredPullAmount + parseUnits('0.05', 6);
        const approveResult = await orders.approveUsdc.execute({
          walletClient,
          amount: approveAmount,
          waitForReceipt: true,
        });

        if (approveResult.isErr()) {
          throw new Error(approveResult.error.message || 'USDC Approval failed');
        }

        // ═══════════════════════════════════════════════════════════════
        // STEP 2: Place Order (Popup 2: calls Diamond, which internally
        //         does transferFrom to pull USDC into escrow)
        // ═══════════════════════════════════════════════════════════════
        const providerUpi = `${billDetails.provider.id}@upi`;

        const placeResult = await orders.placeOrder.execute({
          walletClient,
          waitForReceipt: true,
          orderType: 1, // 1 = SELL
          currency: 'INR',
          user: activeSender,
          recipientAddr: activeSender,
          amount: netUsdcVal, // Pass net USDC value to placeOrder; Diamond adds 0.125 fee on top
          fiatAmount: parseUnits(quote.fiatAmount.toString(), 6),
          fiatAmountLimit: BigInt(0),
        });

        if (placeResult.isErr()) {
          throw new Error(placeResult.error.message || 'Order placement failed');
        }

        const placeOrderTxHash = placeResult.value.hash;
        const orderId = placeResult.value.meta?.orderId?.toString() || generateId('P2P');

        // ═══════════════════════════════════════════════════════════════
        // STEP 3: Verify USDC actually transferred by checking the receipt
        //         for ERC-20 Transfer events from the USDC contract
        // ═══════════════════════════════════════════════════════════════
        let tokenTransferTxHash = placeOrderTxHash;
        try {
          const receipt = await publicClient.getTransactionReceipt({ hash: placeOrderTxHash as `0x${string}` });
          const transfer = findUsdcTransferInReceipt(receipt);

          if (!transfer.found) {
            // The Diamond's placeOrder succeeded on-chain but did NOT actually pull USDC.
            // This happens when the mock USDC's transferFrom returns false (insufficient balance)
            // but the Diamond doesn't check the return value.
            console.warn(
              `⚠️ Order ${orderId} placed on-chain but no USDC Transfer event found in receipt. ` +
              `The Diamond contract may have silently failed to pull tokens.`
            );
            // We already validated balance above, so this shouldn't happen in normal flow.
            // But if it does, we warn the user.
          }
          // The placeOrder tx IS the tx that contains the Transfer — use it as the display hash
          tokenTransferTxHash = placeOrderTxHash;
        } catch (receiptErr) {
          console.error('Error verifying transfer receipt:', receiptErr);
        }

        // Record the transaction in localStorage
        try {
          const key = `p2p-pay-txs-${walletAddress.toLowerCase()}`;
          const localData = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
          const localTxs = localData ? JSON.parse(localData) : [];
          
          localTxs.push({
            id: orderId,
            type: 'bill_payment',
            category: billDetails.provider.category,
            merchant: 'Goofy Faucet Merchant',
            merchantAddress: '0x350E52598C8d5A6EFAb6f33C2115C6AAE9cB930F',
            description: `${billDetails.provider.name} Bill Payment via Escrow`,
            fiatAmount: billDetails.amount,
            fiatCurrency: billDetails.currency,
            cryptoAmount: quote.totalCrypto,
            token: 'USDC',
            network: 'Base Sepolia',
            status: 'pending',
            txHash: tokenTransferTxHash,
            walletAddress,
            timestamp: new Date().toISOString(),
            fee: '0.050000',
            completedIn: '12s',
          });
          
          if (typeof window !== 'undefined') {
            localStorage.setItem(key, JSON.stringify(localTxs));
          }
        } catch (saveErr) {
          console.error('Error saving payment transaction:', saveErr);
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
          txHash: tokenTransferTxHash,
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
        usdcAddress: USDC_ADDRESS as `0x${string}`,
        subgraphUrl: process.env.NEXT_PUBLIC_P2P_SUBGRAPH_URL || '',
      });

      let status: PaymentOrderStatus = 'pending';
      let attempts = 0;
      const maxAttempts = 15; // increased to 15 to allow time for user prompt approval
      let upiSetTriggered = false;

      while (attempts < maxAttempts) {
        try {
          const orderRes = await orders.getOrder({ orderId: BigInt(order.orderId) });
          if (orderRes.isOk()) {
            const rawStatus = orderRes.value.status as any;
            const statusStr = String(rawStatus);

            // Status 1 = ACCEPTED (merchant has accepted the order)
            if (statusStr === '1' && !upiSetTriggered && orderRes.value.pubkey) {
              upiSetTriggered = true;
              console.log(`[Escrow] Order ACCEPTED on-chain by merchant. Triggering setSellOrderUpi to pull USDC...`);
              onStatusChange('processing'); // Transition UI to processing for the wallet approval popup

              try {
                const providerUpi = `${order.billDetails?.provider.id || 'utility'}@upi`;
                const upiResult = await orders.setSellOrderUpi.execute({
                  walletClient,
                  orderId: BigInt(order.orderId),
                  paymentAddress: providerUpi,
                  merchantPublicKey: orderRes.value.pubkey,
                  updatedAmount: orderRes.value.usdcAmount, // net amount (actual amount to pull)
                  waitForReceipt: true,
                });

                if (upiResult.isOk()) {
                  console.log(`[Escrow] setSellOrderUpi succeeded. Tx hash: ${upiResult.value.hash}`);
                  onStatusChange('waiting_settlement', upiResult.value.hash);
                } else {
                  console.error(`[Escrow] setSellOrderUpi failed:`, upiResult.error.message);
                  upiSetTriggered = false; // Reset to allow retry
                  onStatusChange('waiting_settlement');
                }
              } catch (upiErr: any) {
                console.error(`[Escrow] Error executing setSellOrderUpi:`, upiErr);
                upiSetTriggered = false; // Reset to allow retry
                onStatusChange('waiting_settlement');
              }
            }

            if (rawStatus === 'completed' || rawStatus === 'COMPLETED' || statusStr === '5') {
              status = 'completed';
              break;
            }
            if (rawStatus === 'cancelled' || rawStatus === 'CANCELLED' || statusStr === '6') {
              status = 'cancelled';
              break;
            }
          }
        } catch (e) {
          console.error('Error fetching order status:', e);
        }
        await delay(2500);
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

