import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMarketplaceStore } from '@/stores/marketplaceStore';
import { IPMarketplaceListing } from '@/types/ip-marketplace';
import { ShoppingCart, Gavel, Eye, Heart, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MarketplaceGridProps {
  onSelectListing: (listing: IPMarketplaceListing) => void;
  onPurchase: (listing: IPMarketplaceListing) => void;
}

export function MarketplaceGrid({ onSelectListing, onPurchase }: MarketplaceGridProps) {
  const { listings, filters } = useMarketplaceStore();

  const filteredListings = listings
    .filter((listing) => {
      if (listing.status !== 'active') return false;
      
      const matchesAssetType = filters.assetType === 'all' || listing.assetType === filters.assetType;
      const matchesListingType = filters.listingType === 'all' || listing.listingType === filters.listingType;
      const matchesSearch = !filters.searchQuery || 
        listing.assetName.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(filters.searchQuery.toLowerCase());
      
      return matchesAssetType && matchesListingType && matchesSearch;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'price_low':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price_high':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'ending_soon':
          if (a.auctionEndTime && b.auctionEndTime) {
            return new Date(a.auctionEndTime).getTime() - new Date(b.auctionEndTime).getTime();
          }
          return 0;
        case 'most_viewed':
          return b.views - a.views;
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const assetTypeColors: Record<string, string> = {
    full_rights: 'bg-purple-500',
    license: 'bg-blue-500',
    derivative_rights: 'bg-green-500',
    revenue_share: 'bg-orange-500',
  };

  const assetTypeLabels: Record<string, string> = {
    full_rights: 'Full Rights',
    license: 'License',
    derivative_rights: 'Derivative Rights',
    revenue_share: 'Revenue Share',
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {filteredListings.map((listing) => (
        <Card key={listing.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between mb-2">
              <Badge className={`${assetTypeColors[listing.assetType]}/10 text-${assetTypeColors[listing.assetType]}`}>
                {assetTypeLabels[listing.assetType]}
              </Badge>
              {listing.listingType === 'auction' && (
                <Badge variant="secondary">
                  <Gavel className="mr-1 h-3 w-3" />
                  Auction
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg line-clamp-1">{listing.assetName}</CardTitle>
            <CardDescription className="line-clamp-2">{listing.description}</CardDescription>
          </CardHeader>

          <CardContent className="pb-3 space-y-3">
            {listing.thumbnailUrl && (
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img 
                  src={listing.thumbnailUrl} 
                  alt={listing.assetName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex flex-wrap gap-1">
              {listing.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {listing.views}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {listing.favorites}
                </span>
              </div>
              {listing.auctionEndTime && (
                <span className="flex items-center gap-1 text-xs">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(listing.auctionEndTime), { addSuffix: true })}
                </span>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between items-center pt-3 border-t">
            <div>
              <div className="text-2xl font-bold">
                {listing.currentBid || listing.price} {listing.currency}
              </div>
              {listing.listingType === 'auction' && listing.bidCount && (
                <div className="text-xs text-muted-foreground">
                  {listing.bidCount} bid{listing.bidCount !== 1 ? 's' : ''}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectListing(listing)}
              >
                View Details
              </Button>
              <Button
                size="sm"
                onClick={() => onPurchase(listing)}
              >
                {listing.listingType === 'auction' ? (
                  <>
                    <Gavel className="mr-2 h-4 w-4" />
                    Place Bid
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Buy Now
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}

      {filteredListings.length === 0 && (
        <div className="col-span-full text-center py-12">
          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No listings found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or search criteria
          </p>
        </div>
      )}
    </div>
  );
}
