import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Wallet } from 'lucide-react';

export function StoryWalletConnect() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const shortenAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm text-muted-foreground">
          {chain?.name} · {shortenAddress(address)}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => disconnect()}
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="gap-2">
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Your Wallet</DialogTitle>
          <DialogDescription>
            Choose a wallet provider to connect to Story Protocol
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          {connectors.map((connector) => (
            <Button
              key={connector.id}
              variant="outline"
              size="lg"
              onClick={() => connect({ connector })}
              disabled={isPending}
              className="w-full justify-start gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wallet className="h-4 w-4" />
                </div>
                <span>{connector.name}</span>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
