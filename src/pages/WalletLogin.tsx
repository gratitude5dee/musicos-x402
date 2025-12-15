import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { client } from "@/providers/ThirdwebProvider";
import { motion } from "framer-motion";
import { Wallet, Sparkles, Brain, LayoutDashboard, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import CosmicShader from "@/components/ui/shaders/CosmicShader";
import { useEnhancedAuth } from "@/context/EnhancedAuthContext";
import { useThirdwebAuth } from "@/context/ThirdwebAuthContext";

interface FeatureItem {
  icon: React.ElementType;
  label: string;
  color: string;
}

export default function WalletLogin() {
  const account = useActiveAccount();
  const navigate = useNavigate();
  const { enableGuestMode } = useEnhancedAuth();
  const { isNewUser, onboardingCompleted, isLoading } = useThirdwebAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const featureIcons: FeatureItem[] = [
    { icon: Brain, label: "AI Agents", color: "hsl(var(--primary))" },
    { icon: LayoutDashboard, label: "Dashboard", color: "hsl(var(--accent))" },
    { icon: Wallet, label: "Treasury", color: "hsl(var(--chart-1))" },
    { icon: Users, label: "Assistants", color: "hsl(var(--chart-2))" },
  ];

  // Smart redirect based on user status - triggers immediately when wallet connects
  useEffect(() => {
    if (account && !isRedirecting && !isLoading) {
      setIsRedirecting(true);
      // Immediate redirect - no delay needed
      if (isNewUser || !onboardingCompleted) {
        navigate("/onboarding", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    }
  }, [account, navigate, isRedirecting, isLoading, isNewUser, onboardingCompleted]);

  const handleGuestAccess = () => {
    enableGuestMode();
    navigate("/home");
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-4 text-foreground relative overflow-hidden"
    >
      {/* WebGL Background */}
      <div className="fixed inset-0 z-0">
        <CosmicShader />
      </div>

      {/* Liquid Glass Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-md w-full space-y-6 liquid-glass-card p-8 relative z-10"
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="w-16 h-16 mx-auto mb-4 rounded-2xl liquid-glass-icon flex items-center justify-center"
          >
            <Wallet className="h-8 w-8 text-[hsl(var(--accent-gold))]" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[hsl(var(--accent-warm-white))] to-[hsl(var(--accent-gold))] bg-clip-text text-transparent">
            MusicOS
          </h1>
          <p className="text-[hsl(var(--text-secondary))]">
            Connect your wallet to access your creative workspace
          </p>
        </div>

        {/* Features */}
        <div className="space-y-2 py-4">
          {[
            "Send transactions with natural language",
            "Swap tokens across chains",
            "Deploy smart contracts",
            "Query blockchain data",
          ].map((feature, index) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="flex items-center gap-3 text-sm text-[hsl(var(--text-tertiary))]"
            >
              <Sparkles className="h-4 w-4 text-[hsl(var(--accent-gold))] flex-shrink-0" />
              <span>{feature}</span>
            </motion.div>
          ))}
        </div>

        {/* Connect Button */}
        <div className="space-y-4">
          {!account ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-full flex justify-center [&_button]:!w-full [&_button]:!rounded-xl [&_button]:!py-3 [&_button]:!text-base [&_button]:!font-medium [&_button]:!bg-gradient-to-r [&_button]:!from-[hsl(var(--accent-gold))] [&_button]:!to-[hsl(var(--accent-amber))] [&_button]:!border-0 [&_button]:!text-[hsl(var(--bg-primary))]">
                <ConnectButton
                  client={client}
                  theme="dark"
                  connectModal={{
                    size: "compact",
                    title: "Connect Wallet",
                    showThirdwebBranding: false,
                  }}
                />
              </div>

              {/* Divider */}
              <div className="relative w-full py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[hsl(var(--glass-warm-border))]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 text-[hsl(var(--text-tertiary))] bg-[hsl(var(--glass-warm-bg))] rounded-full">
                    or continue with
                  </span>
                </div>
              </div>

              {/* Guest Access */}
              <Button
                variant="outline"
                className="w-full border-[hsl(var(--glass-warm-border))] bg-[hsl(var(--glass-warm-bg))] hover:bg-[hsl(var(--accent-gold)/0.1)] hover:border-[hsl(var(--accent-gold)/0.3)] text-[hsl(var(--text-secondary))] transition-all duration-300"
                onClick={handleGuestAccess}
              >
                Enter as Guest
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="text-center p-4 rounded-xl liquid-glass-stat">
                <p className="text-sm text-[hsl(var(--text-tertiary))] mb-1">Connected as</p>
                <p className="font-mono text-[hsl(var(--accent-gold))] font-medium">
                  {truncateAddress(account.address)}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-[hsl(var(--text-tertiary))]">
                <div className="w-2 h-2 bg-[hsl(var(--success))] rounded-full animate-pulse"></div>
                <span>
                  {isLoading ? "Checking account..." : isNewUser || !onboardingCompleted ? "Redirecting to onboarding..." : "Redirecting to dashboard..."}
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Feature Icons Grid */}
        <div className="grid grid-cols-4 gap-3 pt-4">
          {featureIcons.map((item, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
            >
              <div className="p-2 rounded-xl liquid-glass-stat mb-2 hover:border-[hsl(var(--accent-gold)/0.3)] transition-colors">
                <item.icon
                  className="h-5 w-5"
                  style={{ color: item.color }}
                />
              </div>
              <span className="text-xs text-[hsl(var(--text-tertiary))]">{item.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-[hsl(var(--text-tertiary))] pt-4 border-t border-[hsl(var(--glass-warm-border))]">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
          <p className="mt-2 text-[hsl(var(--accent-gold)/0.6)]">Powered by Thirdweb • Secure & Non-custodial</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
