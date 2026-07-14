'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { formatCurrency, getRelativeTime, getExplorerUrl, truncateAddress } from '@/lib/utils';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
  Receipt,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { createPublicClient, http, createWalletClient, custom } from 'viem';
import { baseSepolia } from 'viem/chains';
import { useWallets } from '@privy-io/react-auth';

// Diamond contract ABI for acceptOrder
const ACCEPT_ORDER_ABI = [
  {
    type: 'function',
    name: 'acceptOrder',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'orderId', type: 'uint256' },
      { name: 'pubKey', type: 'string' },
      { name: 'signature', type: 'string' },
    ],
    outputs: [],
  },
] as const;

// Order status mapping (from contract uint8)
const ORDER_STATUS: Record<number, string> = {
  0: 'PLACED',
  1: 'ACCEPTED',
  2: 'PAID',
  3: 'COMPLETED',
  4: 'CANCELLED',
  5: 'DISPUTED',
};

// Merchant's public key (used when accepting order)
const MERCHANT_PUBKEY = 'GoofyFaucetMerchant-PubKey-2025';
const DIAMOND_ADDRESS = (process.env.NEXT_PUBLIC_P2P_DIAMOND_ADDRESS ||
  '0xeb0BB8E3c014D915D9B2df03aBB130a1Fb44beb9') as `0x${string}`;
const SUBGRAPH_URL =
  process.env.NEXT_PUBLIC_P2P_SUBGRAPH_URL ||
  'https://api.studio.thegraph.com/query/1745491/event-indexer/v0.0.6';

const rpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://sepolia.base.org';

interface SubgraphOrder {
  orderId: string;
  type: number;
  status: number;
  userAddress: string;
  usdcAmount: string;
  fiatAmount: string;
  placedAt: string;
  acceptedAt: string;
  completedAt: string;
  cancelledAt: string;
  transactionHash: string;
}

interface OrderWithDetails extends SubgraphOrder {
  fiatAmountHuman: number;
  usdcAmountHuman: number;
  statusLabel: string;
  isActionable: boolean;
  acceptTxHash?: string;
  acceptState?: 'idle' | 'loading' | 'success' | 'error';
  acceptError?: string;
}

