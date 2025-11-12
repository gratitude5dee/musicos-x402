interface SolanaWindowProvider {
  isPhantom?: boolean
  isSolflare?: boolean
  isBackpack?: boolean
  publicKey?: {
    toString(): string
  }
  connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString(): string } } | void>
  disconnect: () => Promise<void>
  signMessage?: (message: Uint8Array, display?: any) => Promise<{ signature: Uint8Array } | Uint8Array>
  on?: (event: string, handler: (...args: any[]) => void) => void
  off?: (event: string, handler: (...args: any[]) => void) => void
}

declare global {
  interface Window {
    solana?: SolanaWindowProvider & { providers?: SolanaWindowProvider[] }
    solflare?: SolanaWindowProvider
    backpack?: SolanaWindowProvider
  }
}

export {}
