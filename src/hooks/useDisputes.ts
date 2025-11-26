import { useStoryProtocol } from './useStoryProtocol';
import { useDisputeStore } from '@/stores/disputeStore';
import { type Address } from 'viem';
import { RaiseDisputeParams } from '@/types/dispute';

/**
 * Hook for dispute operations
 * Combines IPKit queries with Story Protocol SDK operations
 */
export function useDisputes() {
  const { dispute, isReady } = useStoryProtocol();
  const store = useDisputeStore();

  const raiseDispute = async (params: RaiseDisputeParams) => {
    if (!dispute || !isReady) {
      throw new Error('Story Protocol client not ready');
    }

    // TODO: Update with correct SDK parameters when available
    // Current SDK may have different parameter names
    return await dispute.raiseDispute({
      targetIpId: params.targetIpId,
      disputeEvidenceHash: params.disputeEvidenceHash,
      targetTag: params.targetTag,
      data: params.data as `0x${string}` || '0x' as `0x${string}`,
    } as any); // Type assertion until SDK types are finalized
  };

  const cancelDispute = async (disputeId: bigint) => {
    if (!dispute || !isReady) {
      throw new Error('Story Protocol client not ready');
    }

    return await dispute.cancelDispute({
      disputeId,
      data: '0x' as `0x${string}`,
    });
  };

  const resolveDispute = async (disputeId: bigint) => {
    if (!dispute || !isReady) {
      throw new Error('Story Protocol client not ready');
    }

    return await dispute.resolveDispute({
      disputeId,
      data: '0x' as `0x${string}`,
    });
  };

  return {
    // Store state
    ...store,
    
    // SDK operations
    raiseDispute,
    cancelDispute,
    resolveDispute,
    
    // Connection status
    isReady,
  };
}
