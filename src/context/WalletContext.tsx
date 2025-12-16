import React, { createContext, useContext, useState, useEffect } from 'react';
import { useThirdwebAuth } from '@/context/ThirdwebAuthContext';

interface WalletContextType {
  address: string;
  balance: number;
  isLoading: boolean;
  fetchBalance: () => Promise<void>;
}

const defaultContext: WalletContextType = {
  address: '',
  balance: 0,
  isLoading: false,
  fetchBalance: async () => {},
};

const WalletContext = createContext<WalletContextType>(defaultContext);

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string>('');
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { walletAddress, isAuthenticated } = useThirdwebAuth();
  
  // Update address when wallet address changes
  useEffect(() => {
    if (walletAddress) {
      // Format the address for display
      const formatted = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
      setAddress(formatted);
    } else if (!isAuthenticated) {
      setAddress('');
    }
  }, [walletAddress, isAuthenticated]);
  
  const fetchBalance = async () => {
    if (!walletAddress) return;
    
    setIsLoading(true);
    try {
      // For demonstration purposes - in a real app you would fetch from an endpoint
      // This is a placeholder and would need to be replaced with actual balance fetching logic
      setBalance(0.5); // Example balance
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (walletAddress) {
      fetchBalance();
    }
  }, [walletAddress]);
  
  useEffect(() => {
    if (address) {
      fetchBalance();
    }
  }, [address]);
  
  return (
    <WalletContext.Provider value={{ address, balance, isLoading, fetchBalance }}>
      {children}
    </WalletContext.Provider>
  );
};
