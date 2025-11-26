import { type Address } from 'viem';

export interface Dispute {
  id: string;
  targetIpId: Address;
  targetTag: string; // e.g., "INFRINGEMENT", "LICENSE_VIOLATION"
  currentTag: string;
  arbitrationPolicy: Address;
  evidenceHash: string; // IPFS hash
  counterEvidenceHash: string;
  initiator: Address;
  status: 'RAISED' | 'IN_DISPUTE' | 'RESOLVED' | 'CANCELLED';
  disputeTimestamp: string;
  liveness: string; // UMA liveness period
  umaLink: string;
  blockNumber: string;
  transactionHash: string;
}

export interface DisputeEvidence {
  hash: string;
  ipfsUri: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document';
  title: string;
  description: string;
  uploadedBy: Address;
  timestamp: Date;
  fileSize?: number;
}

export interface DisputeTimeline {
  event: 'RAISED' | 'EVIDENCE_ADDED' | 'COUNTER_EVIDENCE' | 'DISPUTED' | 'SETTLED' | 'RESOLVED';
  timestamp: Date;
  actor: Address;
  details: string;
  txHash: string;
}

export interface RaiseDisputeParams {
  targetIpId: Address;
  disputeEvidenceHash: string;
  targetTag: string;
  bond: bigint;
  liveness: number;
  data?: string;
}

export interface DisputeFilter {
  status?: Dispute['status'];
  initiator?: Address;
  targetIpId?: Address;
  targetTag?: string;
}

export const DISPUTE_TAGS = [
  { value: 'PLAGIARISM', label: 'Plagiarism', description: 'Unauthorized copying of original work' },
  { value: 'UNAUTHORIZED_DERIVATIVE', label: 'Unauthorized Derivative', description: 'Derivative work without proper license' },
  { value: 'LICENSE_VIOLATION', label: 'License Violation', description: 'Breach of license terms' },
  { value: 'TRADEMARK_INFRINGEMENT', label: 'Trademark Infringement', description: 'Unauthorized use of trademarks' },
  { value: 'COPYRIGHT_INFRINGEMENT', label: 'Copyright Infringement', description: 'Violation of copyright protection' },
  { value: 'FALSE_ATTRIBUTION', label: 'False Attribution', description: 'Incorrect attribution of authorship' },
] as const;
