import { type Address } from 'viem';

export interface RoyaltyNode {
  ipId: Address;
  name: string;
  ownerAddress: Address;
  royaltyPolicy: Address;
  royaltyPercent: number; // basis points (100 = 1%)
  totalEarned: bigint;
  pendingRoyalties: bigint;
  currency: Address;
  children: RoyaltyNode[];
  parents: RoyaltyNode[];
  depth: number;
}

export interface RoyaltyFlow {
  fromIpId: Address;
  toIpId: Address;
  percentage: number;
  currency: Address;
  totalFlowed: bigint;
  flowType: 'LAP' | 'LRP'; // Liquid Absolute Percentage or Liquid Relative Percentage
}

export interface RoyaltyGraphState {
  nodes: RoyaltyNode[];
  flows: RoyaltyFlow[];
  selectedNode: Address | null;
  viewMode: 'tree' | 'force' | 'sankey';
  timeRange: 'day' | 'week' | 'month' | 'year' | 'all';
}

export interface ClaimableAmount {
  token: Address;
  symbol: string;
  amount: bigint;
  usdValue: number;
}

export interface RoyaltyHistoryEntry {
  timestamp: Date;
  ipId: Address;
  amount: bigint;
  token: Address;
  type: 'claimed' | 'distributed' | 'earned';
  txHash: string;
}

export interface ClaimRequest {
  royaltyVaultAddress: Address;
  snapshotIds: bigint[];
  token: Address;
}

export interface RoyaltySplit {
  ipId: Address;
  percentage: number;
  name?: string;
}
