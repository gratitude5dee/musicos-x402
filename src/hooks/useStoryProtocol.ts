import { useStoryClient } from '@/context/StoryClientContext';
import { useAccount } from 'wagmi';

/**
 * Main hook for Story Protocol SDK operations
 * Provides access to all Story Protocol resource clients
 */
export function useStoryProtocol() {
  const { client, isReady, chainId } = useStoryClient();
  const { address, isConnected } = useAccount();

  return {
    // Story Protocol clients
    ipAsset: client?.ipAsset,
    royalty: client?.royalty,
    dispute: client?.dispute,
    license: client?.license,
    permission: client?.permission,
    ipAccount: client?.ipAccount,
    
    // Connection state
    isReady,
    isConnected,
    address,
    chainId,
    
    // Full client for advanced operations
    client,
  };
}
