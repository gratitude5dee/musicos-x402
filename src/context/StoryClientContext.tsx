import React, { createContext, useContext, ReactNode, useEffect, useMemo, useState } from 'react';
import type { StoryClient, StoryConfig } from '@story-protocol/core-sdk';
import { custom, type Chain } from 'viem';
import { useAccount, useWalletClient } from 'wagmi';

// Story Protocol chain configurations
export const aeneidTestnet: Chain = {
  id: 1315,
  name: 'Story Aeneid Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'IP',
    symbol: 'IP',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.rpc.story.foundation'],
    },
    public: {
      http: ['https://testnet.rpc.story.foundation'],
    },
  },
  blockExplorers: {
    default: { name: 'Story Explorer', url: 'https://testnet.explorer.story.foundation' },
  },
  testnet: true,
};

export const storyMainnet: Chain = {
  id: 1514,
  name: 'Story Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'IP',
    symbol: 'IP',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.story.foundation'],
    },
    public: {
      http: ['https://rpc.story.foundation'],
    },
  },
  blockExplorers: {
    default: { name: 'Story Explorer', url: 'https://explorer.story.foundation' },
  },
  testnet: false,
};

interface StoryClientContextValue {
  client: StoryClient | null;
  isReady: boolean;
  chainId: number;
}

const StoryClientContext = createContext<StoryClientContextValue | undefined>(undefined);

interface StoryClientProviderProps {
  children: ReactNode;
  chain?: 'testnet' | 'mainnet';
}

export function StoryClientProvider({ children, chain = 'testnet' }: StoryClientProviderProps) {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const storyChain = useMemo(() => (chain === 'testnet' ? aeneidTestnet : storyMainnet), [chain]);

  const [client, setClient] = useState<StoryClient | null>(null);

  // IMPORTANT: @story-protocol/core-sdk pulls in Node-only dotenv on import.
  // We dynamically import it ONLY when a wagmi wallet is actually connected.
  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!isConnected || !walletClient || !address) {
        setClient(null);
        return;
      }

      try {
        const { StoryClient } = await import('@story-protocol/core-sdk');

        const config: StoryConfig = {
          account: walletClient.account,
          transport: custom(walletClient.transport),
          chainId: chain === 'testnet' ? 'aeneid' : 'mainnet',
        };

        const nextClient = StoryClient.newClient(config);
        if (!cancelled) {
          setClient(nextClient);
        }
      } catch (error) {
        console.error('Failed to initialize Story Protocol client:', error);
        if (!cancelled) {
          setClient(null);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [isConnected, walletClient, address, chain]);

  const value: StoryClientContextValue = {
    client,
    isReady: !!client,
    chainId: storyChain.id,
  };

  return <StoryClientContext.Provider value={value}>{children}</StoryClientContext.Provider>;
}

export function useStoryClient() {
  const context = useContext(StoryClientContext);
  if (!context) {
    throw new Error('useStoryClient must be used within StoryClientProvider');
  }
  return context;
}

