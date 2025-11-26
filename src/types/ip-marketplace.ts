export interface IPMarketplaceListing {
  id: string;
  ipId: string;
  assetName: string;
  assetType: 'full_rights' | 'license' | 'derivative_rights' | 'revenue_share';
  description: string;
  seller: string;
  price: string; // in ETH or IP tokens
  currency: 'ETH' | 'IP' | 'USDC';
  listingType: 'fixed_price' | 'auction' | 'offer';
  status: 'active' | 'sold' | 'cancelled' | 'expired';
  createdAt: string;
  expiresAt?: string;
  
  // Auction specific
  auctionEndTime?: string;
  currentBid?: string;
  bidCount?: number;
  
  // License specific
  licenseTerms?: LicenseTerms;
  
  // Metadata
  thumbnailUrl?: string;
  tags: string[];
  views: number;
  favorites: number;
}

export interface LicenseTerms {
  duration?: string;
  territory?: string;
  exclusivity: 'exclusive' | 'non-exclusive';
  usageRights: string[];
  royaltyPercentage?: number;
  commercialUse: boolean;
}

export interface MarketplaceBid {
  id: string;
  listingId: string;
  bidder: string;
  amount: string;
  currency: string;
  timestamp: string;
  status: 'active' | 'accepted' | 'rejected' | 'outbid';
}

export interface MarketplaceOffer {
  id: string;
  listingId: string;
  offerer: string;
  amount: string;
  currency: string;
  message?: string;
  timestamp: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

export interface MarketplaceTransaction {
  id: string;
  listingId: string;
  ipId: string;
  assetName: string;
  seller: string;
  buyer: string;
  price: string;
  currency: string;
  transactionHash: string;
  timestamp: string;
  type: 'sale' | 'license_grant' | 'rights_transfer';
}

export interface MarketplaceStats {
  totalListings: number;
  activeListings: number;
  totalVolume: string;
  averagePrice: string;
  topSellers: TopSeller[];
  recentSales: MarketplaceTransaction[];
}

export interface TopSeller {
  address: string;
  displayName?: string;
  totalSales: number;
  totalVolume: string;
}

export interface CreateListingParams {
  ipId: string;
  assetName: string;
  assetType: IPMarketplaceListing['assetType'];
  description: string;
  price: string;
  currency: IPMarketplaceListing['currency'];
  listingType: IPMarketplaceListing['listingType'];
  auctionDuration?: number; // in days
  licenseTerms?: LicenseTerms;
  tags?: string[];
}

export interface MarketplaceFilters {
  assetType?: IPMarketplaceListing['assetType'] | 'all';
  listingType?: IPMarketplaceListing['listingType'] | 'all';
  priceRange?: { min: number; max: number };
  sortBy: 'newest' | 'price_low' | 'price_high' | 'ending_soon' | 'most_viewed';
  searchQuery?: string;
}
