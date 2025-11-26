import { create } from 'zustand';
import { type Address } from 'viem';
import {
  RoyaltyGraphState,
  RoyaltyNode,
  ClaimableAmount,
  RoyaltyHistoryEntry,
  ClaimRequest,
} from '@/types/royalty';

interface RoyaltyStore extends RoyaltyGraphState {
  // Graph data
  setViewMode: (mode: 'tree' | 'force' | 'sankey') => void;
  selectNode: (ipId: Address | null) => void;
  setTimeRange: (range: 'day' | 'week' | 'month' | 'year' | 'all') => void;
  
  // Claims
  claimableRoyalties: Map<Address, ClaimableAmount[]>;
  fetchClaimable: (ipIds: Address[]) => Promise<void>;
  claimRoyalties: (claims: ClaimRequest[]) => Promise<string>;
  
  // Analytics
  royaltyHistory: RoyaltyHistoryEntry[];
  fetchHistory: (ipId: Address, range: 'day' | 'week' | 'month' | 'year' | 'all') => Promise<void>;
  
  // Loading states
  isLoading: boolean;
  error: Error | null;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
}

export const useRoyaltyStore = create<RoyaltyStore>((set, get) => ({
  // Initial state
  nodes: [],
  flows: [],
  selectedNode: null,
  viewMode: 'force',
  timeRange: 'month',
  claimableRoyalties: new Map(),
  royaltyHistory: [],
  isLoading: false,
  error: null,

  // Actions
  setViewMode: (mode) => set({ viewMode: mode }),
  
  selectNode: (ipId) => set({ selectedNode: ipId }),
  
  setTimeRange: (range) => set({ timeRange: range }),
  
  fetchClaimable: async (ipIds: Address[]) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Implement actual SDK call when connected
      // Mock data for now
      const mockClaimable = new Map<Address, ClaimableAmount[]>();
      ipIds.forEach(ipId => {
        mockClaimable.set(ipId, [
          {
            token: '0x0000000000000000000000000000000000000000' as Address,
            symbol: 'ETH',
            amount: BigInt(Math.floor(Math.random() * 1000000000000000000)),
            usdValue: Math.random() * 1000,
          },
        ]);
      });
      set({ claimableRoyalties: mockClaimable, isLoading: false });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
    }
  },
  
  claimRoyalties: async (claims: ClaimRequest[]) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Implement actual SDK call
      // Mock transaction hash
      const txHash = '0x' + Math.random().toString(16).substring(2, 66);
      set({ isLoading: false });
      return txHash;
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },
  
  fetchHistory: async (ipId: Address, range) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Implement actual data fetching
      // Mock history data
      const mockHistory: RoyaltyHistoryEntry[] = Array.from({ length: 10 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 86400000),
        ipId,
        amount: BigInt(Math.floor(Math.random() * 100000000000000000)),
        token: '0x0000000000000000000000000000000000000000' as Address,
        type: ['claimed', 'distributed', 'earned'][Math.floor(Math.random() * 3)] as any,
        txHash: '0x' + Math.random().toString(16).substring(2, 66),
      }));
      set({ royaltyHistory: mockHistory, isLoading: false });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
    }
  },
  
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
