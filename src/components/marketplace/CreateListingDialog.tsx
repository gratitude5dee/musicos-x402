import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useIPMarketplace } from '@/hooks/useIPMarketplace';
import { CreateListingParams, IPMarketplaceListing, LicenseTerms } from '@/types/ip-marketplace';
import { Loader2, Plus } from 'lucide-react';

interface CreateListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ipAssets?: Array<{ id: string; name: string }>;
}

export function CreateListingDialog({ open, onOpenChange, ipAssets = [] }: CreateListingDialogProps) {
  const { createListing, isLoading } = useIPMarketplace();
  const [formData, setFormData] = useState<Partial<CreateListingParams>>({
    assetType: 'license',
    currency: 'ETH',
    listingType: 'fixed_price',
  });
  const [licenseTerms, setLicenseTerms] = useState<Partial<LicenseTerms>>({
    exclusivity: 'non-exclusive',
    commercialUse: false,
    usageRights: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.ipId || !formData.assetName || !formData.price) {
      return;
    }

    const params: CreateListingParams = {
      ipId: formData.ipId,
      assetName: formData.assetName,
      assetType: formData.assetType as IPMarketplaceListing['assetType'],
      description: formData.description || '',
      price: formData.price,
      currency: formData.currency as IPMarketplaceListing['currency'],
      listingType: formData.listingType as IPMarketplaceListing['listingType'],
      auctionDuration: formData.auctionDuration,
      licenseTerms: formData.assetType === 'license' ? licenseTerms as LicenseTerms : undefined,
      tags: formData.tags,
    };

    const result = await createListing(params);
    if (result) {
      onOpenChange(false);
      // Reset form
      setFormData({
        assetType: 'license',
        currency: 'ETH',
        listingType: 'fixed_price',
      });
      setLicenseTerms({
        exclusivity: 'non-exclusive',
        commercialUse: false,
        usageRights: [],
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Marketplace Listing</DialogTitle>
          <DialogDescription>
            List your IP asset or license for sale on the marketplace
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ipId">IP Asset *</Label>
              <Select
                value={formData.ipId}
                onValueChange={(value) => setFormData({ ...formData, ipId: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select IP asset" />
                </SelectTrigger>
                <SelectContent>
                  {ipAssets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assetType">Asset Type *</Label>
              <Select
                value={formData.assetType}
                onValueChange={(value) => setFormData({ ...formData, assetType: value as any })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_rights">Full Rights Transfer</SelectItem>
                  <SelectItem value="license">License Grant</SelectItem>
                  <SelectItem value="derivative_rights">Derivative Rights</SelectItem>
                  <SelectItem value="revenue_share">Revenue Share</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assetName">Listing Title *</Label>
            <Input
              id="assetName"
              value={formData.assetName}
              onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
              placeholder="e.g., Midnight Dreams - Commercial License"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what's included in this listing..."
              rows={4}
              required
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="listingType">Listing Type *</Label>
              <Select
                value={formData.listingType}
                onValueChange={(value) => setFormData({ ...formData, listingType: value as any })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed_price">Fixed Price</SelectItem>
                  <SelectItem value="auction">Auction</SelectItem>
                  <SelectItem value="offer">Open to Offers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.001"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value as any })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ETH">ETH</SelectItem>
                  <SelectItem value="IP">IP</SelectItem>
                  <SelectItem value="USDC">USDC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.listingType === 'auction' && (
            <div className="space-y-2">
              <Label htmlFor="auctionDuration">Auction Duration (days) *</Label>
              <Input
                id="auctionDuration"
                type="number"
                value={formData.auctionDuration}
                onChange={(e) => setFormData({ ...formData, auctionDuration: parseInt(e.target.value) })}
                placeholder="7"
                required
                disabled={isLoading}
              />
            </div>
          )}

          {formData.assetType === 'license' && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium">License Terms</h4>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Input
                    value={licenseTerms.duration}
                    onChange={(e) => setLicenseTerms({ ...licenseTerms, duration: e.target.value })}
                    placeholder="e.g., 1 year, perpetual"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Territory</Label>
                  <Input
                    value={licenseTerms.territory}
                    onChange={(e) => setLicenseTerms({ ...licenseTerms, territory: e.target.value })}
                    placeholder="e.g., Worldwide, USA"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Exclusivity</Label>
                <Select
                  value={licenseTerms.exclusivity}
                  onValueChange={(value) => setLicenseTerms({ ...licenseTerms, exclusivity: value as any })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exclusive">Exclusive</SelectItem>
                    <SelectItem value="non-exclusive">Non-Exclusive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="commercialUse"
                  checked={licenseTerms.commercialUse}
                  onCheckedChange={(checked) => 
                    setLicenseTerms({ ...licenseTerms, commercialUse: checked as boolean })
                  }
                  disabled={isLoading}
                />
                <Label htmlFor="commercialUse" className="cursor-pointer">
                  Allow commercial use
                </Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Listing
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
