import React, { createContext, useContext, ReactNode } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';
import { aeneidTestnet, storyMainnet } from './StoryClientContext';

// Create wagmi config
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

export const wagmiConfig = createConfig({
  chains: [aeneidTestnet, storyMainnet, mainnet, sepolia],
  connectors: [
    injected({ 
      shimDisconnect: true,
    }),
    walletConnect({ 
      projectId,
      showQrModal: true,
    }),
    coinbaseWallet({
      appName: 'UniversalAI IP Rights Management',
    }),
  ],
  transports: {
    [aeneidTestnet.id]: http(),
    [storyMainnet.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

interface EVMWalletProviderProps {
  children: ReactNode;
}

export function EVMWalletProvider({ children }: EVMWalletProviderProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
