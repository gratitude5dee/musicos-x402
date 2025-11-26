import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useIPVault } from '@/hooks/useIPVault';
import { useVaultStore } from '@/stores/vaultStore';
import { IPAsset, AssetPermission } from '@/types/vault';
import { Shield, Trash2, Plus, Eye, Edit, Share, UserCog } from 'lucide-react';

interface PermissionsManagerProps {
  asset: IPAsset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PermissionsManager({ asset, open, onOpenChange }: PermissionsManagerProps) {
  const { grantPermission, revokePermission, isLoading } = useIPVault();
  const { permissions } = useVaultStore();
  const [newPermission, setNewPermission] = useState<{
    address: string;
    permission: AssetPermission['permission'];
  }>({
    address: '',
    permission: 'view',
  });

  const assetPermissions = asset ? permissions.filter((p) => p.assetId === asset.id) : [];

  const getPermissionIcon = (type: string) => {
    switch (type) {
      case 'view': return <Eye className="h-4 w-4" />;
      case 'edit': return <Edit className="h-4 w-4" />;
      case 'transfer': return <Share className="h-4 w-4" />;
      case 'admin': return <UserCog className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const permissionColors: Record<string, string> = {
    view: 'bg-blue-500',
    edit: 'bg-yellow-500',
    transfer: 'bg-orange-500',
    admin: 'bg-red-500',
  };

  const handleGrantPermission = async () => {
    if (!asset || !newPermission.address) return;

    const success = await grantPermission({
      assetId: asset.id,
      grantedTo: newPermission.address,
      permission: newPermission.permission,
    });

    if (success) {
      setNewPermission({ address: '', permission: 'view' });
    }
  };

  const handleRevokePermission = async (permissionId: string) => {
    await revokePermission(permissionId);
  };

  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Manage Permissions
          </DialogTitle>
          <DialogDescription>{asset.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Grant New Permission */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <h3 className="text-sm font-medium">Grant New Permission</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="address">Wallet Address</Label>
                <Input
                  id="address"
                  value={newPermission.address}
                  onChange={(e) => setNewPermission({ ...newPermission, address: e.target.value })}
                  placeholder="0x..."
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="permission">Permission Level</Label>
                <Select
                  value={newPermission.permission}
                  onValueChange={(value) =>
                    setNewPermission({ ...newPermission, permission: value as AssetPermission['permission'] })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View Only</SelectItem>
                    <SelectItem value="edit">Edit</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleGrantPermission} disabled={isLoading || !newPermission.address}>
              <Plus className="mr-2 h-4 w-4" />
              Grant Permission
            </Button>
          </div>

          {/* Existing Permissions */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Current Permissions</h3>
            {assetPermissions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No permissions granted yet
              </p>
            ) : (
              <div className="space-y-2">
                {assetPermissions.map((perm) => (
                  <div
                    key={perm.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                  <div className="flex items-center gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${permissionColors[perm.permission]}/10`}>
                        {getPermissionIcon(perm.permission)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium font-mono">
                          {perm.grantedTo.substring(0, 6)}...{perm.grantedTo.substring(perm.grantedTo.length - 4)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs capitalize">
                            {perm.permission}
                          </Badge>
                          {perm.expiresAt && (
                            <span className="text-xs text-muted-foreground">
                              Expires: {new Date(perm.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokePermission(perm.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Permission Levels Info */}
          <div className="p-4 bg-muted/30 rounded-lg space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">Permission Levels</h4>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• <strong>View:</strong> Can view asset details and files</li>
              <li>• <strong>Edit:</strong> Can modify asset metadata</li>
              <li>• <strong>Transfer:</strong> Can transfer asset ownership</li>
              <li>• <strong>Admin:</strong> Full control including permissions</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
