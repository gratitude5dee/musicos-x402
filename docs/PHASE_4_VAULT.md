# Phase 4: IP Vault Implementation

## Overview
The IP Vault is a secure digital vault for storing and managing intellectual property assets with granular permission controls.

## Features Implemented

### 1. Asset Management
- **Asset Types**: Support for copyrights, trademarks, patents, trade secrets, and other IP
- **File Storage**: Upload and store IP documents via IPFS (mock implementation)
- **Metadata**: Rich metadata support with tags, descriptions, and custom fields
- **Organization**: Folder structure for organizing assets (UI prepared)

### 2. Permission System
- **Granular Permissions**: Four levels - View, Edit, Transfer, Admin
- **Permission Assignment**: Grant permissions to specific wallet addresses
- **Expiration**: Support for time-limited permissions
- **Revocation**: Ability to revoke permissions at any time

### 3. Dashboard & Analytics
- **Asset Statistics**: Total assets, storage usage, type distribution
- **Activity Timeline**: Recent uploads, permission changes, and updates
- **Visual Analytics**: Charts showing asset distribution by type

### 4. User Interface
- **Search & Filter**: Full-text search and filtering by asset type
- **Grid View**: Visual card-based display of all assets
- **Upload Dialog**: Step-by-step asset creation wizard
- **Permissions Manager**: Dedicated interface for managing access control

## Technical Implementation

### File Structure
```
src/
├── types/vault.ts                    # TypeScript interfaces
├── stores/vaultStore.ts              # Zustand state management
├── hooks/useIPVault.ts               # Vault operations hook
├── components/vault/
│   ├── VaultDashboard.tsx           # Stats and overview
│   ├── AssetGrid.tsx                # Asset listing
│   ├── AssetUploadDialog.tsx        # Upload interface
│   └── PermissionsManager.tsx       # Permission controls
└── pages/IPVaultPage.tsx            # Main page component
```

### Integration Points

#### Story Protocol SDK
The vault integrates with Story Protocol for:
- IP asset registration (placeholder - awaiting SDK method)
- Permission management via `permission` client
- On-chain verification of ownership

#### IPFS Storage
Files are uploaded to IPFS using a mock implementation. Replace `uploadToIPFS` in `vaultStore.ts` with actual Pinata/IPFS integration:

```typescript
uploadToIPFS: async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PINATA_JWT}`,
    },
    body: formData,
  });
  
  const result = await response.json();
  return `ipfs://${result.IpfsHash}`;
}
```

### State Management
The vault uses Zustand for local state:
- Assets list and selected asset
- Folders and current location
- Permissions records
- Upload progress tracking
- Search and filter state

### Current Status

#### ✅ Completed
- Full UI components for vault management
- Asset upload with file handling
- Permission management interface
- Dashboard with statistics
- Search and filtering
- Mock data for demonstration

#### 🚧 Pending Integration
- Story Protocol `ipAsset.register()` integration
- Real IPFS upload via Pinata
- Blockchain permission verification
- Folder hierarchy backend
- Activity log persistence

## Usage Example

```typescript
import { useIPVault } from '@/hooks/useIPVault';

function MyComponent() {
  const { createAsset, grantPermission, isLoading } = useIPVault();

  const handleUpload = async () => {
    const asset = await createAsset({
      name: 'My Song Copyright',
      type: 'copyright',
      description: 'Original composition',
      file: myFile,
      tags: ['music', '2024'],
    });

    if (asset) {
      await grantPermission({
        assetId: asset.id,
        grantedTo: '0x...',
        permission: 'view',
      });
    }
  };

  return <button onClick={handleUpload}>Upload & Share</button>;
}
```

## Next Steps

1. **Backend Integration**
   - Connect to Supabase for persistence
   - Implement real IPFS uploads
   - Add Story Protocol SDK calls

2. **Enhanced Features**
   - File preview generation
   - Version control for assets
   - Batch operations
   - Export capabilities

3. **Security**
   - Encryption for sensitive files
   - Audit logging
   - Two-factor authentication for critical operations

## Navigation
Access the IP Vault via:
- Left sidebar → Content Library → IP Portal → IP Vault
- Direct URL: `/vault`
