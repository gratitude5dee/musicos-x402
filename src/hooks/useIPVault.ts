import { useState } from 'react';
import { useStoryProtocol } from './useStoryProtocol';
import { useVaultStore } from '@/stores/vaultStore';
import { CreateAssetParams, UpdatePermissionParams, IPAsset } from '@/types/vault';
import { useToast } from '@/hooks/use-toast';

export function useIPVault() {
  const { ipAccount, permission, isReady, address } = useStoryProtocol();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    assets,
    addAsset,
    updateAsset,
    deleteAsset,
    addPermission,
    removePermission,
    uploadToIPFS,
    updateUploadProgress,
    removeUploadProgress,
  } = useVaultStore();

  /**
   * Create and register a new IP asset in the vault
   */
  const createAsset = async (params: CreateAssetParams): Promise<IPAsset | null> => {
    if (!isReady || !address) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return null;
    }

    setIsLoading(true);
    const assetId = `asset-${Date.now()}`;
    
    try {
      // Update progress: uploading
      updateUploadProgress({
        assetId,
        fileName: params.file?.name || params.name,
        progress: 0,
        status: 'uploading',
      });

      // Upload file to IPFS if provided
      let fileUrl: string | undefined;
      let fileType: string | undefined;
      let fileSize: number | undefined;

      if (params.file) {
        updateUploadProgress({
          assetId,
          fileName: params.file.name,
          progress: 30,
          status: 'uploading',
        });
        
        fileUrl = await uploadToIPFS(params.file);
        fileType = params.file.type;
        fileSize = params.file.size;
      }

      updateUploadProgress({
        assetId,
        fileName: params.file?.name || params.name,
        progress: 60,
        status: 'processing',
      });

      // TODO: Register IP asset using Story Protocol SDK
      // const ipId = await ipAsset.register({...});
      const mockIpId = `0x${Math.random().toString(16).substring(2, 10)}`;

      // Create asset record
      const newAsset: IPAsset = {
        id: assetId,
        ipId: mockIpId,
        name: params.name,
        type: params.type,
        description: params.description,
        fileUrl,
        fileType,
        fileSize,
        metadata: params.metadata || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        owner: address,
        tags: params.tags || [],
        folderId: params.folderId,
      };

      addAsset(newAsset);

      updateUploadProgress({
        assetId,
        fileName: params.file?.name || params.name,
        progress: 100,
        status: 'complete',
      });

      setTimeout(() => removeUploadProgress(assetId), 2000);

      toast({
        title: 'Asset created',
        description: `${params.name} has been added to your vault`,
      });

      return newAsset;
    } catch (error) {
      console.error('Error creating asset:', error);
      
      updateUploadProgress({
        assetId,
        fileName: params.file?.name || params.name,
        progress: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      toast({
        title: 'Failed to create asset',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Grant permission to access an IP asset
   */
  const grantPermission = async (params: UpdatePermissionParams): Promise<boolean> => {
    if (!isReady || !permission) {
      toast({
        title: 'SDK not ready',
        description: 'Please wait for the Story Protocol SDK to initialize',
        variant: 'destructive',
      });
      return false;
    }

    setIsLoading(true);

    try {
      // TODO: Use Story Protocol permission SDK
      // await permission.setPermission({...});
      
      // Mock implementation
      console.log('Granting permission:', params);

      const newPermission = {
        id: `perm-${Date.now()}`,
        assetId: params.assetId,
        grantedTo: params.grantedTo,
        permission: params.permission,
        expiresAt: params.expiresAt,
        createdAt: new Date().toISOString(),
      };

      addPermission(newPermission);

      toast({
        title: 'Permission granted',
        description: `${params.permission} access granted successfully`,
      });

      return true;
    } catch (error) {
      console.error('Error granting permission:', error);
      toast({
        title: 'Failed to grant permission',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Revoke permission from an IP asset
   */
  const revokePermission = async (permissionId: string): Promise<boolean> => {
    if (!isReady || !permission) {
      toast({
        title: 'SDK not ready',
        description: 'Please wait for the Story Protocol SDK to initialize',
        variant: 'destructive',
      });
      return false;
    }

    setIsLoading(true);

    try {
      // TODO: Use Story Protocol permission SDK
      // await permission.revokePermission({...});
      
      removePermission(permissionId);

      toast({
        title: 'Permission revoked',
        description: 'Access has been revoked successfully',
      });

      return true;
    } catch (error) {
      console.error('Error revoking permission:', error);
      toast({
        title: 'Failed to revoke permission',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update asset metadata
   */
  const updateAssetMetadata = async (
    assetId: string,
    updates: Partial<IPAsset>
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      updateAsset(assetId, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      toast({
        title: 'Asset updated',
        description: 'Asset information has been updated',
      });

      return true;
    } catch (error) {
      console.error('Error updating asset:', error);
      toast({
        title: 'Failed to update asset',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Delete an IP asset
   */
  const removeAsset = async (assetId: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      // TODO: Handle blockchain state cleanup if needed
      deleteAsset(assetId);

      toast({
        title: 'Asset deleted',
        description: 'Asset has been removed from your vault',
      });

      return true;
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast({
        title: 'Failed to delete asset',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    assets,
    isLoading,
    isReady,
    createAsset,
    grantPermission,
    revokePermission,
    updateAssetMetadata,
    removeAsset,
  };
}
