import { create } from 'zustand';
import type { DerivativeWork, LicenseTerms, LicenseTemplate, DerivativeStats, DerivativeActivity } from '@/types/derivative';
import type { Address } from 'viem';

interface DerivativeStore {
  derivatives: DerivativeWork[];
  licenseTerms: LicenseTerms[];
  templates: LicenseTemplate[];
  stats: DerivativeStats;
  activities: DerivativeActivity[];
  
  // Actions
  addDerivative: (derivative: DerivativeWork) => void;
  updateDerivativeStatus: (id: string, status: DerivativeWork['status']) => void;
  addActivity: (activity: DerivativeActivity) => void;
}

// Mock data
const mockTemplates: LicenseTemplate[] = [
  {
    id: 'template-1',
    name: 'Commercial Use + Derivatives',
    description: 'Allow commercial use and derivative works with revenue sharing',
    commercialUse: true,
    commercialRevShare: 10,
    derivativesAllowed: true,
    derivativesRevShare: 5,
    isPopular: true,
  },
  {
    id: 'template-2',
    name: 'Non-Commercial Only',
    description: 'Free use for non-commercial purposes, no derivatives',
    commercialUse: false,
    commercialRevShare: 0,
    derivativesAllowed: false,
    derivativesRevShare: 0,
    isPopular: true,
  },
  {
    id: 'template-3',
    name: 'Attribution Required',
    description: 'Free use with attribution, derivatives allowed',
    commercialUse: true,
    commercialRevShare: 5,
    derivativesAllowed: true,
    derivativesRevShare: 2,
    isPopular: false,
  },
];

const mockDerivatives: DerivativeWork[] = [
  {
    id: 'deriv-1',
    parentIpId: '0x1234567890123456789012345678901234567890' as Address,
    childIpId: '0x2345678901234567890123456789012345678901' as Address,
    name: 'Remix: Digital Sunrise',
    description: 'Electronic remix of the original composition',
    derivativeType: 'remix',
    licenseTerms: {
      id: 'license-1',
      name: 'Commercial Use + Derivatives',
      commercialUse: true,
      commercialRevShare: 10,
      derivativesAllowed: true,
      derivativesRevShare: 5,
      territories: ['worldwide'],
      channels: ['streaming', 'download'],
      currency: '0x0000000000000000000000000000000000000000' as Address,
      royaltyPolicy: '0x0000000000000000000000000000000000000000' as Address,
    },
    creator: '0x3456789012345678901234567890123456789012' as Address,
    createdAt: new Date('2024-01-15'),
    status: 'active',
    metadata: {
      originalWork: 'Sunrise Symphony',
      modifications: ['Added electronic beats', 'Synth overlay', 'Extended outro'],
      mediaUrl: 'https://example.com/remix.mp3',
    },
    royaltyShare: 10,
    commercialUse: true,
  },
  {
    id: 'deriv-2',
    parentIpId: '0x4567890123456789012345678901234567890123' as Address,
    childIpId: '0x5678901234567890123456789012345678901234' as Address,
    name: 'Translation: Spanish Version',
    description: 'Spanish translation of the original novel',
    derivativeType: 'translation',
    licenseTerms: {
      id: 'license-2',
      name: 'Attribution Required',
      commercialUse: true,
      commercialRevShare: 5,
      derivativesAllowed: true,
      derivativesRevShare: 2,
      territories: ['Spain', 'Latin America'],
      channels: ['print', 'ebook'],
      currency: '0x0000000000000000000000000000000000000000' as Address,
      royaltyPolicy: '0x0000000000000000000000000000000000000000' as Address,
    },
    creator: '0x6789012345678901234567890123456789012345' as Address,
    createdAt: new Date('2024-02-20'),
    status: 'pending',
    metadata: {
      originalWork: 'The Digital Age',
      modifications: ['Translated to Spanish', 'Cultural adaptations'],
    },
    royaltyShare: 5,
    commercialUse: true,
  },
];

export const useDerivativeStore = create<DerivativeStore>((set) => ({
  derivatives: mockDerivatives,
  licenseTerms: [],
  templates: mockTemplates,
  stats: {
    totalDerivatives: 24,
    pendingApprovals: 3,
    activeDerivatives: 18,
    totalRoyaltiesEarned: '12,450.00',
    averageRoyaltyShare: 7.5,
  },
  activities: [
    {
      id: 'activity-1',
      type: 'created',
      derivativeId: 'deriv-1',
      derivativeName: 'Remix: Digital Sunrise',
      timestamp: new Date('2024-01-15T10:30:00'),
    },
    {
      id: 'activity-2',
      type: 'approved',
      derivativeId: 'deriv-1',
      derivativeName: 'Remix: Digital Sunrise',
      timestamp: new Date('2024-01-16T14:20:00'),
    },
    {
      id: 'activity-3',
      type: 'royalty_paid',
      derivativeId: 'deriv-1',
      derivativeName: 'Remix: Digital Sunrise',
      timestamp: new Date('2024-02-01T09:15:00'),
      amount: '250.00 USDC',
    },
  ],
  
  addDerivative: (derivative) => set((state) => ({
    derivatives: [...state.derivatives, derivative],
  })),
  
  updateDerivativeStatus: (id, status) => set((state) => ({
    derivatives: state.derivatives.map((d) =>
      d.id === id ? { ...d, status } : d
    ),
  })),
  
  addActivity: (activity) => set((state) => ({
    activities: [activity, ...state.activities],
  })),
}));
