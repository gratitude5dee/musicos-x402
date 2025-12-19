import React, { useState } from 'react';
import { type Address } from 'viem';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DollarSign, TrendingUp, Clock } from 'lucide-react';
import { ClaimableAmount } from '@/types/royalty';
import { formatUnits } from 'viem';
import { RoyaltyDistributionDashboard } from './RoyaltyDistributionDashboard';

interface RoyaltyClaimPanelProps {
  ipId: Address;
  royaltyVaultAddress: Address;
  claimableTokens: ClaimableAmount[];
  onClaim: (tokens: Address[]) => Promise<void>;
  onSnapshot: () => Promise<void>;
}

export function RoyaltyClaimPanel({
  ipId,
  royaltyVaultAddress,
  claimableTokens,
  onClaim,
  onSnapshot,
}: RoyaltyClaimPanelProps) {
  const [selectedTokens, setSelectedTokens] = useState<Set<Address>>(new Set());
  const [isClaiming, setIsClaiming] = useState(false);
  const [isSnapshotting, setIsSnapshotting] = useState(false);
  const [showDistribution, setShowDistribution] = useState(false);

  const toggleToken = (token: Address) => {
    const newSelection = new Set(selectedTokens);
    if (newSelection.has(token)) {
      newSelection.delete(token);
    } else {
      newSelection.add(token);
    }
    setSelectedTokens(newSelection);
  };

  const handleClaim = async () => {
    if (selectedTokens.size === 0) return;
    
    setIsClaiming(true);
    try {
      await onClaim(Array.from(selectedTokens));
      setSelectedTokens(new Set());
    } finally {
      setIsClaiming(false);
    }
  };

  const handleSnapshot = async () => {
    setIsSnapshotting(true);
    try {
      await onSnapshot();
    } finally {
      setIsSnapshotting(false);
    }
  };

  const totalUsdValue = claimableTokens
    .filter(t => selectedTokens.has(t.token))
    .reduce((sum, t) => sum + t.usdValue, 0);

  return (
    <Card className="p-6 glass-card border border-border/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-accent-green" />
            Claimable Royalties
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Select tokens to claim from your royalty vault
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDistribution(!showDistribution)}
          >
            {showDistribution ? 'View Claims' : 'Distribute'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSnapshot}
            disabled={isSnapshotting}
          >
            <Clock className="w-4 h-4 mr-2" />
            {isSnapshotting ? 'Creating...' : 'Snapshot'}
          </Button>
        </div>
      </div>

      {showDistribution ? (
        <div className="py-2">
          <RoyaltyDistributionDashboard />
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
        {claimableTokens.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-text-secondary">No claimable royalties available</p>
          </div>
        ) : (
          claimableTokens.map((token) => (
            <div
              key={token.token}
              className="flex items-center justify-between p-4 rounded-lg bg-background/50 hover:bg-background/70 transition-colors cursor-pointer"
              onClick={() => toggleToken(token.token)}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedTokens.has(token.token)}
                  onCheckedChange={() => toggleToken(token.token)}
                />
                <div>
                  <div className="font-medium text-text-primary">
                    {formatUnits(token.amount, 18)} {token.symbol}
                  </div>
                  <div className="text-sm text-text-secondary">
                    ≈ ${token.usdValue.toFixed(2)} USD
                  </div>
                </div>
              </div>
              <TrendingUp className="w-4 h-4 text-accent-green" />
            </div>
          ))
        )}
      </div>

      {selectedTokens.size > 0 && (
        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-text-secondary">Total Value</span>
            <span className="text-lg font-semibold text-text-primary">
              ${totalUsdValue.toFixed(2)}
            </span>
          </div>
          <Button
            className="w-full bg-primary hover:bg-primary/80"
            onClick={handleClaim}
            disabled={isClaiming}
          >
            {isClaiming ? 'Claiming...' : `Claim ${selectedTokens.size} Token${selectedTokens.size > 1 ? 's' : ''}`}
          </Button>
        </div>
      )}
        </>
      )}
    </Card>
  );
}
