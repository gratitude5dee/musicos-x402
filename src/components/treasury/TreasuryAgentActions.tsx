'use client'

import { useState } from 'react'
import { useAgent } from '@/context/AgentContext'
import { useSolana } from '@/hooks/useSolana'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PaymentConfirmationDialog } from './PaymentConfirmationDialog'
import { Coins, Send } from 'lucide-react'
import { toast } from 'sonner'

const generateId = () =>
  globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)

export function TreasuryAgentActions() {
  const { activeAgent } = useAgent()
  const { walletAddress } = useSolana()
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [paymentData, setPaymentData] = useState({
    toWallet: '',
    amountSol: 0,
    memo: '',
    purpose: '',
  })

  const handleInitiatePayment = () => {
    if (!paymentData.toWallet.trim()) {
      toast.error('Please enter recipient wallet address')
      return
    }

    if (paymentData.amountSol <= 0) {
      toast.error('Amount must be greater than 0')
      return
    }

    if (!walletAddress) {
      toast.error('Wallet not connected')
      return
    }

    setShowConfirmation(true)
  }

  const handleConfirmPayment = async (confirmationToken: string, idempotencyKey: string) => {
    if (!activeAgent || !walletAddress) return

    const mcpServerUrl = import.meta.env.VITE_MCP_SERVER_URL || 'http://localhost:8974'
    const mcpBearerToken = import.meta.env.VITE_MCP_BEARER_TOKEN

    try {
      const response = await fetch(`${mcpServerUrl}/invoke`, {
        method: 'POST',
        headers: {
          Authorization: mcpBearerToken ? `Bearer ${mcpBearerToken}` : '',
          'Content-Type': 'application/json',
          'X-Correlation-Id': generateId(),
        },
        body: JSON.stringify({
          tool: 'wallet_transfer',
          input: {
            fromWallet: walletAddress,
            toWallet: paymentData.toWallet,
            amountSol: paymentData.amountSol,
            memo: paymentData.memo || 'MUSICOS-PAYMENT',
            confirmationToken,
            idempotencyKey,
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.error || 'Payment failed')
      }

      const result = await response.json()

      setPaymentData({
        toWallet: '',
        amountSol: 0,
        memo: '',
        purpose: '',
      })

      toast.success('Payment completed', {
        description: result?.output?.transactionSignature
          ? `Transaction signature: ${result.output.transactionSignature.slice(0, 16)}...`
          : 'Wallet transfer submitted',
      })
    } catch (error: any) {
      throw error
    }
  }

  if (!activeAgent || activeAgent.type !== 'treasury') {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Coins className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Select a Treasury Agent to manage payments</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Payment
          </CardTitle>
          <CardDescription>Execute secure Solana transfers via your Treasury Agent</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Wallet Address</Label>
            <Input
              id="recipient"
              placeholder="Enter Solana wallet address..."
              value={paymentData.toWallet}
              onChange={(event) =>
                setPaymentData((prev) => ({ ...prev, toWallet: event.target.value }))
              }
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (SOL)</Label>
            <Input
              id="amount"
              type="number"
              step="0.001"
              min="0"
              placeholder="0.00"
              value={paymentData.amountSol || ''}
              onChange={(event) =>
                setPaymentData((prev) => ({
                  ...prev,
                  amountSol: parseFloat(event.target.value) || 0,
                }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Limit: {activeAgent.spend_limit_sol} SOL per transaction
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose (Optional)</Label>
            <Input
              id="purpose"
              placeholder="e.g., License payment, royalty distribution"
              value={paymentData.purpose}
              onChange={(event) =>
                setPaymentData((prev) => ({ ...prev, purpose: event.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="memo">Transaction Memo (Optional)</Label>
            <Textarea
              id="memo"
              placeholder="Add a note for this transaction..."
              value={paymentData.memo}
              onChange={(event) =>
                setPaymentData((prev) => ({ ...prev, memo: event.target.value }))
              }
              rows={3}
              maxLength={120}
            />
            <p className="text-xs text-muted-foreground">
              {paymentData.memo.length}/120 characters
            </p>
          </div>

          <Button onClick={handleInitiatePayment} className="w-full" size="lg">
            <Send className="mr-2 h-4 w-4" />
            Initiate Payment
          </Button>
        </CardContent>
      </Card>

      <PaymentConfirmationDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        onConfirm={handleConfirmPayment}
        fromWallet={walletAddress || ''}
        toWallet={paymentData.toWallet}
        amountSol={paymentData.amountSol}
        memo={paymentData.memo}
        purpose={paymentData.purpose}
      />
    </>
  )
}
