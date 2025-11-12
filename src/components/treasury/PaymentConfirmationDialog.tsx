'use client'

import { useState } from 'react'
import { useAgent } from '@/context/AgentContext'
import { useSolana } from '@/hooks/useSolana'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertTriangle, Shield, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

interface PaymentConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (confirmationToken: string, idempotencyKey: string) => Promise<void>
  fromWallet: string
  toWallet: string
  amountSol: number
  memo?: string
  purpose?: string
}

const generateId = () =>
  globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)

export function PaymentConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  fromWallet,
  toWallet,
  amountSol,
  memo,
  purpose,
}: PaymentConfirmationDialogProps) {
  const { activeAgent } = useAgent()
  const { cluster } = useSolana()
  const [isConfirming, setIsConfirming] = useState(false)
  const [userConfirmation, setUserConfirmation] = useState('')

  const clusterLabel = typeof cluster === 'string'
    ? cluster.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
    : (cluster as any)?.label ?? 'Unknown'

  const generateConfirmationToken = async () => {
    const payload = {
      fromWallet,
      toWallet,
      amountSol,
      memo,
      timestamp: Date.now(),
    }

    const secret = import.meta.env.VITE_MCP_WALLET_CONFIRMATION_SECRET
    if (!secret) {
      throw new Error('Wallet confirmation secret not configured')
    }

    const cryptoApi = globalThis.crypto
    if (!cryptoApi?.subtle) {
      throw new Error('Web Crypto API is not available in this environment')
    }

    const encoder = new TextEncoder()
    const data = encoder.encode(JSON.stringify(payload))
    const keyData = encoder.encode(secret)

    const cryptoKey = await cryptoApi.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const signature = await cryptoApi.subtle.sign('HMAC', cryptoKey, data)

    return Array.from(new Uint8Array(signature))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')
  }

  const handleConfirm = async () => {
    if (amountSol > 1 && userConfirmation.toUpperCase() !== 'CONFIRM') {
      toast.error('Please type CONFIRM to proceed')
      return
    }

    setIsConfirming(true)

    try {
      const confirmationToken = await generateConfirmationToken()
      const idempotencyKey = `txn-${Date.now()}-${generateId()}`

      await onConfirm(confirmationToken, idempotencyKey)

      toast.success('Payment submitted successfully')
      onOpenChange(false)
      setUserConfirmation('')
    } catch (error: any) {
      console.error('Payment confirmation error:', error)
      toast.error('Payment failed', {
        description: error?.message || 'Failed to process payment',
      })
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-yellow-500" />
            Confirm Payment
          </DialogTitle>
          <DialogDescription>
            Review transaction details carefully before confirming
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {amountSol > 5 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This is a high-value transaction. Please review carefully.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <div className="grid grid-cols-[120px_1fr] gap-2 items-start">
              <Label className="text-muted-foreground">Agent:</Label>
              <div className="font-medium">{activeAgent?.name || 'Unknown'}</div>
            </div>

            <div className="grid grid-cols-[120px_1fr] gap-2 items-start">
              <Label className="text-muted-foreground">Network:</Label>
              <Badge variant="outline">{clusterLabel}</Badge>
            </div>

            <div className="grid grid-cols-[120px_1fr] gap-2 items-start">
              <Label className="text-muted-foreground">From:</Label>
              <div className="font-mono text-sm break-all">{fromWallet}</div>
            </div>

            <div className="flex items-center justify-center py-2">
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="grid grid-cols-[120px_1fr] gap-2 items-start">
              <Label className="text-muted-foreground">To:</Label>
              <div className="font-mono text-sm break-all">{toWallet}</div>
            </div>

            <div className="grid grid-cols-[120px_1fr] gap-2 items-start">
              <Label className="text-muted-foreground">Amount:</Label>
              <div className="text-2xl font-bold">{amountSol} SOL</div>
            </div>

            {purpose && (
              <div className="grid grid-cols-[120px_1fr] gap-2 items-start">
                <Label className="text-muted-foreground">Purpose:</Label>
                <div>{purpose}</div>
              </div>
            )}

            {memo && (
              <div className="grid grid-cols-[120px_1fr] gap-2 items-start">
                <Label className="text-muted-foreground">Memo:</Label>
                <div className="font-mono text-sm">{memo}</div>
              </div>
            )}
          </div>

          <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
            <p className="font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              Security Features
            </p>
            <ul className="space-y-1 text-xs text-muted-foreground ml-6">
              <li>• HMAC signature verification</li>
              <li>• Idempotency protection (prevents duplicate payments)</li>
              <li>• 10-minute confirmation token expiry</li>
              <li>• Transaction limit: {activeAgent?.spend_limit_sol || 10} SOL</li>
            </ul>
          </div>

          {amountSol > 1 && (
            <div className="space-y-2">
              <Label htmlFor="confirmation">
                Type <strong>CONFIRM</strong> to proceed
              </Label>
              <Input
                id="confirmation"
                value={userConfirmation}
                onChange={(event) => setUserConfirmation(event.target.value)}
                placeholder="CONFIRM"
                className="uppercase"
                disabled={isConfirming}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isConfirming}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isConfirming}>
            {isConfirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm Payment'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
