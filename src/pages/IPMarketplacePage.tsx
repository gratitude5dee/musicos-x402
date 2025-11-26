import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarketplaceGrid } from '@/components/marketplace/MarketplaceGrid';
import { MarketplaceStats } from '@/components/marketplace/MarketplaceStats';
import { CreateListingDialog } from '@/components/marketplace/CreateListingDialog';
import { ListingDetailModal } from '@/components/marketplace/ListingDetailModal';
import { useMarketplaceStore } from '@/stores/marketplaceStore';
import { useIPMarketplace } from '@/hooks/useIPMarketplace';
import { IPMarketplaceListing } from '@/types/ip-marketplace';
import { Plus, Search, ShoppingBag, TrendingUp, History } from 'lucide-react';
import { StoryWalletConnect } from '@/components/wallet/StoryWalletConnect';
import DashboardLayout from '@/layouts/dashboard-layout';
import { motion } from 'framer-motion';

export default function IPMarketplacePage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<IPMarketplaceListing | null>(null);
  const { filters, setFilters } = useMarketplaceStore();
  const { purchaseAsset } = useIPMarketplace();

  const handleSelectListing = (listing: IPMarketplaceListing) => {
    setSelectedListing(listing);
    setDetailModalOpen(true);
  };

  const handlePurchase = async (listing: IPMarketplaceListing) => {
    setSelectedListing(listing);
    setDetailModalOpen(true);
  };

  // Mock IP assets for the create listing dialog
  const mockIPAssets = [
    { id: '0x1234...5678', name: 'Midnight Dreams Copyright' },
    { id: '0x5678...9012', name: 'Band Logo Trademark' },
    { id: '0x9012...3456', name: 'Album Art Collection' },
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-[hsl(var(--text-primary))]">IP Marketplace</h1>
                <p className="text-[hsl(var(--text-secondary))]">
                  Trade IP rights, licenses, and derivative works
                </p>
              </div>
              <StoryWalletConnect />
            </div>

          {/* Stats */}
          <MarketplaceStats />

          {/* Actions Bar */}
          <div className="flex flex-wrap gap-3 items-center mt-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search listings..."
                  value={filters.searchQuery || ''}
                  onChange={(e) => setFilters({ searchQuery: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>

            <Select
              value={filters.assetType}
              onValueChange={(value) => setFilters({ assetType: value as any })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Asset type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full_rights">Full Rights</SelectItem>
                <SelectItem value="license">Licenses</SelectItem>
                <SelectItem value="derivative_rights">Derivative Rights</SelectItem>
                <SelectItem value="revenue_share">Revenue Share</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.listingType}
              onValueChange={(value) => setFilters({ listingType: value as any })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Listing type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Listings</SelectItem>
                <SelectItem value="fixed_price">Fixed Price</SelectItem>
                <SelectItem value="auction">Auctions</SelectItem>
                <SelectItem value="offer">Open to Offers</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.sortBy}
              onValueChange={(value) => setFilters({ sortBy: value as any })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="ending_soon">Ending Soon</SelectItem>
                <SelectItem value="most_viewed">Most Viewed</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Listing
            </Button>
          </div>
        </div>
      </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          <Tabs defaultValue="browse" className="w-full">
            <TabsList className="glass-card mb-6 w-fit">
              <TabsTrigger value="browse">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Browse Marketplace
              </TabsTrigger>
              <TabsTrigger value="trending">
                <TrendingUp className="mr-2 h-4 w-4" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="mr-2 h-4 w-4" />
                Recent Sales
              </TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <MarketplaceGrid
                  onSelectListing={handleSelectListing}
                  onPurchase={handlePurchase}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="trending" className="mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center py-12"
              >
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2 text-[hsl(var(--text-primary))]">Trending Listings Coming Soon</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))]">
                  Discover the most popular IP assets on the marketplace
                </p>
              </motion.div>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center py-12"
              >
                <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2 text-[hsl(var(--text-primary))]">Transaction History Coming Soon</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))]">
                  View recent sales and transaction history
                </p>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Dialogs */}
        <CreateListingDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          ipAssets={mockIPAssets}
        />
        <ListingDetailModal
          listing={selectedListing}
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
        />
      </div>
    </DashboardLayout>
  );
}
