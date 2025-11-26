import { type Address } from 'viem';

/**
 * Story Protocol contract addresses
 */

// Aeneid Testnet contracts
export const AENEID_CONTRACTS = {
  spgNftContract: '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc' as Address,
  // Add more contract addresses as needed
} as const;

// Mainnet contracts (placeholder - update with actual addresses)
export const MAINNET_CONTRACTS = {
  spgNftContract: '0x0000000000000000000000000000000000000000' as Address,
  // Add more contract addresses as needed
} as const;

export function getContracts(chainId: number) {
  switch (chainId) {
    case 1315: // Aeneid testnet
      return AENEID_CONTRACTS;
    case 1514: // Story mainnet
      return MAINNET_CONTRACTS;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
}
