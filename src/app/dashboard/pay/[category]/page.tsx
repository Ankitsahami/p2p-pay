'use client';

import * as React from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, Droplets, Flame, Smartphone, Tv, Wifi, Car, CreditCard, Shield, Building2, GraduationCap, Home, ArrowLeft, Search, Loader2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useWallet } from '@/hooks/use-wallet';
import { useAuth } from '@/hooks/use-auth';
import { useUserStore } from '@/stores/user-store';
import { useThemeStore } from '@/stores/theme-store';
import { useWallets } from '@privy-io/react-auth';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';
import { createWalletClient, custom, createPublicClient, http, formatUnits, erc20Abi } from 'viem';
import { baseSepolia } from 'viem/chains';
import { BILL_CATEGORIES } from '@/lib/bill-categories';
import { BillService } from '@/services/bill-service';
import { PaymentService } from '@/services/payment-service';
import { formatCurrency, formatCrypto, generateId, getExplorerUrl } from '@/lib/utils';
import { USDC_ADDRESS } from '@/lib/constants';
import { type BillDetails, type PaymentQuote, type PaymentOrder, type PaymentOrderStatus } from '@/types';
import { createOrders } from '@p2pdotme/sdk/orders';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';

const rpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://sepolia.base.org';
const chainPublicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(rpcUrl),
});

