import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useEnhancedAuth } from "@/context/EnhancedAuthContext";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isGuestMode } = useEnhancedAuth();
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
  if (loading || isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // If no user and not in guest mode, redirect to auth
  if (!user && !isGuestMode) {
    return <Navigate to="/auth" replace />;
  }

  // User is authenticated or in guest mode, render the protected content
  return <>{children}</>;
};
