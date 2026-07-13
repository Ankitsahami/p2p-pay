'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { PrivyAuthProvider } from './privy-provider';
import { SdkProvider } from '@p2pdotme/sdk/react';
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const rpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://sepolia.base.org';
const diamondAddress = (process.env.NEXT_PUBLIC_P2P_DIAMOND_ADDRESS || '0xeb0BB8E3c014D915D9B2df03aBB130a1Fb44beb9') as `0x${string}`;
const usdcAddress = (process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x036CbD53842c5426634e7929541eC2318f3dCF7e') as `0x${string}`;
const subgraphUrl = process.env.NEXT_PUBLIC_P2P_SUBGRAPH_URL || '';

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(rpcUrl),
});

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <PrivyAuthProvider>
        <SdkProvider
          publicClient={publicClient}
          subgraphUrl={subgraphUrl}
          diamondAddress={diamondAddress}
          usdcAddress={usdcAddress}
        >
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#0d0d0d',
                color: '#F8FAFC',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#0d0d0d',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#0d0d0d',
                },
              },
            }}
          />
        </SdkProvider>
      </PrivyAuthProvider>
    </QueryClientProvider>
  );
};

