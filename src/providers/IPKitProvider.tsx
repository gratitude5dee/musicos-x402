import React, { ReactNode } from 'react';

interface IPKitProviderProps {
  children: ReactNode;
  chain?: 'testnet' | 'mainnet';
}

/**
 * IPKit Provider wrapper
 * Note: @ipkit/react package installation failed, so this is a placeholder.
 * Once the package is available, uncomment the implementation below.
 */
export function IPKitProvider({ children, chain = 'testnet' }: IPKitProviderProps) {
  // TODO: Uncomment when @ipkit/react is available
  // import { IpKitProvider } from '@ipkit/react';
  // 
  // const apiKey = import.meta.env.VITE_STORY_API_KEY;
  // 
  // return (
  //   <IpKitProvider
  //     apiKey={apiKey}
  //     chain={chain === 'testnet' ? 'aeneid' : 'mainnet'}
  //   >
  //     {children}
  //   </IpKitProvider>
  // );

  // Temporary passthrough until package is available
  return <>{children}</>;
}
