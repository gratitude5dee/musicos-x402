import { useMemo } from "react"
import { useSolanaContext } from "@/components/providers/SolanaProvider"

export function useSolana() {
  const context = useSolanaContext()

  const walletAddress = context.publicKey
  const shortAddress = useMemo(() => {
    if (!walletAddress) return null
    return `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
  }, [walletAddress])

  return {
    ...context,
    walletAddress,
    shortAddress,
    isConnected: context.connected,
  }
}
