# Phase 6: Derivative Licensing

## Overview
Derivative Licensing enables creators to build upon existing IP assets with proper attribution and revenue sharing. This phase implements a comprehensive system for creating, managing, and tracking derivative works.

## Features Implemented

### 1. Derivative Creation
- **Multi-type Support**: Remix, Adaptation, Translation, Compilation, Other
- **License Templates**: Pre-configured licensing terms for common use cases
- **Metadata Management**: Track original work, modifications, and media files
- **Parent-Child Linking**: Blockchain-based relationship between original and derivative

### 2. License Terms Management
- **Commercial Use Configuration**: Enable/disable commercial rights
- **Revenue Sharing**: Configurable percentage splits for commercialization
- **Derivative Permissions**: Control whether derivatives can create further derivatives
- **Territory & Channel Restrictions**: Define where and how content can be used

### 3. Approval Workflow
- **Pending Queue**: Review derivatives awaiting approval
- **Accept/Reject Actions**: Simple approval interface for IP owners
- **Status Tracking**: Monitor derivative lifecycle (pending → approved/rejected → active)

### 4. Analytics & Monitoring
- **Derivative Statistics**: Total count, pending approvals, active derivatives
- **Royalty Tracking**: Monitor revenue earned from derivative works
- **Activity Feed**: Real-time updates on derivative creation and status changes

## Technical Implementation

### Type Definitions
```typescript
src/types/derivative.ts
- DerivativeWork: Core derivative data structure
- LicenseTerms: Licensing configuration
- LicenseTemplate: Pre-configured license options
- DerivativeStats: Analytics data
- DerivativeActivity: Activity tracking
```

### State Management
```typescript
src/stores/derivativeStore.ts
- Zustand store for derivative state
- Mock data for demonstration
- Actions for CRUD operations
```

### Hooks
```typescript
src/hooks/useDerivatives.ts
- createDerivative(): Register new derivative work
- approveDerivative(): Approve pending derivative
- rejectDerivative(): Reject pending derivative
- attachLicenseTerms(): Attach license to IP asset
```

### Components
- `DerivativeStats`: Display key metrics
- `CreateDerivativeDialog`: Form for creating derivatives
- `DerivativeGrid`: Browse and search derivatives
- `DerivativeDetailModal`: View detailed information

### Pages
- `DerivativesPage`: Main dashboard with tabs for all derivatives, pending approvals, and activity

## Story Protocol Integration

### Pending SDK Integration
The following Story Protocol SDK methods need to be integrated:

1. **License Minting**
   ```typescript
   await client.license.mintLicenseTokens({
     licenseTermsId: string,
     licensorIpId: Address,
     amount: number
   })
   ```

2. **Derivative Registration**
   ```typescript
   await client.ipAsset.registerDerivative({
     childIpId: Address,
     parentIpIds: Address[],
     licenseTermsIds: string[]
   })
   ```

3. **License Terms Attachment**
   ```typescript
   await client.license.attachLicenseTerms({
     ipId: Address,
     licenseTermsId: string
   })
   ```

## License Templates

### Commercial Use + Derivatives
- Commercial use: Allowed
- Commercial revenue share: 10%
- Derivatives allowed: Yes
- Derivatives revenue share: 5%

### Non-Commercial Only
- Commercial use: Not allowed
- Derivatives: Not allowed
- Free use for non-commercial purposes

### Attribution Required
- Commercial use: Allowed
- Commercial revenue share: 5%
- Derivatives allowed: Yes
- Derivatives revenue share: 2%
- Attribution required

## Next Steps

1. **Story Protocol SDK Integration**
   - Implement actual blockchain transactions
   - Connect to license registry
   - Handle on-chain approvals

2. **Enhanced Metadata**
   - IPFS integration for media storage
   - Version tracking for derivative updates
   - Provenance chain visualization

3. **Advanced Features**
   - Batch derivative creation
   - Automated royalty distribution
   - Dispute resolution for derivative rights
   - Multi-level derivative chains

## UI/UX Features
- Real-time search and filtering
- Status badges and icons
- Responsive grid layout
- Detailed derivative inspection
- One-click approval/rejection
- Activity timeline

## Current Status
✅ Phase 6 Complete - Derivative Licensing UI and state management implemented
⏳ Blockchain integration pending Story Protocol SDK finalization
