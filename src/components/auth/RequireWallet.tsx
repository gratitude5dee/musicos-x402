import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useActiveAccount } from "thirdweb/react";
import { Loader2 } from "lucide-react";

interface RequireWalletProps {
  children: React.ReactNode;
}

export function RequireWallet({ children }: RequireWalletProps) {
  const account = useActiveAccount();
  const navigate = useNavigate();

  useEffect(() => {
    // Small delay to allow wallet state to initialize
    const timeout = setTimeout(() => {
      if (!account) {
        navigate("/wallet-login", { replace: true });
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [account, navigate]);

  // Show loading while checking wallet state
  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking wallet connection...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
