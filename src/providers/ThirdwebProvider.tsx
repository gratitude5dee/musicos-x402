'use client';

import { createThirdwebClient, defineChain } from "thirdweb";
import { ThirdwebProvider } from "thirdweb/react";

// Create thirdweb client - uses VITE_ prefix for Vite apps
const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID;

export const client = createThirdwebClient({ 
  clientId: clientId || "demo" // fallback for development
});

// Parse supported chains from env
const supportedChainIds = (import.meta.env.VITE_SUPPORTED_CHAINS || "8453,84532").split(',').map(Number);
export const supportedChains = supportedChainIds.map(id => defineChain(id));

interface ThirdwebProviderWrapperProps {
  children: React.ReactNode;
}

export function ThirdwebProviderWrapper({ children }: ThirdwebProviderWrapperProps) {
  return (
    <ThirdwebProvider>
      {children}
    </ThirdwebProvider>
  );
}
