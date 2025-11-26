import { create } from 'zustand';
import { IPAsset, VaultFolder, AssetPermission, UploadProgress, VaultStats, ActivityItem } from '@/types/vault';

interface VaultStore {
  // Assets
  assets: IPAsset[];
  selectedAsset: IPAsset | null;
  
  // Folders
  folders: VaultFolder[];
  currentFolderId: string | null;
  
  // Permissions
  permissions: AssetPermission[];
  
  // Upload
  uploadProgress: UploadProgress[];
  
  // Stats
  stats: VaultStats;
  
  // Search & Filter
  searchQuery: string;
  filterType: IPAsset['type'] | 'all';
  
  // Actions
  setAssets: (assets: IPAsset[]) => void;
  setSelectedAsset: (asset: IPAsset | null) => void;
  addAsset: (asset: IPAsset) => void;
  updateAsset: (id: string, updates: Partial<IPAsset>) => void;
  deleteAsset: (id: string) => void;
  
  setFolders: (folders: VaultFolder[]) => void;
  setCurrentFolder: (folderId: string | null) => void;
  addFolder: (folder: VaultFolder) => void;
  
  setPermissions: (permissions: AssetPermission[]) => void;
  addPermission: (permission: AssetPermission) => void;
  removePermission: (id: string) => void;
  
  updateUploadProgress: (progress: UploadProgress) => void;
  removeUploadProgress: (assetId: string) => void;
  
  setStats: (stats: VaultStats) => void;
  
  setSearchQuery: (query: string) => void;
  setFilterType: (type: IPAsset['type'] | 'all') => void;
  
  // IPFS Upload Mock
  uploadToIPFS: (file: File) => Promise<string>;
}

// Mock data
const mockAssets: IPAsset[] = [
  {
    id: '1',
    ipId: '0x1234...5678',
    name: 'Song Copyright - "Midnight Dreams"',
    type: 'copyright',
    description: 'Original composition copyright registration',
    fileUrl: 'ipfs://QmExample1',
    fileType: 'application/pdf',
    fileSize: 2500000,
    metadata: {
      registrationNumber: 'TX0009876543',
      registrationDate: '2024-01-15',
      author: 'John Doe',
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    owner: '0xabcd...efgh',
    tags: ['music', 'copyright', 'original'],
  },
  {
    id: '2',
    ipId: '0x5678...9012',
    name: 'Band Logo Trademark',
    type: 'trademark',
    description: 'Official band logo trademark',
    fileUrl: 'ipfs://QmExample2',
    fileType: 'image/png',
    fileSize: 1200000,
    thumbnailUrl: 'https://placeholder.svg',
    metadata: {
      registrationNumber: 'TM123456',
      class: 'Class 41 - Entertainment',
    },
    createdAt: '2024-02-01T14:30:00Z',
    updatedAt: '2024-02-01T14:30:00Z',
    owner: '0xabcd...efgh',
    tags: ['trademark', 'branding', 'logo'],
  },
];

const mockFolders: VaultFolder[] = [
  {
    id: 'f1',
    name: 'Music Copyrights',
    description: 'All song and composition copyrights',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    assetCount: 15,
  },
  {
    id: 'f2',
    name: 'Trademarks',
    description: 'Brand and logo trademarks',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    assetCount: 5,
  },
];

const mockPermissions: AssetPermission[] = [
  {
    id: 'p1',
    assetId: '1',
    grantedTo: '0x9876...5432',
    permission: 'view',
    createdAt: '2024-01-16T09:00:00Z',
  },
  {
    id: 'p2',
    assetId: '1',
    grantedTo: '0x5555...6666',
    permission: 'edit',
    expiresAt: '2024-12-31T23:59:59Z',
    createdAt: '2024-01-16T10:00:00Z',
  },
];

const mockStats: VaultStats = {
  totalAssets: 25,
  totalSize: 125000000,
  assetsByType: {
    copyright: 15,
    trademark: 5,
    patent: 3,
    trade_secret: 2,
  },
  recentActivity: [
    {
      id: 'a1',
      type: 'upload',
      assetId: '1',
      assetName: 'Song Copyright - "Midnight Dreams"',
      actor: '0xabcd...efgh',
      timestamp: '2024-01-15T10:00:00Z',
      details: 'Uploaded new copyright document',
    },
    {
      id: 'a2',
      type: 'permission_granted',
      assetId: '1',
      assetName: 'Song Copyright - "Midnight Dreams"',
      actor: '0xabcd...efgh',
      timestamp: '2024-01-16T09:00:00Z',
      details: 'Granted view permission to 0x9876...5432',
    },
  ],
};

export const useVaultStore = create<VaultStore>((set) => ({
  assets: mockAssets,
  selectedAsset: null,
  folders: mockFolders,
  currentFolderId: null,
  permissions: mockPermissions,
  uploadProgress: [],
  stats: mockStats,
  searchQuery: '',
  filterType: 'all',
  
  setAssets: (assets) => set({ assets }),
  setSelectedAsset: (asset) => set({ selectedAsset: asset }),
  addAsset: (asset) => set((state) => ({ 
    assets: [...state.assets, asset],
    stats: {
      ...state.stats,
      totalAssets: state.stats.totalAssets + 1,
      assetsByType: {
        ...state.stats.assetsByType,
        [asset.type]: (state.stats.assetsByType[asset.type] || 0) + 1,
      },
    },
  })),
  updateAsset: (id, updates) => set((state) => ({
    assets: state.assets.map((a) => a.id === id ? { ...a, ...updates } : a),
  })),
  deleteAsset: (id) => set((state) => ({
    assets: state.assets.filter((a) => a.id !== id),
  })),
  
  setFolders: (folders) => set({ folders }),
  setCurrentFolder: (folderId) => set({ currentFolderId: folderId }),
  addFolder: (folder) => set((state) => ({ folders: [...state.folders, folder] })),
  
  setPermissions: (permissions) => set({ permissions }),
  addPermission: (permission) => set((state) => ({ 
    permissions: [...state.permissions, permission] 
  })),
  removePermission: (id) => set((state) => ({
    permissions: state.permissions.filter((p) => p.id !== id),
  })),
  
  updateUploadProgress: (progress) => set((state) => {
    const existing = state.uploadProgress.find((p) => p.assetId === progress.assetId);
    if (existing) {
      return {
        uploadProgress: state.uploadProgress.map((p) =>
          p.assetId === progress.assetId ? progress : p
        ),
      };
    }
    return { uploadProgress: [...state.uploadProgress, progress] };
  }),
  removeUploadProgress: (assetId) => set((state) => ({
    uploadProgress: state.uploadProgress.filter((p) => p.assetId !== assetId),
  })),
  
  setStats: (stats) => set({ stats }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterType: (type) => set({ filterType: type }),
  
  uploadToIPFS: async (file: File) => {
    // Mock IPFS upload - replace with actual implementation
    console.log('Uploading file to IPFS:', file.name);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return `ipfs://Qm${Math.random().toString(36).substring(7)}`;
  },
}));
