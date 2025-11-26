import { create } from 'zustand';
import { type Address } from 'viem';
import {
  Dispute,
  DisputeTimeline,
  DisputeFilter,
  RaiseDisputeParams,
  DisputeEvidence,
} from '@/types/dispute';

interface DisputeStore {
  // Dispute lists
  activeDisputes: Dispute[];
  myDisputes: Dispute[];
  fetchDisputes: (filter?: DisputeFilter) => Promise<void>;
  
  // Current dispute
  selectedDispute: Dispute | null;
  disputeTimeline: DisputeTimeline[];
  loadDispute: (disputeId: string) => Promise<void>;
  
  // Actions
  raiseDispute: (params: RaiseDisputeParams) => Promise<string>;
  cancelDispute: (disputeId: string) => Promise<void>;
  resolveDispute: (disputeId: string) => Promise<void>;
  submitEvidence: (disputeId: string, evidence: File) => Promise<string>;
  
  // Evidence
  uploadToIPFS: (file: File) => Promise<string>;
  
  // UI state
  isLoading: boolean;
  error: Error | null;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
}

export const useDisputeStore = create<DisputeStore>((set, get) => ({
  // Initial state
  activeDisputes: [],
  myDisputes: [],
  selectedDispute: null,
  disputeTimeline: [],
  isLoading: false,
  error: null,

  // Fetch disputes with optional filters
  fetchDisputes: async (filter?: DisputeFilter) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Implement actual SDK/IPKit call
      // Mock data for now
      const mockDisputes: Dispute[] = [
        {
          id: '1',
          targetIpId: '0x1234' as Address,
          targetTag: 'PLAGIARISM',
          currentTag: 'INFRINGEMENT',
          arbitrationPolicy: '0xABC' as Address,
          evidenceHash: 'QmExample1',
          counterEvidenceHash: '',
          initiator: '0x5678' as Address,
          status: 'RAISED',
          disputeTimestamp: new Date().toISOString(),
          liveness: '3600',
          umaLink: 'https://uma.xyz/dispute/1',
          blockNumber: '12345678',
          transactionHash: '0xdef' as Address,
        },
      ];
      
      set({ 
        activeDisputes: mockDisputes,
        myDisputes: mockDisputes,
        isLoading: false 
      });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
    }
  },

  // Load single dispute details
  loadDispute: async (disputeId: string) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Implement actual SDK call
      const mockDispute: Dispute = {
        id: disputeId,
        targetIpId: '0x1234' as Address,
        targetTag: 'PLAGIARISM',
        currentTag: 'INFRINGEMENT',
        arbitrationPolicy: '0xABC' as Address,
        evidenceHash: 'QmExample1',
        counterEvidenceHash: '',
        initiator: '0x5678' as Address,
        status: 'RAISED',
        disputeTimestamp: new Date().toISOString(),
        liveness: '3600',
        umaLink: 'https://uma.xyz/dispute/1',
        blockNumber: '12345678',
        transactionHash: '0xdef' as Address,
      };

      const mockTimeline: DisputeTimeline[] = [
        {
          event: 'RAISED',
          timestamp: new Date(),
          actor: '0x5678' as Address,
          details: 'Dispute raised for plagiarism',
          txHash: '0xdef',
        },
      ];

      set({ 
        selectedDispute: mockDispute,
        disputeTimeline: mockTimeline,
        isLoading: false 
      });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
    }
  },

  // Raise a new dispute
  raiseDispute: async (params: RaiseDisputeParams) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Implement actual SDK call
      // Mock response
      const disputeId = Math.random().toString(36).substring(7);
      set({ isLoading: false });
      return disputeId;
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },

  // Cancel a dispute
  cancelDispute: async (disputeId: string) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Implement actual SDK call
      set({ isLoading: false });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },

  // Resolve a dispute
  resolveDispute: async (disputeId: string) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Implement actual SDK call
      set({ isLoading: false });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },

  // Submit evidence for a dispute
  submitEvidence: async (disputeId: string, evidence: File) => {
    set({ isLoading: true, error: null });
    try {
      const ipfsHash = await get().uploadToIPFS(evidence);
      // TODO: Submit evidence transaction
      set({ isLoading: false });
      return ipfsHash;
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },

  // Upload file to IPFS
  uploadToIPFS: async (file: File) => {
    // TODO: Implement actual IPFS/Pinata upload
    // Mock IPFS hash
    return 'Qm' + Math.random().toString(36).substring(2, 48);
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
