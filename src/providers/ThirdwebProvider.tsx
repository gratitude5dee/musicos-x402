'use client';

import { createThirdwebClient } from "thirdweb";
import { ThirdwebProvider } from "thirdweb/react";

// Create thirdweb client - uses VITE_ prefix for Vite apps
const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID;

export const client = createThirdwebClient({ 
  clientId: clientId || "demo" // fallback for development
});

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
