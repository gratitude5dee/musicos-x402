import { useCallback } from "react"
import { useSolana } from "@/hooks/useSolana"
import { useEnhancedAuth } from "@/context/EnhancedAuthContext"

interface WalletTransferInput {
  toWallet: string
  amountSol: number
  memo?: string
}

const textEncoder = new TextEncoder()

const generateConfirmationToken = async (payload: Record<string, unknown>) => {
  const secret = import.meta.env.VITE_MCP_WALLET_CONFIRMATION_SECRET
  if (!secret) {
    throw new Error("Missing MCP wallet confirmation secret")
  }

  const data = textEncoder.encode(JSON.stringify(payload))
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )

  const signature = await crypto.subtle.sign("HMAC", key, data)
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

export const useMCPWalletIntegration = () => {
  const { walletAddress } = useEnhancedAuth()
  const { publicKey } = useSolana()

  const invokeMCPWalletTransfer = useCallback(
    async ({ toWallet, amountSol, memo }: WalletTransferInput) => {
      const activeWallet = walletAddress ?? publicKey
      if (!activeWallet) {
        throw new Error("No connected wallet available")
      }

      const payload = {
        fromWallet: activeWallet,
        toWallet,
        amountSol,
        memo,
      }

      const confirmationToken = await generateConfirmationToken(payload)

      const endpoint = import.meta.env.VITE_MCP_SERVER_URL
      const token = import.meta.env.VITE_MCP_BEARER_TOKEN

      if (!endpoint || !token) {
        throw new Error("Missing MCP server configuration")
      }

      const response = await fetch(`${endpoint}/invoke`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tool: "wallet_transfer",
          input: {
            ...payload,
            confirmationToken,
            idempotencyKey: crypto.randomUUID(),
          },
        }),
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(`MCP transfer failed: ${message || response.statusText}`)
      }

      return response.json()
    },
    [publicKey, walletAddress]
  )

  return {
    invokeMCPWalletTransfer,
  }
}
