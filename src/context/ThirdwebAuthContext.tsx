import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useActiveAccount, useDisconnect } from 'thirdweb/react';
import { supabase } from '@/integrations/supabase/client';

interface ThirdwebAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  walletAddress: string | null;
  userId: string | null;
  error: string | null;
  isNewUser: boolean;
  onboardingCompleted: boolean;
}

interface SyncOptions {
  force?: boolean;
}

interface ThirdwebAuthContextValue extends ThirdwebAuthState {
  syncWallet: (options?: SyncOptions) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  hasSynced: boolean;
}

const ThirdwebAuthContext = createContext<ThirdwebAuthContextValue | null>(null);

export function ThirdwebAuthProvider({ children }: { children: React.ReactNode }) {
  const account = useActiveAccount();
  const { disconnect } = useDisconnect();
  
  const [state, setState] = useState<ThirdwebAuthState>({
    isAuthenticated: false,
    isLoading: false,
    walletAddress: null,
    userId: null,
    error: null,
    isNewUser: false,
    onboardingCompleted: false,
  });
  const [hasSynced, setHasSynced] = useState(false);

  // Sync wallet with database when account changes
  const syncWallet = useCallback(async (options?: SyncOptions) => {
    const force = options?.force ?? false;
    
    if (!account?.address) {
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        walletAddress: null,
        userId: null,
        isLoading: false,
        isNewUser: false,
        onboardingCompleted: false,
      }));
      setHasSynced(false);
      return;
    }

    // Skip if already synced for this address (unless force is true)
    if (!force && hasSynced && state.walletAddress === account.address) {
      console.log('Skipping sync - already synced for this address');
      return;
    }

    console.log('Syncing wallet...', { force, address: account.address });
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Call edge function to sync wallet
      const { data, error } = await supabase.functions.invoke('create-wallet', {
        body: {
          email: `${account.address.toLowerCase()}@wallet.local`,
          walletAddress: account.address,
        },
      });

      if (error) throw error;

      console.log('Wallet sync response:', data);

      setState({
        isAuthenticated: true,
        isLoading: false,
        walletAddress: account.address,
        userId: data?.user?.id || null,
        error: null,
        isNewUser: data?.isNewUser ?? false,
        onboardingCompleted: data?.onboardingCompleted ?? false,
      });
      setHasSynced(true);

      console.log('Wallet synced:', account.address, 'onboardingCompleted:', data?.onboardingCompleted);
    } catch (err) {
      console.error('Wallet sync error:', err);
      setState(prev => ({
        ...prev,
        isAuthenticated: true, // Still authenticated via wallet
        isLoading: false,
        walletAddress: account.address,
        error: err instanceof Error ? err.message : 'Failed to sync wallet',
      }));
      setHasSynced(true);
    }
  }, [account?.address, hasSynced, state.walletAddress]);

  // Auto-sync when account changes
  useEffect(() => {
    syncWallet();
  }, [syncWallet]);

  // Sign out function
  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      disconnect({} as any);
      
      setState({
        isAuthenticated: false,
        isLoading: false,
        walletAddress: null,
        userId: null,
        error: null,
        isNewUser: false,
        onboardingCompleted: false,
      });
      setHasSynced(false);

      // Clear any local storage tokens
      localStorage.removeItem('thirdweb_auth_token');
      localStorage.removeItem('guest_mode');
    } catch (err) {
      console.error('Sign out error:', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to sign out',
      }));
    }
  }, [disconnect]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return (
    <ThirdwebAuthContext.Provider
      value={{
        ...state,
        syncWallet,
        signOut,
        clearError,
        hasSynced,
      }}
    >
      {children}
    </ThirdwebAuthContext.Provider>
  );
}

export function useThirdwebAuth() {
  const context = useContext(ThirdwebAuthContext);
  if (!context) {
    throw new Error('useThirdwebAuth must be used within a ThirdwebAuthProvider');
  }
  return context;
}
