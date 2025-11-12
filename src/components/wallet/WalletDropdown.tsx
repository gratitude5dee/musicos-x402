import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useSolana } from "@/hooks/useSolana"
import { useEnhancedAuth } from "@/context/EnhancedAuthContext"
import { toast } from "sonner"

const ellipsify = (value?: string | null, chars = 4) => {
  if (!value) return ""
  return `${value.slice(0, chars)}...${value.slice(-chars)}`
}

export function WalletDropdown() {
  const { wallets, connected, publicKey, walletName, connect, disconnect, copyAddress, isConnecting } = useSolana()
  const { isWalletAuthenticated, signOut } = useEnhancedAuth()

  const handleConnect = async (name?: string) => {
    try {
      await connect(name)
      toast.success("Wallet connected")
    } catch (error: any) {
      toast.error(error?.message ?? "Unable to connect to wallet")
    }
  }

  const handleCopy = async () => {
    await copyAddress()
    toast.success("Wallet address copied")
  }

  const handleDisconnect = async () => {
    if (isWalletAuthenticated) {
      await signOut()
    } else {
      await disconnect()
    }
    toast.success("Wallet disconnected")
  }

  const label = () => {
    if (connected && publicKey) {
      return ellipsify(publicKey)
    }
    if (walletName) {
      return walletName
    }
    return "Connect Wallet"
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isConnecting}>
          {isConnecting ? "Connecting..." : label()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {connected && publicKey ? (
          <>
            <DropdownMenuItem className="cursor-pointer" onClick={handleCopy}>
              Copy address
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={handleDisconnect}>
              {isWalletAuthenticated ? "Sign out & disconnect" : "Disconnect"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        ) : null}
        {wallets.length ? (
          wallets.map((wallet) => (
            <DropdownMenuItem key={wallet.name} className="cursor-pointer" onClick={() => handleConnect(wallet.name)}>
              {wallet.name}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem className="cursor-pointer" asChild>
            <a
              href="https://solana.com/ecosystem/explore?categories=wallet"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get a Solana wallet
            </a>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
