'use client';

import * as React from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, Droplets, Flame, Smartphone, Tv, Wifi, Car, CreditCard, Shield, Building2, GraduationCap, Home, ArrowLeft, Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useWallet } from '@/hooks/use-wallet';
import { useAuth } from '@/hooks/use-auth';
import { useUserStore } from '@/stores/user-store';
import { useWallets } from '@privy-io/react-auth';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';
import { createWalletClient, custom } from 'viem';
import { baseSepolia } from 'viem/chains';
import { BILL_CATEGORIES } from '@/lib/bill-categories';
import { BillService } from '@/services/bill-service';
import { PaymentService } from '@/services/payment-service';
import { formatCurrency, formatCrypto, generateId, getExplorerUrl } from '@/lib/utils';
import { type BillDetails, type PaymentQuote, type PaymentOrder, type PaymentOrderStatus } from '@/types';

export default function CategoryPayPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { walletAddress } = useAuth();
  const { deductBalance } = useWallet();
  const { saveBiller, isBillerSaved, preferences } = useUserStore();
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

      // Create initial order details (escrow lock)
      const order = await PaymentService.initiateBillPayment(billDetails, quote, activeUserAddress, walletClient);
      if (order.txHash) {
        setEscrowTxHash(order.txHash);
      }

      // Simulate/Execute full on-chain status changes
      const finalOrder = await PaymentService.simulatePaymentStatus(order, (status, hash) => {
        setPayStatus(status);
        if (hash) setEscrowTxHash(hash);
      }, walletClient);

      // Deduct USDC balance upon successful payment
      deductBalance('USDC', quote.totalCrypto);

      // Save provider account automatically if not saved yet
      if (!isBillerSaved(providerId, consumerNumber)) {
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

      setOrderReceipt(finalOrder);
      toast.success('Bill paid successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Transaction failed');
      setPayStatus('failed');
    } finally {
      setIsPaying(false);
    }
  };

  if (!category) {
    return (
      <div className="text-center py-12 text-slate-500 text-xs font-semibold select-none">
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
        <Card className="p-6 md:p-8 flex flex-col gap-6 text-center border-slate-100 bg-white shadow-sm">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto animate-scale-in">
            <Shield className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-lg font-extrabold text-slate-800">Payment Receipt</h3>
            <p className="text-xs text-slate-500 mt-1">Provider transfer completed via escrow</p>
          </div>

          <div className="divide-y divide-slate-100 border-t border-b border-slate-100 py-2 text-xs text-left flex flex-col gap-3">
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Order ID</span>
              <span className="font-bold text-slate-800">{orderReceipt.orderId}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Type</span>
              <span className="font-bold text-slate-800 uppercase">Sell</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Amount</span>
              <span className="font-bold text-slate-800">{formatCrypto(quote?.totalCrypto || 0)} USDC</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Fee</span>
              <span className="font-bold text-slate-800">0.050000 USDC</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Utility Provider Received</span>
              <span className="font-bold text-emerald-600">{formatCurrency(billDetails?.amount || 0, preferences.currency)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Paid By</span>
              <span className="font-mono text-slate-800 font-bold">{activeUserAddress ? `${activeUserAddress.slice(0, 6)}...${activeUserAddress.slice(-4)}` : 'Smart Account'}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Paid To (Merchant)</span>
              <span className="font-bold text-slate-800 flex flex-col items-end">
                <span>Goofy Faucet Merchant</span>
                <span className="font-mono text-[9px] text-slate-400 font-normal">0x350E...30F</span>
              </span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Completed In</span>
              <span className="font-bold text-slate-800">12s</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Completed At</span>
              <span className="font-bold text-slate-800">{formattedCompletedAt}</span>
            </div>
            {escrowTxHash && (
              <div className="flex flex-col gap-1 pt-2">
                <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Escrow Tx Hash</span>
                <a
                  href={getExplorerUrl(escrowTxHash)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[10px] text-blue-600 hover:underline break-all"
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
    <div className="max-w-2xl mx-auto flex flex-col gap-6 select-none text-slate-800">
      {/* Back Header Nav */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/dashboard/pay')}
          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-slate-500 hover:text-slate-700 transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2.5">
          <Icon className="w-5 h-5" style={{ color: category.color }} />
          <h2 className="text-sm font-bold text-slate-800">{category.name} Payment</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Form panel */}
        <Card className="p-5 flex flex-col gap-5 bg-white border border-slate-100 shadow-sm">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Account Details</h3>

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
            <Card className="p-8 flex flex-col items-center justify-center gap-4 text-center bg-white border border-slate-100 shadow-sm">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <span className="text-xs text-slate-500 font-semibold">Retrieving provider dues records...</span>
            </Card>
          )}

          {!isFetchingBill && billDetails && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col gap-6"
            >
              {/* Dues breakdown details */}
              <Card className="p-5 flex flex-col gap-4 bg-white border border-slate-100 shadow-sm">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Outstanding Dues</h3>

                <div className="flex flex-col gap-1">
                  <span className="text-slate-500 font-semibold uppercase text-[9px]">Consumer Account</span>
                  <span className="font-extrabold text-lg text-slate-800">{billDetails.consumerName}</span>
                  <span className="text-[10px] text-slate-500 font-medium">No. {billDetails.consumerNumber}</span>
                </div>

                <div className="flex justify-between items-end border-t border-slate-100 pt-3 mt-1">
                  <div className="flex flex-col">
                    <span className="text-slate-500 font-semibold uppercase text-[9px]">Due Date</span>
                    <span className="text-xs font-bold text-slate-800 mt-0.5">{billDetails.dueDate}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-slate-500 font-semibold uppercase text-[9px]">Amount Dues</span>
                    <span className="text-xl font-black text-slate-800 mt-0.5">
                      {formatCurrency(billDetails.amount, preferences.currency)}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Conversion rate card */}
              {isGettingQuote && (
                <Card className="p-6 flex flex-col items-center justify-center gap-3 bg-white border border-slate-100 shadow-sm">
                  <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
                  <span className="text-[10px] text-slate-500">Locking conversion exchange rates...</span>
                </Card>
              )}

              {!isGettingQuote && quote && (
                <Card className="p-5 flex flex-col gap-4 bg-gradient-to-br from-blue-50/50 to-white border border-blue-100 shadow-sm bg-white">
                  <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">P2P Escrow Quotation</h3>

                  <div className="flex flex-col gap-2.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Equivalent Exchange Value</span>
                      <span className="font-semibold text-slate-800">{formatCrypto(quote.cryptoAmount)} USDC</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Escrow Contract Fee</span>
                      <span className="font-semibold text-slate-800">+{quote.networkFee} USDC</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-100 pt-2.5 mt-1 font-semibold text-sm">
                      <span className="text-slate-800">Total USDC Dues</span>
                      <span className="font-extrabold text-blue-600">{formatCrypto(quote.totalCrypto)} USDC</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed mt-2 text-center select-none">
                      🔒 Escrow locks USDC on Base. Dues cleared via peer UPI transfer directly.
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    className="w-full mt-2 font-bold"
                    onClick={handlePay}
                    loading={isPaying}
                  >
                    {isPaying ? `State: ${payStatus}` : 'Confirm & Settle Dues'}
                  </Button>
                </Card>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
