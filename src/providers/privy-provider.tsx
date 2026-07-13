'use client';

import * as React from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { baseSepolia } from 'viem/chains';

export const PrivyAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    console.error('NEXT_PUBLIC_PRIVY_APP_ID is not configured');
  }

  return (
    <PrivyProvider
      appId={appId || 'cmri1q7js00t40dl2kpmt6ayv'}
      config={{
        loginMethods: ['google', 'email'],
        appearance: {
          theme: 'light',
          accentColor: '#2563EB',
          showWalletLoginFirst: false,
        },
        defaultChain: baseSepolia,
        supportedChains: [baseSepolia],
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
};

export { usePrivy } from '@privy-io/react-auth';
