import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSolana } from "@/hooks/useSolana"
import { useEnhancedAuth } from "@/context/EnhancedAuthContext"
import { AlertCircle, CheckCircle, Loader2, Wallet as WalletIcon } from "lucide-react"
import { toast } from "sonner"

const formatAddress = (address: string | null) => {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-6)}`
}

export function WalletAuthCard() {
  const navigate = useNavigate()
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [isConnectingWallet, setIsConnectingWallet] = useState<string | null>(null)

  const { wallets, connected, publicKey, connect, disconnect, isConnecting } = useSolana()
  const { isWalletAuthenticated, signInWithWallet, signOut } = useEnhancedAuth()

  const handleConnect = async (walletName?: string) => {
    setIsConnectingWallet(walletName ?? "default")
    try {
      await connect(walletName)
      toast.success("Wallet connected")
    } catch (error: any) {
      if (error?.message) {
        toast.error(error.message)
      } else {
        toast.error("Unable to connect to wallet")
      }
    } finally {
      setIsConnectingWallet(null)
    }
  }

  const handleWalletAuth = async () => {
    setIsAuthenticating(true)
    try {
      await signInWithWallet()
      toast.success("Authenticated with wallet")
      navigate("/home")
    } catch (error: any) {
      if (error?.message) {
        toast.error(error.message)
      } else {
        toast.error("Wallet authentication failed")
      }
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success("Signed out")
    } catch (error: any) {
      toast.error(error?.message ?? "Unable to sign out")
    }
  }

  if (isWalletAuthenticated) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Wallet Connected
            </CardTitle>
            <Badge variant="outline" className="text-green-500">
              Authenticated
            </Badge>
          </div>
          <CardDescription>You're signed in with your Solana wallet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
            <p className="font-mono text-sm text-muted-foreground">{formatAddress(publicKey)}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/account")} className="flex-1">
              View Account
            </Button>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <WalletIcon className="h-5 w-5" />
          Sign in with Solana
        </CardTitle>
        <CardDescription>Connect and authenticate using your wallet</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!connected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>No wallet connected</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {wallets.length > 0 ? (
                wallets.map((wallet) => (
                  <Button
                    key={wallet.name}
                    variant="outline"
                    disabled={isConnecting || isConnectingWallet === wallet.name}
                    onClick={() => handleConnect(wallet.name)}
                  >
                    {isConnectingWallet === wallet.name || isConnecting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Connecting...
                      </span>
                    ) : (
                      wallet.name
                    )}
                  </Button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Install a Solana wallet such as Phantom or Solflare to continue.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
              <div className="mb-2 flex items-center gap-2 text-primary">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Wallet connected</span>
              </div>
              <p className="font-mono text-sm text-muted-foreground">{formatAddress(publicKey)}</p>
            </div>
            <Button className="w-full" disabled={isAuthenticating} onClick={handleWalletAuth}>
              {isAuthenticating ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Authenticating...
                </span>
              ) : (
                "Sign in with Solana"
              )}
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => disconnect()}>
              Disconnect
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
