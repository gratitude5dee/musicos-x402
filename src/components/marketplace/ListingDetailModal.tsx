import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { IPMarketplaceListing } from '@/types/ip-marketplace';
import { useIPMarketplace } from '@/hooks/useIPMarketplace';
import { ShoppingCart, Gavel, Eye, Heart, Clock, User, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ListingDetailModalProps {
  listing: IPMarketplaceListing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ListingDetailModal({ listing, open, onOpenChange }: ListingDetailModalProps) {
  const { purchaseAsset, placeBid, isLoading } = useIPMarketplace();
  const [bidAmount, setBidAmount] = useState('');

  if (!listing) return null;

  const handlePurchase = async () => {
    const success = await purchaseAsset(listing.id);
    if (success) {
      onOpenChange(false);
    }
  };

  const handlePlaceBid = async () => {
    if (!bidAmount) return;
    const success = await placeBid(listing.id, bidAmount);
    if (success) {
      setBidAmount('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{listing.assetName}</DialogTitle>
              <DialogDescription className="mt-2">
                Listed by {listing.seller.substring(0, 6)}...{listing.seller.substring(listing.seller.length - 4)}
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                {listing.views}
              </Button>
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4 mr-2" />
                {listing.favorites}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image */}
          {listing.thumbnailUrl && (
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              <img 
                src={listing.thumbnailUrl} 
                alt={listing.assetName}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Price & Actions */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                {listing.listingType === 'auction' ? 'Current Bid' : 'Price'}
              </div>
              <div className="text-3xl font-bold">
                {listing.currentBid || listing.price} {listing.currency}
              </div>
              {listing.listingType === 'auction' && listing.bidCount && (
                <div className="text-sm text-muted-foreground mt-1">
                  {listing.bidCount} bid{listing.bidCount !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            <div className="space-y-2">
              {listing.listingType === 'auction' ? (
                <>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.001"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`Min ${listing.currentBid || listing.price}`}
                      className="w-32"
                    />
                    <Button onClick={handlePlaceBid} disabled={isLoading || !bidAmount}>
                      <Gavel className="mr-2 h-4 w-4" />
                      Place Bid
                    </Button>
                  </div>
                  {listing.auctionEndTime && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Ends {formatDistanceToNow(new Date(listing.auctionEndTime), { addSuffix: true })}
                    </div>
                  )}
                </>
              ) : (
                <Button size="lg" onClick={handlePurchase} disabled={isLoading}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Buy Now
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{listing.description}</p>
          </div>

          {/* Asset Details */}
          <div>
            <h3 className="font-semibold mb-3">Asset Details</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Asset Type</span>
                <Badge variant="secondary">{listing.assetType.replace('_', ' ')}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Listing Type</span>
                <Badge variant="secondary">{listing.listingType.replace('_', ' ')}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">IP ID</span>
                <span className="text-sm font-mono">
                  {listing.ipId.substring(0, 6)}...{listing.ipId.substring(listing.ipId.length - 4)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Listed</span>
                <span className="text-sm">
                  {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>

          {/* License Terms */}
          {listing.licenseTerms && (
            <div>
              <h3 className="font-semibold mb-3">License Terms</h3>
              <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                {listing.licenseTerms.duration && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Duration</span>
                    <span className="text-sm font-medium">{listing.licenseTerms.duration}</span>
                  </div>
                )}
                {listing.licenseTerms.territory && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Territory</span>
                    <span className="text-sm font-medium">{listing.licenseTerms.territory}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Exclusivity</span>
                  <Badge variant="outline">{listing.licenseTerms.exclusivity}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Commercial Use</span>
                  {listing.licenseTerms.commercialUse ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <span className="text-sm">Not allowed</span>
                  )}
                </div>
                {listing.licenseTerms.usageRights && listing.licenseTerms.usageRights.length > 0 && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Usage Rights</div>
                    <div className="flex flex-wrap gap-1">
                      {listing.licenseTerms.usageRights.map((right) => (
                        <Badge key={right} variant="secondary" className="text-xs">
                          {right}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {listing.tags.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {listing.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
