export interface IPAsset {
  id: string;
  ipId: string;
  name: string;
  type: 'patent' | 'trademark' | 'copyright' | 'trade_secret' | 'other';
  description: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  thumbnailUrl?: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  owner: string;
  tags: string[];
  folderId?: string;
}

export interface VaultFolder {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  assetCount: number;
}

export interface AssetPermission {
  id: string;
  assetId: string;
  grantedTo: string;
  permission: 'view' | 'edit' | 'transfer' | 'admin';
  expiresAt?: string;
  createdAt: string;
}

export interface UploadProgress {
  assetId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

export interface VaultStats {
  totalAssets: number;
  totalSize: number;
  assetsByType: Record<string, number>;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'upload' | 'permission_granted' | 'permission_revoked' | 'asset_updated' | 'asset_deleted';
  assetId: string;
  assetName: string;
  actor: string;
  timestamp: string;
  details?: string;
}

export interface CreateAssetParams {
  name: string;
  type: IPAsset['type'];
  description: string;
  file?: File;
  metadata?: Record<string, any>;
  tags?: string[];
  folderId?: string;
}

export interface UpdatePermissionParams {
  assetId: string;
  grantedTo: string;
  permission: AssetPermission['permission'];
  expiresAt?: string;
}