export default function AdminOrdersPage() {
  const { wallets } = useWallets();
  const [orders, setOrders] = React.useState<OrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState<OrderWithDetails | null>(null);
  const [lastFetched, setLastFetched] = React.useState<Date | null>(null);

  const fetchOrders = React.useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    try {
      const response = await fetch(SUBGRAPH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `{
            orders_collection(
              limit: 100,
              orderBy: "placedAt",
              orderDirection: "desc"
            ) {
              orderId
              type
              status
              userAddress
              usdcAmount
              fiatAmount
              placedAt
              acceptedAt
              completedAt
              cancelledAt
              transactionHash
            }
          }`,
        }),
      });
      const resJson = await response.json();
      const rawOrders: SubgraphOrder[] = resJson?.data?.orders_collection || [];

      setOrders((prev) => {
        const mapped: OrderWithDetails[] = rawOrders.map((o) => {
          const statusLabel = ORDER_STATUS[o.status] ?? `STATUS_${o.status}`;
          const fiatAmountHuman = (Number(o.fiatAmount) || 0) / 1e6;
          const usdcAmountHuman = (Number(o.usdcAmount) || 0) / 1e6;
          // Actionable = status 0 (PLACED) — these need merchant acceptance
          const isActionable = o.status === 0;

          // Preserve existing acceptState if we already accepted it
          const existing = prev.find((p) => p.orderId === o.orderId);

          return {
            ...o,
            fiatAmountHuman,
            usdcAmountHuman,
            statusLabel,
            isActionable,
            acceptState: existing?.acceptState ?? 'idle',
            acceptTxHash: existing?.acceptTxHash,
            acceptError: existing?.acceptError,
          };
        });
        return mapped;
      });
      setLastFetched(new Date());
    } catch (err) {
      console.error('Failed to fetch orders from subgraph:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchOrders();
    // Auto-refresh every 15 seconds
    const interval = setInterval(() => fetchOrders(true), 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleAcceptOrder = React.useCallback(
    async (order: OrderWithDetails) => {
      // Update state to loading
      setOrders((prev) =>
        prev.map((o) => (o.orderId === order.orderId ? { ...o, acceptState: 'loading', acceptError: undefined } : o))
      );
      setSelectedOrder((prev) =>
        prev?.orderId === order.orderId ? { ...prev, acceptState: 'loading', acceptError: undefined } : prev
      );

      try {
        // Get the embedded wallet from Privy
        const embeddedWallet = wallets.find((w) => w.walletClientType === 'privy');
        if (!embeddedWallet) {
          throw new Error('No embedded wallet found. Make sure you are logged in with an email/social account.');
        }

        await embeddedWallet.switchChain(baseSepolia.id);
        const provider = await embeddedWallet.getEthereumProvider();

        const walletClient = createWalletClient({
          account: embeddedWallet.address as `0x${string}`,
          chain: baseSepolia,
          transport: custom(provider),
        });

        const publicClient = createPublicClient({
          chain: baseSepolia,
          transport: http(rpcUrl),
        });

        const orderId = BigInt(order.orderId);

        console.log(`[Admin] Accepting order ${orderId} with pubkey "${MERCHANT_PUBKEY}"`);

        const txHash = await walletClient.writeContract({
          address: DIAMOND_ADDRESS,
          abi: ACCEPT_ORDER_ABI,
          functionName: 'acceptOrder',
          args: [orderId, MERCHANT_PUBKEY, ''],
        });

        console.log(`[Admin] acceptOrder tx sent: ${txHash}`);

        // Wait for receipt
        const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
        console.log(`[Admin] acceptOrder confirmed. Status: ${receipt.status}`);

        if (receipt.status === 'success') {
          setOrders((prev) =>
            prev.map((o) =>
              o.orderId === order.orderId
                ? { ...o, acceptState: 'success', acceptTxHash: txHash, status: 1, statusLabel: 'ACCEPTED', isActionable: false }
                : o
            )
          );
          setSelectedOrder((prev) =>
            prev?.orderId === order.orderId
              ? { ...prev, acceptState: 'success', acceptTxHash: txHash, status: 1, statusLabel: 'ACCEPTED', isActionable: false }
              : prev
          );
        } else {
          throw new Error('Transaction reverted on-chain');
        }
      } catch (err: any) {
        console.error('[Admin] acceptOrder failed:', err);
        const errMsg = err?.message || 'Transaction failed';
        setOrders((prev) =>
          prev.map((o) =>
            o.orderId === order.orderId ? { ...o, acceptState: 'error', acceptError: errMsg } : o
          )
        );
        setSelectedOrder((prev) =>
          prev?.orderId === order.orderId ? { ...prev, acceptState: 'error', acceptError: errMsg } : prev
        );
      }
    },
    [wallets]
  );

  const pendingOrders = orders.filter((o) => o.status === 0);

  const getStatusVariant = (status: number) => {
    if (status === 0) return 'warning';
    if (status === 1) return 'neutral';
    if (status === 2) return 'neutral';
    if (status === 3) return 'success';
    if (status === 4 || status === 5) return 'error';
    return 'neutral';
  };

  const getStatusIcon = (status: number, acceptState?: string) => {
    if (acceptState === 'loading') return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    if (status === 0) return <Clock className="w-4 h-4 text-amber-500" />;
    if (status === 1) return <ShieldCheck className="w-4 h-4 text-blue-500" />;
    if (status === 3) return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (status === 4 || status === 5) return <XCircle className="w-4 h-4 text-red-500" />;
    return <Receipt className="w-4 h-4 text-slate-400" />;
  };

  const formatTs = (ts: string) => {
    const n = Number(ts);
    if (!n) return '—';
    return new Date(n * 1000).toLocaleString();
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 select-none animate-fade-in text-slate-800">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-xs text-slate-500">
            {lastFetched ? `Last updated ${getRelativeTime(lastFetched.toISOString())}` : 'Loading...'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pendingOrders.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full animate-pulse">
              <Clock className="w-3.5 h-3.5" />
              {pendingOrders.length} Awaiting Acceptance
            </span>
          )}
          <button
            onClick={() => fetchOrders(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Pending Orders Section */}
      {!isLoading && pendingOrders.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Pending Acceptance ({pendingOrders.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pendingOrders.map((order) => (
              <Card
                key={order.orderId}
                className="p-5 bg-white border-2 border-amber-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all cursor-pointer group"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                      {getStatusIcon(order.status, order.acceptState)}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Order #{order.orderId}</span>
                      <p className="text-xs text-slate-400">{getRelativeTime(new Date(Number(order.placedAt) * 1000).toISOString())}</p>
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(order.status)} size="sm">
                    {order.statusLabel}
                  </Badge>
                </div>

                <div className="flex flex-col gap-1 mb-4">
                  <span className="text-lg font-extrabold text-slate-800">
                    {formatCurrency(order.fiatAmountHuman, 'INR')}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {order.usdcAmountHuman.toFixed(4)} USDC • Base Sepolia
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 truncate">
                    from {truncateAddress(order.userAddress, 6, 4)}
                  </span>
                </div>

                {order.acceptState === 'error' && (
                  <div className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-100 rounded-lg mb-3 text-[10px] text-red-600 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{order.acceptError}</span>
                  </div>
                )}

                <Button
                  variant="primary"
                  className="w-full text-xs font-bold h-9"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAcceptOrder(order);
                  }}
                  disabled={order.acceptState === 'loading' || order.acceptState === 'success'}
                >
                  {order.acceptState === 'loading' ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />Accepting...</>
                  ) : order.acceptState === 'success' ? (
                    <><CheckCircle2 className="w-3.5 h-3.5 mr-2" />Accepted!</>
                  ) : (
                    <><ShieldCheck className="w-3.5 h-3.5 mr-2" />Accept Order</>
                  )}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Orders Table */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">All Orders</h3>
        <Card className="overflow-hidden bg-white border border-slate-100 shadow-sm" padding="none">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <Receipt className="w-10 h-10" />
              <span className="text-sm font-semibold">No orders found on-chain</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 select-none">
                    <th className="p-4 font-bold">Order ID</th>
                    <th className="p-4 font-bold">User Wallet</th>
                    <th className="p-4 font-bold">Amount (INR)</th>
                    <th className="p-4 font-bold">USDC</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold">Placed At</th>
                    <th className="p-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr
                      key={order.orderId}
                      className="hover:bg-slate-50/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="p-4 font-bold text-slate-800">#{order.orderId}</td>
                      <td className="p-4 font-mono text-[10px] text-slate-500">
                        {truncateAddress(order.userAddress, 8, 6)}
                      </td>
                      <td className="p-4 font-bold text-slate-800">
                        {formatCurrency(order.fiatAmountHuman, 'INR')}
                      </td>
                      <td className="p-4 text-slate-600 font-semibold">
                        {order.usdcAmountHuman.toFixed(4)}
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-2">
                          {getStatusIcon(order.status, order.acceptState)}
                          <Badge variant={getStatusVariant(order.status)} size="sm">
                            {order.statusLabel}
                          </Badge>
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">
                        {getRelativeTime(new Date(Number(order.placedAt) * 1000).toISOString())}
                      </td>
                      <td className="p-4 text-right">
                        {order.isActionable ? (
                          <Button
                            variant="primary"
                            className="text-[11px] h-8 px-3 font-bold"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAcceptOrder(order);
                            }}
                            disabled={order.acceptState === 'loading'}
                          >
                            {order.acceptState === 'loading' ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              'Accept'
                            )}
                          </Button>
                        ) : order.acceptTxHash ? (
                          <a
                            href={getExplorerUrl(order.acceptTxHash)}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-[10px] text-blue-500 hover:underline font-semibold"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-3 h-3" />
                            Tx
                          </a>
                        ) : (
                          <span className="text-slate-300 text-[10px]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title="Order Details"
        size="md"
      >
        {selectedOrder && (
          <div className="flex flex-col gap-5 text-slate-800 select-none">
            <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
                {getStatusIcon(selectedOrder.status, selectedOrder.acceptState)}
              </div>
              <h4 className="text-xl font-extrabold text-slate-800">
                {formatCurrency(selectedOrder.fiatAmountHuman, 'INR')}
              </h4>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {selectedOrder.usdcAmountHuman.toFixed(6)} USDC
              </p>
              <Badge variant={getStatusVariant(selectedOrder.status)} size="md" className="mt-3">
                {selectedOrder.statusLabel}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-xs">
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Order ID</span>
                <span className="font-bold text-slate-800">#{selectedOrder.orderId}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Network</span>
                <span className="font-bold text-slate-800">Base Sepolia</span>
              </div>
              <div className="flex flex-col gap-1 col-span-2">
                <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">User Wallet</span>
                <span className="font-mono text-[10px] text-slate-700 select-all break-all">{selectedOrder.userAddress}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Placed At</span>
                <span className="font-bold text-slate-800">{formatTs(selectedOrder.placedAt)}</span>
              </div>
              {Number(selectedOrder.acceptedAt) > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Accepted At</span>
                  <span className="font-bold text-slate-800">{formatTs(selectedOrder.acceptedAt)}</span>
                </div>
              )}
              {Number(selectedOrder.completedAt) > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Completed At</span>
                  <span className="font-bold text-emerald-600">{formatTs(selectedOrder.completedAt)}</span>
                </div>
              )}
              <div className="col-span-2 flex flex-col gap-1 pt-1 border-t border-slate-100">
                <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Place Order Tx</span>
                <a
                  href={getExplorerUrl(selectedOrder.transactionHash)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[10px] text-blue-600 hover:underline break-all flex items-center gap-1"
                >
                  {selectedOrder.transactionHash}
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </a>
              </div>
              {selectedOrder.acceptTxHash && (
                <div className="col-span-2 flex flex-col gap-1 pt-1 border-t border-slate-100">
                  <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider">Accept Tx Hash</span>
                  <a
                    href={getExplorerUrl(selectedOrder.acceptTxHash)}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[10px] text-blue-600 hover:underline break-all flex items-center gap-1"
                  >
                    {selectedOrder.acceptTxHash}
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                </div>
              )}
            </div>

            {selectedOrder.acceptState === 'error' && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-semibold">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{selectedOrder.acceptError}</span>
              </div>
            )}

            {selectedOrder.isActionable && (
              <Button
                variant="primary"
                className="w-full font-bold"
                onClick={() => handleAcceptOrder(selectedOrder)}
                disabled={selectedOrder.acceptState === 'loading'}
              >
                {selectedOrder.acceptState === 'loading' ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />Sending acceptance transaction...</>
                ) : (
                  <><ShieldCheck className="w-4 h-4 mr-2" />Accept Order #{selectedOrder.orderId}</>
                )}
              </Button>
            )}

            <Button variant="secondary" className="w-full" onClick={() => setSelectedOrder(null)}>
              Close
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
