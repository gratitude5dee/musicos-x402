import { useState } from 'react';
import { useStoryProtocol } from './useStoryProtocol';
import { useMarketplaceStore } from '@/stores/marketplaceStore';
import { CreateListingParams, IPMarketplaceListing, MarketplaceBid } from '@/types/ip-marketplace';
import { useToast } from '@/hooks/use-toast';

export function useIPMarketplace() {
  const { license, ipAsset, isReady, address } = useStoryProtocol();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    listings,
    addListing,
    updateListing,
    addBid,
    addTransaction,
  } = useMarketplaceStore();

  /**
   * Create a new marketplace listing
   */
  const createListing = async (params: CreateListingParams): Promise<IPMarketplaceListing | null> => {
    if (!isReady || !address) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return null;
    }

    setIsLoading(true);

    try {
      // TODO: Integrate with Story Protocol marketplace smart contracts
      // Create listing on-chain
      
      const newListing: IPMarketplaceListing = {
        id: `listing-${Date.now()}`,
        ipId: params.ipId,
        assetName: params.assetName,
        assetType: params.assetType,
        description: params.description,
        seller: address,
        price: params.price,
        currency: params.currency,
        listingType: params.listingType,
        status: 'active',
        createdAt: new Date().toISOString(),
        expiresAt: params.auctionDuration
          ? new Date(Date.now() + params.auctionDuration * 24 * 60 * 60 * 1000).toISOString()
          : undefined,
        auctionEndTime: params.auctionDuration
          ? new Date(Date.now() + params.auctionDuration * 24 * 60 * 60 * 1000).toISOString()
          : undefined,
        licenseTerms: params.licenseTerms,
        tags: params.tags || [],
        views: 0,
        favorites: 0,
      };

      addListing(newListing);

      toast({
        title: 'Listing created',
        description: `${params.assetName} is now available on the marketplace`,
      });

      return newListing;
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: 'Failed to create listing',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Purchase an IP asset or license
   */
  const purchaseAsset = async (listingId: string): Promise<boolean> => {
    if (!isReady || !address) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return false;
    }

    const listing = listings.find((l) => l.id === listingId);
    if (!listing) {
      toast({
        title: 'Listing not found',
        variant: 'destructive',
      });
      return false;
    }

    setIsLoading(true);

    try {
      // TODO: Execute purchase transaction
      // - Transfer payment
      // - Transfer IP rights/license using Story Protocol
      // await license.mintLicense() or similar

      // Update listing status
      updateListing(listingId, { status: 'sold' });

      // Record transaction
      addTransaction({
        id: `tx-${Date.now()}`,
        listingId,
        ipId: listing.ipId,
        assetName: listing.assetName,
        seller: listing.seller,
        buyer: address,
        price: listing.price,
        currency: listing.currency,
        transactionHash: `0x${Math.random().toString(16).substring(2)}`,
        timestamp: new Date().toISOString(),
        type: listing.assetType === 'license' ? 'license_grant' : 'rights_transfer',
      });

      toast({
        title: 'Purchase successful',
        description: `You now own ${listing.assetName}`,
      });

      return true;
    } catch (error) {
      console.error('Error purchasing asset:', error);
      toast({
        title: 'Purchase failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Place a bid on an auction listing
   */
  const placeBid = async (listingId: string, amount: string): Promise<boolean> => {
    if (!isReady || !address) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return false;
    }

    const listing = listings.find((l) => l.id === listingId);
    if (!listing || listing.listingType !== 'auction') {
      toast({
        title: 'Invalid auction',
        variant: 'destructive',
      });
      return false;
    }

    setIsLoading(true);

    try {
      // TODO: Place bid on-chain
      
      const bid: MarketplaceBid = {
        id: `bid-${Date.now()}`,
        listingId,
        bidder: address,
        amount,
        currency: listing.currency,
        timestamp: new Date().toISOString(),
        status: 'active',
      };

      addBid(bid);

      // Update listing with new current bid
      updateListing(listingId, {
        currentBid: amount,
        bidCount: (listing.bidCount || 0) + 1,
      });

      toast({
        title: 'Bid placed',
        description: `Your bid of ${amount} ${listing.currency} has been placed`,
      });

      return true;
    } catch (error) {
      console.error('Error placing bid:', error);
      toast({
        title: 'Failed to place bid',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cancel a listing
   */
  const cancelListing = async (listingId: string): Promise<boolean> => {
    if (!isReady || !address) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return false;
    }

    setIsLoading(true);

    try {
      // TODO: Cancel listing on-chain
      
      updateListing(listingId, { status: 'cancelled' });

      toast({
        title: 'Listing cancelled',
        description: 'Your listing has been removed from the marketplace',
      });

      return true;
    } catch (error) {
      console.error('Error cancelling listing:', error);
      toast({
        title: 'Failed to cancel listing',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    listings,
    isLoading,
    isReady,
    createListing,
    purchaseAsset,
    placeBid,
    cancelListing,
  };
}
