import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useThirdwebAuth } from '@/context/ThirdwebAuthContext';

export type UploadedTrainingFile = {
  type: 'image' | 'video' | 'voice';
  name: string;
  size: number;
  url: string;
  storagePath: string;
  mimeType: string;
  uploadedAt: string;
};

interface OnboardingState {
  creatorName: string;
  connectedAccounts: string[];
  uploadedFiles: UploadedTrainingFile[];
  preferences: {
    llm: string;
    chain: string;
    style: string;
  };
}

interface OnboardingContextType extends OnboardingState {
  setCreatorName: (name: string) => void;
  toggleConnectedAccount: (account: string) => void;
  addUploadedFile: (file: UploadedTrainingFile) => void;
  setPreferences: (prefs: Partial<OnboardingState['preferences']>) => void;
  saveOnboardingData: () => Promise<void>;
  loading: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { userId, syncWallet } = useThirdwebAuth();
  const [state, setState] = useState<OnboardingState>({
    creatorName: '',
    connectedAccounts: [],
    uploadedFiles: [],
    preferences: {
      llm: 'gpt-4o',
      chain: 'ethereum',
      style: 'balanced',
    },
  });

  const setCreatorName = (name: string) => setState(s => ({ ...s, creatorName: name }));
  
  const toggleConnectedAccount = (account: string) => {
    setState(s => {
      const newAccounts = s.connectedAccounts.includes(account)
        ? s.connectedAccounts.filter(a => a !== account)
        : [...s.connectedAccounts, account];
      return { ...s, connectedAccounts: newAccounts };
    });
  };

  const addUploadedFile = (file: UploadedTrainingFile) => {
    setState(s => ({ ...s, uploadedFiles: [...s.uploadedFiles, file] }));
  };
  
  const setPreferences = (prefs: Partial<OnboardingState['preferences']>) => {
    setState(s => ({ ...s, preferences: { ...s.preferences, ...prefs } }));
  };

  const saveOnboardingData = async () => {
    setLoading(true);
    try {
      // Use Thirdweb userId instead of Supabase auth (wallet auth doesn't use Supabase sessions)
      if (!userId) throw new Error('User not authenticated');

      // Get the wallet address from the user record
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('wallet_address')
        .eq('id', userId)
        .single();

      if (userError || !userData?.wallet_address) {
        throw new Error('Could not retrieve wallet address');
      }

      console.log('Saving onboarding data via edge function for user:', userId);

      // Call the edge function which uses service role to bypass RLS
      const { data, error } = await supabase.functions.invoke('save-onboarding', {
        body: {
          userId,
          walletAddress: userData.wallet_address,
          creatorName: state.creatorName,
          connectedAccounts: state.connectedAccounts,
          uploadedFiles: state.uploadedFiles,
          preferences: state.preferences,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to save onboarding data');
      }

      if (!data?.success) {
        console.error('Save onboarding failed:', data);
        throw new Error(data?.error || 'Failed to save onboarding data');
      }

      console.log('Onboarding data saved successfully:', data);

      // Force re-sync wallet to update onboardingCompleted state
      await syncWallet({ force: true });

      toast({
        title: "Profile saved!",
        description: "Your Creator OS has been configured successfully.",
      });
    } catch (error: any) {
      console.error('Error in saveOnboardingData:', error);
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingContext.Provider value={{ ...state, setCreatorName, toggleConnectedAccount, addUploadedFile, setPreferences, saveOnboardingData, loading }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