export default function CategoryPayPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { walletAddress } = useAuth();
  const { deductBalance } = useWallet();
  const { saveBiller, preferences } = useUserStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const { wallets } = useWallets();
  const { client: smartWalletClient } = useSmartWallets();

  const categoryId = params.category as string;
  const activeUserAddress = walletAddress || '';
  const urlProviderId = searchParams.get('providerId');
  const urlConsumerNum = searchParams.get('consumerNumber');

  const category = React.useMemo(() => {
    return BILL_CATEGORIES.find((c) => c.id === categoryId);
  }, [categoryId]);

  // Form State
  const [providerId, setProviderId] = React.useState(urlProviderId || '');
  const [consumerNumber, setConsumerNumber] = React.useState(urlConsumerNum || '');
  const [isFetchingBill, setIsFetchingBill] = React.useState(false);
  const [billDetails, setBillDetails] = React.useState<BillDetails | null>(null);

  // Quote State
  const [isGettingQuote, setIsGettingQuote] = React.useState(false);
  const [quote, setQuote] = React.useState<PaymentQuote | null>(null);

  // Payment Execution State
  const [isPaying, setIsPaying] = React.useState(false);
  const [payStatus, setPayStatus] = React.useState<PaymentOrderStatus>('pending');
  const [escrowTxHash, setEscrowTxHash] = React.useState<string>('');

  // Interactive Escrow State Machine
  const [isEscrowModalOpen, setIsEscrowModalOpen] = React.useState(false);
  const [activeOrder, setActiveOrder] = React.useState<PaymentOrder | null>(null);
  const [escrowStep, setEscrowStep] = React.useState<
    'matching' | 'require_usdc_transfer' | 'authorizing_transfer' | 'settling' | 'completed' | 'failed'
  >('matching');
  const [merchantInfo, setMerchantInfo] = React.useState<{
    address: string;
    pubkey: string;
    amount: bigint;
  } | null>(null);
  const [upiTransferTxHash, setUpiTransferTxHash] = React.useState<string>('');
  const [walletClient, setWalletClient] = React.useState<any>(null);

  // On-chain balance validation
  const [onChainBalance, setOnChainBalance] = React.useState<string | null>(null);
  const [isBalanceSufficient, setIsBalanceSufficient] = React.useState(true);
  const [orderReceipt, setOrderReceipt] = React.useState<PaymentOrder | null>(null);

  // Back icon configuration
  const iconMap: Record<string, any> = {
    Zap, Droplets, Flame, Smartphone, Tv, Wifi, Car, CreditCard, Shield, Building2, GraduationCap, Home,
  };
  const Icon = category ? (iconMap[category.icon] || Zap) : Zap;

  // Dropdown list options
  const providerOptions = React.useMemo(() => {
    if (!category) return [];
    return category.providers.map((p) => ({
      value: p.id,
      label: p.name,
    }));
  }, [category]);

  const handleFetchBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !providerId || !consumerNumber) {
      toast.error('Please select provider and enter connection ID');
      return;
    }

    // Format validation
    const validation = BillService.validateConsumerNumber(category.id, consumerNumber);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid ID format');
      return;
    }

    setIsFetchingBill(true);
    setBillDetails(null);
    setQuote(null);

    try {
      const details = await BillService.fetchBill(providerId, consumerNumber);
      setBillDetails(details);
      
      // Fetch quote immediately after bill details are found
      setIsGettingQuote(true);
      const paymentQuote = await PaymentService.getQuote(details.amount, preferences.currency, 'USDC');
      setQuote(paymentQuote);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch bill. Please verify details.');
    } finally {
      setIsFetchingBill(false);
      setIsGettingQuote(false);
    }
  };

  // Fetch on-chain USDC balance when quote is loaded
  React.useEffect(() => {
    if (!quote || !activeUserAddress) return;
    let cancelled = false;

    const checkBalance = async () => {
      try {
        const rawBalance = await chainPublicClient.readContract({
          address: USDC_ADDRESS as `0x${string}`,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [activeUserAddress as `0x${string}`],
        });
        if (cancelled) return;
        const formatted = formatUnits(rawBalance, 6);
        setOnChainBalance(formatted);

        const totalRequired = parseFloat(quote.totalCrypto);
        const available = parseFloat(formatted);
        setIsBalanceSufficient(available >= totalRequired);
      } catch (err) {
        console.error('Error fetching on-chain balance:', err);
        if (!cancelled) {
          setOnChainBalance(null);
          setIsBalanceSufficient(true); // Don't block if we can't check
        }
      }
    };

    checkBalance();
    return () => { cancelled = true; };
  }, [quote, activeUserAddress]);

  // Poll order status when an active order is placed
  React.useEffect(() => {
    if (!activeOrder || escrowStep === 'completed' || escrowStep === 'failed') return;
    
    let cancelled = false;
    let pollInterval: NodeJS.Timeout;

    const GET_ORDER_ABI = [
      {
        type: 'function',
        name: 'getOrdersById',
        stateMutability: 'view',
        inputs: [{ name: 'orderId', type: 'uint256' }],
        outputs: [
          {
            type: 'tuple',
            components: [
              { name: 'amount', type: 'uint256' },
              { name: 'fiatAmount', type: 'uint256' },
              { name: 'placedTimestamp', type: 'uint256' },
              { name: 'completedTimestamp', type: 'uint256' },
              { name: 'userCompletedTimestamp', type: 'uint256' },
              { name: 'acceptedMerchant', type: 'address' },
              { name: 'user', type: 'address' },
              { name: 'recipientAddr', type: 'address' },
              { name: 'pubkey', type: 'string' },
              { name: 'encUpi', type: 'string' },
              { name: 'userCompleted', type: 'bool' },
              { name: 'status', type: 'uint8' },
              { name: 'orderType', type: 'uint8' },
              {
                name: 'disputeInfo',
                type: 'tuple',
                components: [
                  { name: 'raisedBy', type: 'uint8' },
                  { name: 'status', type: 'uint8' },
                  { name: 'redactTransId', type: 'uint256' },
                  { name: 'accountNumber', type: 'uint256' },
                ],
              },
              { name: 'id', type: 'uint256' },
              { name: 'userPubKey', type: 'string' },
              { name: 'encMerchantUpi', type: 'string' },
              { name: 'acceptedAccountNo', type: 'uint256' },
              { name: 'assignedAccountNos', type: 'uint256[]' },
              { name: 'currency', type: 'bytes32' },
              { name: 'preferredPaymentChannelConfigId', type: 'uint256' },
              { name: 'circleId', type: 'uint256' },
            ],
          },
        ],
      },
    ] as const;

    const diamondAddress = (process.env.NEXT_PUBLIC_P2P_DIAMOND_ADDRESS || '0xeb0BB8E3c014D915D9B2df03aBB130a1Fb44beb9') as `0x${string}`;

    const poll = async () => {
      try {
        const orderData = await chainPublicClient.readContract({
          address: diamondAddress,
          abi: GET_ORDER_ABI,
          functionName: 'getOrdersById',
          args: [BigInt(activeOrder.orderId)],
        });

        if (cancelled) return;

        if (orderData) {
          const contractStatus = orderData.status; // 0=PLACED, 1=ACCEPTED, 2=PAID, 3=COMPLETED, 4=CANCELLED
          
          let statusStr = '0';
          if (contractStatus === 1) statusStr = '1';
          else if (contractStatus === 2) statusStr = '2';
          else if (contractStatus === 3) statusStr = '5';
          else if (contractStatus === 4) statusStr = '6';

          console.log(`[Escrow Polling] Order ${activeOrder.orderId} contract status is ${contractStatus} -> mapped to ${statusStr}`);

          if (statusStr === '1') {
            if (orderData.pubkey) {
              setMerchantInfo({
                address: orderData.acceptedMerchant,
                pubkey: orderData.pubkey,
                amount: orderData.amount,
              });
              
              if (escrowStep === 'matching') {
                setEscrowStep('require_usdc_transfer');
              }
            }
          }

          if (statusStr === '2') {
            setEscrowStep('settling');
          }

          if (statusStr === '5') {
            setEscrowStep('completed');
            
            deductBalance('USDC', quote?.totalCrypto || '0');
            if (billDetails) {
              saveBiller({
                id: generateId('SB'),
                category: categoryId,
                provider: billDetails.provider,
                consumerNumber,
                consumerName: billDetails.consumerName,
                nickname: `${billDetails.provider.name} Dues`,
                lastPaidDate: new Date().toISOString().split('T')[0],
                lastPaidAmount: billDetails.amount,
              });
            }

            const finalOrder: PaymentOrder = {
              ...activeOrder,
              status: 'completed',
              completedAt: new Date().toISOString(),
            };
            setOrderReceipt(finalOrder);
            setIsEscrowModalOpen(false);
            toast.success('Bill paid successfully!');
          }

          if (statusStr === '6') {
            setEscrowStep('failed');
            toast.error('Order was cancelled by the network');
          }
        }
      } catch (err) {
        console.error('Error polling order status:', err);
      }
    };

    poll();
    pollInterval = setInterval(poll, 3000);

    return () => {
      cancelled = true;
      clearInterval(pollInterval);
    };
  }, [activeOrder, escrowStep, billDetails, quote, consumerNumber, providerId]);

  const handleAuthorizeTransfer = async () => {
    if (!activeOrder || !merchantInfo || !walletClient) return;

    setEscrowStep('authorizing_transfer');
    console.log(`[Escrow] Authorizing USDC transfer to escrow for order ${activeOrder.orderId}...`);

    try {
      const orders = createOrders({
        publicClient: chainPublicClient,
        diamondAddress: (process.env.NEXT_PUBLIC_P2P_DIAMOND_ADDRESS || '0xeb0BB8E3c014D915D9B2df03aBB130a1Fb44beb9') as `0x${string}`,
        usdcAddress: USDC_ADDRESS as `0x${string}`,
        subgraphUrl: process.env.NEXT_PUBLIC_P2P_SUBGRAPH_URL || '',
      });

      const providerUpi = `${billDetails?.provider.id || 'utility'}@upi`;
      
      const upiResult = await orders.setSellOrderUpi.execute({
        walletClient,
        orderId: BigInt(activeOrder.orderId),
        paymentAddress: providerUpi,
        merchantPublicKey: merchantInfo.pubkey,
        updatedAmount: merchantInfo.amount,
        waitForReceipt: true,
      });

      if (upiResult.isOk()) {
        console.log(`[Escrow] setSellOrderUpi succeeded. Tx hash: ${upiResult.value.hash}`);
        setUpiTransferTxHash(upiResult.value.hash);
        setEscrowTxHash(upiResult.value.hash);
        setEscrowStep('settling');
        toast.success('USDC locked in escrow successfully!');
      } else {
        console.error(`[Escrow] setSellOrderUpi failed:`, upiResult.error.message);
        toast.error(`Transfer failed: ${upiResult.error.message}`);
        setEscrowStep('require_usdc_transfer');
      }
    } catch (err: any) {
      console.error(`[Escrow] Error executing setSellOrderUpi:`, err);
      toast.error(`Transfer failed: ${err.message || 'Unknown error'}`);
      setEscrowStep('require_usdc_transfer');
    }
  };

  const handlePay = async () => {
    if (!billDetails || !quote || !activeUserAddress) return;

    setIsPaying(true);
    setPayStatus('pending');

    try {
      let walletClient = undefined;
      if (smartWalletClient) {
        walletClient = smartWalletClient;
      } else {
        const activeWallet = wallets.find(
          (w) => w.walletClientType === 'privy' || w.connectorType === 'embedded'
        );
        if (activeWallet) {
          const provider = await activeWallet.getEthereumProvider();
          walletClient = createWalletClient({
            account: activeWallet.address as `0x${string}`,
            chain: baseSepolia,
            transport: custom(provider),
          });
        }
      }

      setWalletClient(walletClient);

      const order = await PaymentService.initiateBillPayment(billDetails, quote, activeUserAddress, walletClient);
      if (order.txHash) {
        setEscrowTxHash(order.txHash);
      }

      setActiveOrder(order);
      setEscrowStep('matching');
      setIsEscrowModalOpen(true);
    } catch (err: any) {
      toast.error(err.message || 'Transaction failed');
      setPayStatus('failed');
    } finally {
      setIsPaying(false);
    }
  };

  if (!category) {
    return (
      <div className={cn("text-center py-12 text-xs font-semibold select-none", isDark ? "text-white/45" : "text-slate-500")}>
        Invalid category selected.
      </div>
    );
  }

  // 1. Render Final Receipt Screen if completed
  if (orderReceipt) {
    const formattedCompletedAt = (() => {
      const date = orderReceipt.completedAt ? new Date(orderReceipt.completedAt) : new Date();
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${day}/${month}/${year}, ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
    })();

    return (
      <div className="max-w-md mx-auto flex flex-col gap-6 select-none animate-fade-in">
        <Card className="p-6 md:p-8 flex flex-col gap-6 text-center">
          <div className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center mx-auto animate-scale-in border",
            isDark ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-100 text-emerald-600"
          )}>
            <Shield className="w-6 h-6" />
          </div>

          <div>
            <h3 className={cn("text-lg font-extrabold", isDark ? "text-white" : "text-slate-800")}>Payment Receipt</h3>
            <p className={cn("text-xs mt-1", isDark ? "text-white/40" : "text-slate-500")}>Provider transfer completed via escrow</p>
          </div>

          <div className={cn(
            "divide-y py-2 text-xs text-left flex flex-col gap-3 border-t border-b",
            isDark ? "divide-white/5 border-white/5" : "divide-slate-100 border-slate-100"
          )}>
            <div className="flex justify-between items-center pt-2">
              <span className={cn("font-semibold uppercase text-[9px] tracking-wider", isDark ? "text-white/40" : "text-slate-500")}>Order ID</span>
              <span className={cn("font-bold", isDark ? "text-white" : "text-slate-800")}>{orderReceipt.orderId}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className={cn("font-semibold uppercase text-[9px] tracking-wider", isDark ? "text-white/40" : "text-slate-500")}>Type</span>
              <span className={cn("font-bold uppercase", isDark ? "text-white" : "text-slate-800")}>Sell</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className={cn("font-semibold uppercase text-[9px] tracking-wider", isDark ? "text-white/40" : "text-slate-500")}>Amount</span>
              <span className={cn("font-bold", isDark ? "text-white" : "text-slate-800")}>{formatCrypto(quote?.totalCrypto || 0)} USDC</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className={cn("font-semibold uppercase text-[9px] tracking-wider", isDark ? "text-white/40" : "text-slate-500")}>Fee</span>
              <span className={cn("font-bold", isDark ? "text-white" : "text-slate-800")}>0.050000 USDC</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className={cn("font-semibold uppercase text-[9px] tracking-wider", isDark ? "text-white/40" : "text-slate-500")}>Utility Provider Received</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(billDetails?.amount || 0, preferences.currency)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className={cn("font-semibold uppercase text-[9px] tracking-wider", isDark ? "text-white/40" : "text-slate-500")}>Paid By</span>
              <span className={cn("font-mono font-bold", isDark ? "text-white/80" : "text-slate-800")}>{activeUserAddress ? `${activeUserAddress.slice(0, 6)}...${activeUserAddress.slice(-4)}` : 'Smart Account'}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className={cn("font-semibold uppercase text-[9px] tracking-wider", isDark ? "text-white/40" : "text-slate-500")}>Paid To (Merchant)</span>
              <span className={cn("font-bold flex flex-col items-end", isDark ? "text-white" : "text-slate-800")}>
                <span>Goofy Faucet Merchant</span>
                <span className={cn("font-mono text-[9px] font-normal", isDark ? "text-white/30" : "text-slate-400")}>0x350E...30F</span>
              </span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className={cn("font-semibold uppercase text-[9px] tracking-wider", isDark ? "text-white/40" : "text-slate-500")}>Completed In</span>
              <span className={cn("font-bold", isDark ? "text-white" : "text-slate-800")}>12s</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className={cn("font-semibold uppercase text-[9px] tracking-wider", isDark ? "text-white/40" : "text-slate-500")}>Completed At</span>
              <span className={cn("font-bold", isDark ? "text-white" : "text-slate-800")}>{formattedCompletedAt}</span>
            </div>
            {escrowTxHash && (
              <div className="flex flex-col gap-1 pt-2">
                <span className={cn("font-semibold uppercase text-[9px] tracking-wider", isDark ? "text-white/40" : "text-slate-500")}>Escrow Tx Hash</span>
                <a
                  href={getExplorerUrl(escrowTxHash)}
                  target="_blank"
                  rel="noreferrer"
                  className={cn("font-mono text-[10px] break-all", isDark ? "text-blue-400 hover:underline" : "text-blue-600 hover:underline")}
                >
                  {escrowTxHash}
                </a>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2.5">
            <Button variant="primary" className="w-full" onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => {
              setBillDetails(null);
              setQuote(null);
              setOrderReceipt(null);
              setConsumerNumber('');
            }}>
              Pay Another Bill
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("max-w-2xl mx-auto flex flex-col gap-6 select-none transition-colors duration-300", isDark ? "text-white" : "text-slate-800")}>
      {/* Back Header Nav */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/dashboard/pay')}
          className={cn(
            "p-2 rounded-xl border flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-sm",
            isDark
              ? "border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
              : "border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700"
          )}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2.5">
          <Icon className="w-5 h-5" style={{ color: category.color }} />
          <h2 className={cn("text-sm font-bold", isDark ? "text-white" : "text-slate-800")}>{category.name} Payment</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Form panel */}
        <Card className="p-5 flex flex-col gap-5">
          <h3 className={cn("text-xs font-bold uppercase tracking-wider", isDark ? "text-white/40" : "text-slate-600")}>Account Details</h3>

          <form onSubmit={handleFetchBill} className="flex flex-col gap-4">
            <Select
              label="Provider Operator"
              options={providerOptions}
              value={providerId}
              onChange={setProviderId}
              placeholder="Select Distributor"
            />

            <Input
              label={category.consumerNumberLabel}
              placeholder={category.consumerNumberPlaceholder}
              value={consumerNumber}
              onChange={(e) => setConsumerNumber(e.target.value)}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2 font-semibold"
              loading={isFetchingBill}
              disabled={!providerId || !consumerNumber}
            >
              Fetch Bill Details
            </Button>
          </form>
        </Card>

        {/* Bill summary panel */}
        <div className="flex flex-col gap-6">
          {isFetchingBill && (
            <Card className="p-8 flex flex-col items-center justify-center gap-4 text-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <span className={cn("text-xs font-semibold", isDark ? "text-white/50" : "text-slate-500")}>Retrieving provider dues records...</span>
            </Card>
          )}

          {!isFetchingBill && billDetails && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col gap-6"
            >
              {/* Dues breakdown details */}
              <Card className="p-5 flex flex-col gap-4">
                <h3 className={cn("text-xs font-bold uppercase tracking-wider", isDark ? "text-white/40" : "text-slate-600")}>Outstanding Dues</h3>

                <div className="flex flex-col gap-1">
                  <span className={cn("font-semibold uppercase text-[9px]", isDark ? "text-white/40" : "text-slate-500")}>Consumer Account</span>
                  <span className={cn("font-extrabold text-lg", isDark ? "text-white" : "text-slate-800")}>{billDetails.consumerName}</span>
                  <span className={cn("text-[10px] font-medium", isDark ? "text-white/50" : "text-slate-500")}>No. {billDetails.consumerNumber}</span>
                </div>

                <div className={cn("flex justify-between items-end border-t pt-3 mt-1", isDark ? "border-white/5" : "border-slate-100")}>
                  <div className="flex flex-col">
                    <span className={cn("font-semibold uppercase text-[9px]", isDark ? "text-white/40" : "text-slate-500")}>Due Date</span>
                    <span className={cn("text-xs font-bold mt-0.5", isDark ? "text-white" : "text-slate-800")}>{billDetails.dueDate}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={cn("font-semibold uppercase text-[9px]", isDark ? "text-white/40" : "text-slate-500")}>Amount Dues</span>
                    <span className={cn("text-xl font-black mt-0.5", isDark ? "text-white" : "text-slate-800")}>
                      {formatCurrency(billDetails.amount, preferences.currency)}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Conversion rate card */}
              {isGettingQuote && (
                <Card className="p-6 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
                  <span className={cn("text-[10px]", isDark ? "text-white/40" : "text-slate-500")}>Locking conversion exchange rates...</span>
                </Card>
              )}

              {!isGettingQuote && quote && (
                <Card className={cn(
                  "p-5 flex flex-col gap-4 border",
                  isDark
                    ? "bg-gradient-to-br from-blue-950/20 to-black border-white/[0.08]"
                    : "bg-gradient-to-br from-blue-50/50 to-white border-blue-100"
                )}>
                  <h3 className={cn("text-xs font-bold uppercase tracking-wider", isDark ? "text-white/40" : "text-slate-600")}>P2P Escrow Quotation</h3>

                  <div className="flex flex-col gap-2.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className={cn(isDark ? "text-white/40" : "text-slate-500")}>Equivalent Exchange Value</span>
                      <span className={cn("font-semibold", isDark ? "text-white" : "text-slate-800")}>{formatCrypto(quote.cryptoAmount)} USDC</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={cn(isDark ? "text-white/40" : "text-slate-500")}>Escrow Contract Fee</span>
                      <span className={cn("font-semibold", isDark ? "text-white" : "text-slate-800")}>+{quote.networkFee} USDC</span>
                    </div>
                    <div className={cn("flex justify-between items-center border-t pt-2.5 mt-1 font-semibold text-sm", isDark ? "border-white/5" : "border-slate-100")}>
                      <span className={isDark ? "text-white" : "text-slate-800"}>Total USDC Dues</span>
                      <span className="font-extrabold text-blue-600 dark:text-blue-400">{formatCrypto(quote.totalCrypto)} USDC</span>
                    </div>
                    {onChainBalance !== null && (
                      <div className={cn("flex justify-between items-center border-t pt-2 mt-1", isDark ? "border-white/5" : "border-slate-100")}>
                        <span className={cn(isDark ? "text-white/40" : "text-slate-500")}>Your Wallet Balance</span>
                        <span className={`font-semibold ${isBalanceSufficient ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                          {parseFloat(onChainBalance).toFixed(6)} USDC
                        </span>
                      </div>
                    )}

                    <p className={cn("text-[10px] leading-relaxed mt-2 text-center select-none", isDark ? "text-white/40" : "text-slate-500")}>
                      🔒 Escrow locks USDC on Base. Dues cleared via peer UPI transfer directly.
                    </p>
                  </div>

                  {!isBalanceSufficient && (
                    <div className={cn(
                      "flex items-center gap-2 px-3 py-2 border rounded-xl",
                      isDark
                        ? "bg-red-500/10 border-red-500/20 text-red-400"
                        : "bg-red-50 border border-red-200 text-red-600"
                    )}>
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <p className="text-[10px] leading-snug font-medium">
                        Insufficient USDC balance. You have {onChainBalance ? parseFloat(onChainBalance).toFixed(6) : '0'} USDC but need {quote.totalCrypto} USDC.
                        Please add more USDC to your wallet.
                      </p>
                    </div>
                  )}

                  <Button
                    variant="primary"
                    className="w-full mt-2 font-bold"
                    onClick={handlePay}
                    loading={isPaying}
                    disabled={!isBalanceSufficient}
                  >
                    {isPaying ? `State: ${payStatus}` : !isBalanceSufficient ? 'Insufficient USDC Balance' : 'Confirm & Settle Dues'}
                  </Button>
                </Card>
              )}
            </motion.div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isEscrowModalOpen}
        onClose={() => {
          if (escrowStep !== 'matching' && escrowStep !== 'require_usdc_transfer' && escrowStep !== 'failed') {
            toast.error('Payment is in progress. Please do not close this window.');
            return;
          }
          setIsEscrowModalOpen(false);
        }}
        title="Escrow Payment Status"
        size="md"
      >
        <div className={cn("flex flex-col gap-6 py-2", isDark ? "text-white/80" : "text-slate-700")}>
          <div className="text-center">
            <p className={cn("text-xs", isDark ? "text-white/50" : "text-slate-500")}>
              {escrowStep === 'matching' && 'Matching your order with an active utility merchant...'}
              {escrowStep === 'require_usdc_transfer' && 'Merchant matched! Please authorize the USDC transfer.'}
              {escrowStep === 'authorizing_transfer' && 'Authorizing USDC transfer via smart wallet...'}
              {escrowStep === 'settling' && 'USDC locked in escrow. Waiting for merchant to settle INR dues...'}
              {escrowStep === 'completed' && 'Dues settled! Payment completed successfully.'}
              {escrowStep === 'failed' && 'Escrow placement failed.'}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                ✓
              </div>
              <div className="flex flex-col">
                <span className={cn("text-xs font-bold", isDark ? "text-white" : "text-slate-800")}>1. Settle Lock Request</span>
                <span className={cn("text-[10px]", isDark ? "text-white/30" : "text-slate-400")}>Order successfully created on-chain</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                escrowStep === 'matching' 
                  ? 'bg-blue-500 text-white animate-pulse' 
                  : 'bg-emerald-500 text-white'
              }`}>
                {escrowStep === 'matching' ? '●' : '✓'}
              </div>
              <div className="flex flex-col">
                <span className={cn("text-xs font-bold", isDark ? "text-white" : "text-slate-800")}>2. Merchant Acceptance</span>
                <span className={cn("text-[10px]", isDark ? "text-white/30" : "text-slate-400")}>
                  {escrowStep === 'matching' ? 'Connecting to Goofy Faucet Merchant...' : 'Merchant accepted order'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                escrowStep === 'matching'
                  ? 'bg-slate-200 dark:bg-white/5 text-slate-400 dark:text-white/20'
                  : escrowStep === 'require_usdc_transfer'
                  ? 'bg-orange-500 text-white animate-bounce'
                  : escrowStep === 'authorizing_transfer'
                  ? 'bg-blue-500 text-white animate-pulse'
                  : 'bg-emerald-500 text-white'
              }`}>
                {escrowStep === 'matching' ? '3' : (escrowStep === 'require_usdc_transfer' || escrowStep === 'authorizing_transfer') ? '●' : '✓'}
              </div>
              <div className="flex flex-col">
                <span className={cn("text-xs font-bold", isDark ? "text-white" : "text-slate-800")}>3. Lock USDC in Escrow</span>
                <span className={cn("text-[10px]", isDark ? "text-white/30" : "text-slate-400")}>
                  {escrowStep === 'matching' && 'Awaiting step 2'}
                  {escrowStep === 'require_usdc_transfer' && 'Click the button below to authorize the transfer'}
                  {escrowStep === 'authorizing_transfer' && 'Please confirm the prompt in your wallet...'}
                  {(escrowStep !== 'matching' && escrowStep !== 'require_usdc_transfer' && escrowStep !== 'authorizing_transfer') && 'USDC successfully locked in escrow'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                escrowStep === 'settling'
                  ? 'bg-blue-500 text-white animate-pulse'
                  : escrowStep === 'completed'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 dark:bg-white/5 text-slate-400 dark:text-white/20'
              }`}>
                {escrowStep === 'completed' ? '✓' : escrowStep === 'settling' ? '●' : '4'}
              </div>
              <div className="flex flex-col">
                <span className={cn("text-xs font-bold", isDark ? "text-white" : "text-slate-800")}>4. Merchant Bill Settlement</span>
                <span className={cn("text-[10px]", isDark ? "text-white/30" : "text-slate-400")}>
                  {escrowStep === 'settling' ? 'Merchant is processing UPI payout of ₹' + (billDetails?.amount || 0) : escrowStep === 'completed' ? 'Merchant settled bill with provider' : 'Awaiting escrow lock'}
                </span>
              </div>
            </div>
          </div>

          {escrowStep === 'require_usdc_transfer' && (
            <div className={cn(
              "mt-2 p-4 border rounded-2xl flex flex-col gap-3 text-center animate-fade-in",
              isDark ? "bg-orange-500/10 border-orange-500/20" : "bg-orange-50 border border-orange-100"
            )}>
              <div className="text-xs">
                <p className={cn("font-semibold", isDark ? "text-white" : "text-slate-700")}>Authorize USDC Lock</p>
                <p className={cn("text-[10px] mt-0.5", isDark ? "text-white/40" : "text-slate-400")}>
                  Locks <span className={cn("font-bold", isDark ? "text-white" : "text-slate-800")}>{formatUnits(merchantInfo?.amount || BigInt(0), 6)} USDC</span> in the escrow contract.
                </p>
              </div>
              <Button
                variant="primary"
                className="w-full font-bold bg-orange-500 hover:bg-orange-600 border-none"
                onClick={handleAuthorizeTransfer}
              >
                Confirm & Settle Escrow
              </Button>
            </div>
          )}

          {escrowStep === 'authorizing_transfer' && (
            <div className={cn(
              "mt-2 p-4 border rounded-2xl text-center flex flex-col gap-2",
              isDark ? "bg-blue-500/10 border-blue-500/20" : "bg-blue-50 border border-blue-100"
            )}>
              <p className={cn("text-xs font-semibold", isDark ? "text-white" : "text-slate-700")}>Wallet Action Required</p>
              <p className={cn("text-[10px] leading-snug", isDark ? "text-white/40" : "text-slate-400")}>
                Please verify and sign the transaction prompt inside your smart wallet to complete the USDC lock transfer.
              </p>
            </div>
          )}

          {escrowStep === 'settling' && (
            <div className={cn(
              "mt-2 p-4 border rounded-2xl flex flex-col gap-2 text-center animate-fade-in",
              isDark ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border border-emerald-100"
            )}>
              <p className={cn("text-xs font-semibold", isDark ? "text-white" : "text-slate-700")}>Funding Locked Successfully</p>
              <p className={cn("text-[10px] leading-snug", isDark ? "text-white/40" : "text-slate-400")}>
                Escrow contract has locked the USDC. The merchant faucet bot is now paying ₹{billDetails?.amount || 0} to the utility provider. This usually takes 5-10 seconds.
              </p>
              {upiTransferTxHash && (
                <a
                  href={getExplorerUrl(upiTransferTxHash)}
                  target="_blank"
                  rel="noreferrer"
                  className={cn("font-mono text-[9px] break-all mt-1", isDark ? "text-blue-400 hover:underline" : "text-blue-600 hover:underline")}
                >
                  View Escrow Tx: {upiTransferTxHash}
                </a>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
