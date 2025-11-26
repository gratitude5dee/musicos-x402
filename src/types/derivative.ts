import { type Address } from 'viem';

export interface DerivativeWork {
  id: string;
  parentIpId: Address;
  childIpId: Address;
  name: string;
  description: string;
  derivativeType: 'remix' | 'adaptation' | 'translation' | 'compilation' | 'other';
  licenseTerms: LicenseTerms;
  creator: Address;
  createdAt: Date;
  status: 'pending' | 'approved' | 'rejected' | 'active';
  metadata: {
    originalWork?: string;
    modifications?: string[];
    mediaUrl?: string;
    thumbnailUrl?: string;
  };
  royaltyShare: number;
  commercialUse: boolean;
}

export interface LicenseTerms {
  id: string;
  name: string;
  commercialUse: boolean;
  commercialRevShare: number; // percentage
  derivativesAllowed: boolean;
  derivativesRevShare: number; // percentage
  territories: string[];
  channels: string[];
  currency: Address;
  royaltyPolicy: Address;
}

export interface DerivativeRequest {
  parentIpId: Address;
  name: string;
  description: string;
  derivativeType: DerivativeWork['derivativeType'];
  licenseTermsId: string;
  metadata: DerivativeWork['metadata'];
}

export interface LicenseTemplate {
  id: string;
  name: string;
  description: string;
  commercialUse: boolean;
  commercialRevShare: number;
  derivativesAllowed: boolean;
  derivativesRevShare: number;
  isPopular: boolean;
}

export interface DerivativeStats {
  totalDerivatives: number;
  pendingApprovals: number;
  activeDerivatives: number;
  totalRoyaltiesEarned: string;
  averageRoyaltyShare: number;
}

export interface DerivativeActivity {
  id: string;
  type: 'created' | 'approved' | 'rejected' | 'royalty_paid';
  derivativeId: string;
  derivativeName: string;
  timestamp: Date;
  details?: string;
  amount?: string;
}
