import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VaultDashboard } from '@/components/vault/VaultDashboard';
import { AssetGrid } from '@/components/vault/AssetGrid';
import { AssetUploadDialog } from '@/components/vault/AssetUploadDialog';
import { PermissionsManager } from '@/components/vault/PermissionsManager';
import { useVaultStore } from '@/stores/vaultStore';
import { IPAsset } from '@/types/vault';
import { Plus, Search, LayoutDashboard, Grid3x3, FolderTree } from 'lucide-react';
import { StoryWalletConnect } from '@/components/wallet/StoryWalletConnect';

export default function IPVaultPage() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<IPAsset | null>(null);
  const { searchQuery, setSearchQuery, filterType, setFilterType } = useVaultStore();

  const handleSelectAsset = (asset: IPAsset) => {
    setSelectedAsset(asset);
    // Could open a detail view here
  };

  const handleManagePermissions = (asset: IPAsset) => {
    setSelectedAsset(asset);
    setPermissionsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">IP Vault</h1>
              <p className="text-muted-foreground">
                Secure storage for your intellectual property assets
              </p>
            </div>
            <StoryWalletConnect />
          </div>

          {/* Actions Bar */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Select value={filterType} onValueChange={(value) => setFilterType(value as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="copyright">Copyright</SelectItem>
                <SelectItem value="trademark">Trademark</SelectItem>
                <SelectItem value="patent">Patent</SelectItem>
                <SelectItem value="trade_secret">Trade Secret</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={() => setUploadDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Upload Asset
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList>
            <TabsTrigger value="dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="grid">
              <Grid3x3 className="mr-2 h-4 w-4" />
              All Assets
            </TabsTrigger>
            <TabsTrigger value="folders">
              <FolderTree className="mr-2 h-4 w-4" />
              Folders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <VaultDashboard />
          </TabsContent>

          <TabsContent value="grid" className="mt-6">
            <AssetGrid
              onSelectAsset={handleSelectAsset}
              onManagePermissions={handleManagePermissions}
            />
          </TabsContent>

          <TabsContent value="folders" className="mt-6">
            <div className="text-center py-12">
              <FolderTree className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Folder View Coming Soon</h3>
              <p className="text-sm text-muted-foreground">
                Organize your assets with folders and hierarchies
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <AssetUploadDialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen} />
      <PermissionsManager
        asset={selectedAsset}
        open={permissionsDialogOpen}
        onOpenChange={setPermissionsDialogOpen}
      />
    </div>
  );
}
