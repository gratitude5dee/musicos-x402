import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useEnhancedAuth } from "@/context/EnhancedAuthContext";
import { useThirdwebAuth } from "@/context/ThirdwebAuthContext";
import { useActiveAccount } from "thirdweb/react";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isGuestMode } = useEnhancedAuth();
  const { onboardingCompleted, isLoading: thirdwebLoading, hasSynced } = useThirdwebAuth();
  const account = useActiveAccount();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // After component mounts, consider auth check completed
    // This prevents initial flashing of redirect
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Show loading spinner while auth is loading
  if (loading || isLoading || thirdwebLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // If no user and no wallet and not in guest mode, redirect to wallet login
  if (!user && !account && !isGuestMode) {
    return <Navigate to="/wallet-login" replace />;
  }

  // If wallet connected but hasn't completed onboarding, redirect there
  // IMPORTANT: don't redirect if we're already on /onboarding (it would prevent onboarding from mounting)
  if (account && hasSynced && !onboardingCompleted && !isGuestMode && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  // User is authenticated or in guest mode, render the protected content
  return <>{children}</>;
};

