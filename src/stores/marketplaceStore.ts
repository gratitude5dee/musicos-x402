import { create } from 'zustand';
import {
  IPMarketplaceListing,
  MarketplaceBid,
  MarketplaceOffer,
  MarketplaceTransaction,
  MarketplaceStats,
  MarketplaceFilters,
} from '@/types/ip-marketplace';

interface MarketplaceStore {
  // Listings
  listings: IPMarketplaceListing[];
  selectedListing: IPMarketplaceListing | null;
  myListings: IPMarketplaceListing[];
  
  // Bids & Offers
  bids: MarketplaceBid[];
  offers: MarketplaceOffer[];
  
  // Transactions
  transactions: MarketplaceTransaction[];
  
  // Stats
  stats: MarketplaceStats;
  
  // Filters
  filters: MarketplaceFilters;
  
  // Actions
  setListings: (listings: IPMarketplaceListing[]) => void;
  setSelectedListing: (listing: IPMarketplaceListing | null) => void;
  addListing: (listing: IPMarketplaceListing) => void;
  updateListing: (id: string, updates: Partial<IPMarketplaceListing>) => void;
  removeListing: (id: string) => void;
  
  setBids: (bids: MarketplaceBid[]) => void;
  addBid: (bid: MarketplaceBid) => void;
  
  setOffers: (offers: MarketplaceOffer[]) => void;
  addOffer: (offer: MarketplaceOffer) => void;
  updateOffer: (id: string, updates: Partial<MarketplaceOffer>) => void;
  
  setTransactions: (transactions: MarketplaceTransaction[]) => void;
  addTransaction: (transaction: MarketplaceTransaction) => void;
  
  setStats: (stats: MarketplaceStats) => void;
  setFilters: (filters: Partial<MarketplaceFilters>) => void;
}

// Mock data
const mockListings: IPMarketplaceListing[] = [
  {
    id: 'listing-1',
    ipId: '0x1234...5678',
    assetName: 'Midnight Dreams - Music Copyright',
    assetType: 'full_rights',
    description: 'Complete copyright ownership transfer for the song "Midnight Dreams". Includes all master rights, publishing, and derivative works.',
    seller: '0xabcd...efgh',
    price: '5.0',
    currency: 'ETH',
    listingType: 'fixed_price',
    status: 'active',
    createdAt: '2024-03-15T10:00:00Z',
    thumbnailUrl: 'https://placeholder.svg',
    tags: ['music', 'copyright', 'original'],
    views: 245,
    favorites: 18,
  },
  {
    id: 'listing-2',
    ipId: '0x5678...9012',
    assetName: 'Band Logo Usage Rights',
    assetType: 'license',
    description: 'Non-exclusive license for commercial use of our band logo in merchandise and promotional materials.',
    seller: '0x9876...5432',
    price: '0.5',
    currency: 'ETH',
    listingType: 'fixed_price',
    status: 'active',
    createdAt: '2024-03-16T14:30:00Z',
    licenseTerms: {
      duration: '1 year',
      territory: 'Worldwide',
      exclusivity: 'non-exclusive',
      usageRights: ['merchandise', 'marketing', 'social media'],
      commercialUse: true,
    },
    thumbnailUrl: 'https://placeholder.svg',
    tags: ['logo', 'license', 'branding'],
    views: 128,
    favorites: 9,
  },
  {
    id: 'listing-3',
    ipId: '0x3456...7890',
    assetName: 'Album Art NFT Collection',
    assetType: 'derivative_rights',
    description: 'Rights to create and sell derivative NFTs based on our album artwork. Includes 10% royalty on all secondary sales.',
    seller: '0xabcd...efgh',
    price: '2.5',
    currency: 'ETH',
    listingType: 'auction',
    status: 'active',
    createdAt: '2024-03-17T09:00:00Z',
    auctionEndTime: '2024-03-24T09:00:00Z',
    currentBid: '3.2',
    bidCount: 7,
    thumbnailUrl: 'https://placeholder.svg',
    tags: ['art', 'NFT', 'derivative'],
    views: 412,
    favorites: 34,
  },
];

const mockTransactions: MarketplaceTransaction[] = [
  {
    id: 'tx-1',
    listingId: 'listing-old-1',
    ipId: '0x9999...1111',
    assetName: 'Summer Vibes - License',
    seller: '0x1111...2222',
    buyer: '0x3333...4444',
    price: '1.5',
    currency: 'ETH',
    transactionHash: '0xabc123...',
    timestamp: '2024-03-14T16:20:00Z',
    type: 'license_grant',
  },
  {
    id: 'tx-2',
    listingId: 'listing-old-2',
    ipId: '0x8888...2222',
    assetName: 'Vintage Poster Rights',
    seller: '0x5555...6666',
    buyer: '0x7777...8888',
    price: '0.8',
    currency: 'ETH',
    transactionHash: '0xdef456...',
    timestamp: '2024-03-13T11:45:00Z',
    type: 'rights_transfer',
  },
];

const mockStats: MarketplaceStats = {
  totalListings: 127,
  activeListings: 89,
  totalVolume: '234.5',
  averagePrice: '2.63',
  topSellers: [
    { address: '0xabcd...efgh', displayName: 'MusicDAO', totalSales: 15, totalVolume: '45.2' },
    { address: '0x9876...5432', displayName: 'ArtistCollective', totalSales: 12, totalVolume: '38.7' },
  ],
  recentSales: mockTransactions,
};

export const useMarketplaceStore = create<MarketplaceStore>((set) => ({
  listings: mockListings,
  selectedListing: null,
  myListings: [],
  bids: [],
  offers: [],
  transactions: mockTransactions,
  stats: mockStats,
  filters: {
    assetType: 'all',
    listingType: 'all',
    sortBy: 'newest',
  },
  
  setListings: (listings) => set({ listings }),
  setSelectedListing: (listing) => set({ selectedListing: listing }),
  addListing: (listing) => set((state) => ({ 
    listings: [listing, ...state.listings],
    myListings: [listing, ...state.myListings],
  })),
  updateListing: (id, updates) => set((state) => ({
    listings: state.listings.map((l) => l.id === id ? { ...l, ...updates } : l),
  })),
  removeListing: (id) => set((state) => ({
    listings: state.listings.filter((l) => l.id !== id),
  })),
  
  setBids: (bids) => set({ bids }),
  addBid: (bid) => set((state) => ({ bids: [bid, ...state.bids] })),
  
  setOffers: (offers) => set({ offers }),
  addOffer: (offer) => set((state) => ({ offers: [offer, ...state.offers] })),
  updateOffer: (id, updates) => set((state) => ({
    offers: state.offers.map((o) => o.id === id ? { ...o, ...updates } : o),
  })),
  
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) => set((state) => ({
    transactions: [transaction, ...state.transactions],
  })),
  
  setStats: (stats) => set({ stats }),
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters },
  })),
}));
