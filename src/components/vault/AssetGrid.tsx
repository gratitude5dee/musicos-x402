import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useVaultStore } from '@/stores/vaultStore';
import { IPAsset } from '@/types/vault';
import { FileText, Shield, Scale, Lock, MoreVertical, ExternalLink } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatBytes } from '@/lib/utils';

interface AssetGridProps {
  onSelectAsset: (asset: IPAsset) => void;
  onManagePermissions: (asset: IPAsset) => void;
}

export function AssetGrid({ onSelectAsset, onManagePermissions }: AssetGridProps) {
  const { assets, searchQuery, filterType } = useVaultStore();

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || asset.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const typeIcons: Record<string, React.ReactNode> = {
    copyright: <FileText className="h-5 w-5" />,
    trademark: <Shield className="h-5 w-5" />,
    patent: <Scale className="h-5 w-5" />,
    trade_secret: <Lock className="h-5 w-5" />,
    other: <FileText className="h-5 w-5" />,
  };

  const typeColors: Record<string, string> = {
    copyright: 'bg-blue-500',
    trademark: 'bg-purple-500',
    patent: 'bg-green-500',
    trade_secret: 'bg-orange-500',
    other: 'bg-gray-500',
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredAssets.map((asset) => (
        <Card key={asset.id} className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${typeColors[asset.type]}/10`}>
                  {typeIcons[asset.type]}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base line-clamp-1">{asset.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {new Date(asset.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onSelectAsset(asset)}>
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onManagePermissions(asset)}>
                    Manage Permissions
                  </DropdownMenuItem>
                  {asset.fileUrl && (
                    <DropdownMenuItem>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open File
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          
          <CardContent className="pb-3">
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {asset.description}
            </p>
            
            <div className="flex flex-wrap gap-1">
              {asset.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {asset.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{asset.tags.length - 3}
                </Badge>
              )}
            </div>
          </CardContent>

          <CardFooter className="pt-0 flex justify-between text-xs text-muted-foreground">
            <span className="capitalize">{asset.type.replace('_', ' ')}</span>
            {asset.fileSize && <span>{formatBytes(asset.fileSize)}</span>}
          </CardFooter>
        </Card>
      ))}

      {filteredAssets.length === 0 && (
        <div className="col-span-full text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No assets found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}
