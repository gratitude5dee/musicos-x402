import React, {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import { Connection, clusterApiUrl } from "@solana/web3.js"

type DetectedWallet = {
  name: string
  provider: SolanaWindowProvider
  icon?: string
}

type SolanaContextValue = {
  connection: Connection
  cluster: string
  rpcEndpoint: string
  connected: boolean
  publicKey: string | null
  walletName: string | null
  wallets: DetectedWallet[]
  isConnecting: boolean
  connect: (walletName?: string, options?: { onlyIfTrusted?: boolean }) => Promise<void>
  disconnect: () => Promise<void>
  copyAddress: () => Promise<void>
}

const SolanaContext = createContext<SolanaContextValue | undefined>(undefined)

const resolveClusterEndpoint = (cluster: string): string => {
  if (typeof window === "undefined") {
    return clusterApiUrl("devnet")
  }

  if (cluster === "mainnet-beta" || cluster === "testnet" || cluster === "devnet") {
    return clusterApiUrl(cluster as "mainnet-beta" | "testnet" | "devnet")
  }

  return clusterApiUrl("devnet")
}

const getWalletAddress = (provider: SolanaWindowProvider | null | undefined): string | null => {
  try {
    const key = provider?.publicKey
    if (!key) return null
    const address = typeof key === "string" ? key : key.toString()
    return address || null
  } catch (error) {
    console.warn("Unable to parse Solana wallet address", error)
    return null
  }
}

const detectWallets = (): DetectedWallet[] => {
  if (typeof window === "undefined") {
    return []
  }

  const discovered = new Map<string, DetectedWallet>()
  const addWallet = (name: string, provider: SolanaWindowProvider | undefined) => {
    if (!provider) return
    if (discovered.has(name)) return
    discovered.set(name, { name, provider })
  }

  const primary = window.solana
  if (primary) {
    if (primary.providers && Array.isArray(primary.providers)) {
      primary.providers.forEach((provider) => {
        if (provider?.isPhantom) addWallet("Phantom", provider)
        if (provider?.isBackpack) addWallet("Backpack", provider)
        if (provider?.isSolflare) addWallet("Solflare", provider)
      })
    } else {
      if (primary.isPhantom) addWallet("Phantom", primary)
      if (primary.isBackpack) addWallet("Backpack", primary)
      if (primary.isSolflare) addWallet("Solflare", primary)
    }
  }

  addWallet("Phantom", window.solana)
  addWallet("Solflare", window.solflare)
  addWallet("Backpack", window.backpack)

  return Array.from(discovered.values())
}

type WalletState = {
  provider: SolanaWindowProvider | null
  connected: boolean
  walletName: string | null
  address: string | null
}

const defaultState: WalletState = {
  provider: null,
  connected: false,
  walletName: null,
  address: null,
}

export const SolanaProvider = ({ children }: { children: ReactNode }) => {
  const cluster = import.meta.env.VITE_SOLANA_NETWORK || "devnet"
  const configuredEndpoint = import.meta.env.VITE_SOLANA_RPC_ENDPOINT as string | undefined
  const rpcEndpoint = configuredEndpoint || resolveClusterEndpoint(cluster)

  const connection = useMemo(() => new Connection(rpcEndpoint, "confirmed"), [rpcEndpoint])
  const [walletState, setWalletState] = useState<WalletState>(defaultState)
  const [wallets, setWallets] = useState<DetectedWallet[]>(() => detectWallets())
  const [isConnecting, setIsConnecting] = useState(false)

  const refreshWallets = useCallback(() => {
    setWallets(detectWallets())
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleReady = () => refreshWallets()
    window.addEventListener("load", handleReady)
    window.addEventListener("solana#initialized", handleReady as EventListener)

    return () => {
      window.removeEventListener("load", handleReady)
      window.removeEventListener("solana#initialized", handleReady as EventListener)
    }
  }, [refreshWallets])

  const handleConnected = useCallback((provider: SolanaWindowProvider, walletName: string | null) => {
    const address = getWalletAddress(provider)
    setWalletState({
      provider,
      connected: true,
      walletName,
      address,
    })
  }, [])

  const connect = useCallback<
    SolanaContextValue["connect"]
  >(async (walletName, options) => {
    const availableWallets = detectWallets()
    setWallets(availableWallets)

    const target = walletName
      ? availableWallets.find((wallet) => wallet.name === walletName)
      : availableWallets[0]

    if (!target) {
      throw new Error("No Solana wallet providers detected")
    }

    if (walletState.connected && walletState.walletName === target.name) {
      return
    }

    setIsConnecting(true)
    try {
      const response = await target.provider.connect({ onlyIfTrusted: options?.onlyIfTrusted })
      const providerPublicKey = response && "publicKey" in response ? response.publicKey : target.provider.publicKey
      if (!providerPublicKey) {
        throw new Error("Connected wallet did not provide a public key")
      }

      handleConnected(target.provider, target.name)
    } catch (error) {
      if ((error as any)?.code === 4001) {
        throw new Error("User rejected the connection request")
      }
      throw error
    } finally {
      setIsConnecting(false)
    }
  }, [handleConnected, walletState.connected, walletState.walletName])

  const disconnect = useCallback(async () => {
    try {
      await walletState.provider?.disconnect()
    } catch (error) {
      console.warn("Error disconnecting wallet", error)
    } finally {
      setWalletState(defaultState)
    }
  }, [walletState.provider])

  useEffect(() => {
    const provider = walletState.provider
    if (!provider?.on) return

    const onConnect = () => handleConnected(provider, walletState.walletName)
    const onDisconnect = () => setWalletState(defaultState)

    provider.on("connect", onConnect)
    provider.on("disconnect", onDisconnect)

    return () => {
      provider.off?.("connect", onConnect)
      provider.off?.("disconnect", onDisconnect)
    }
  }, [handleConnected, walletState.provider, walletState.walletName])

  const copyAddress = useCallback(async () => {
    if (!walletState.address) return
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(walletState.address)
      }
    } catch (error) {
      console.warn("Failed to copy wallet address", error)
    }
  }, [walletState.address])

  useEffect(() => {
    const autoConnect = import.meta.env.VITE_WALLET_AUTO_CONNECT === "true"
    if (!autoConnect || walletState.connected) return

    connect(undefined, { onlyIfTrusted: true }).catch(() => {
      /* silent */
    })
  }, [connect, walletState.connected])

  const value: SolanaContextValue = {
    connection,
    cluster,
    rpcEndpoint,
    connected: walletState.connected,
    publicKey: walletState.address,
    walletName: walletState.walletName,
    wallets,
    isConnecting,
    connect,
    disconnect,
    copyAddress,
  }

  return <SolanaContext.Provider value={value}>{children}</SolanaContext.Provider>
}

export const useSolanaContext = () => {
  const context = React.useContext(SolanaContext)
  if (!context) {
    throw new Error("useSolanaContext must be used within a SolanaProvider")
  }
  return context
}

export { SolanaContext }
