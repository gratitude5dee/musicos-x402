import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { client } from "@/providers/ThirdwebProvider";
import { motion } from "framer-motion";
import { Wallet, Sparkles, Brain, LayoutDashboard, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import CosmicShader from "@/components/ui/shaders/CosmicShader";
import { useEnhancedAuth } from "@/context/EnhancedAuthContext";

interface FeatureItem {
  icon: React.ElementType;
  label: string;
  color: string;
}

export default function WalletLogin() {
  const account = useActiveAccount();
  const navigate = useNavigate();
  const { enableGuestMode } = useEnhancedAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const featureIcons: FeatureItem[] = [
    { icon: Brain, label: "AI Agents", color: "hsl(var(--primary))" },
    { icon: LayoutDashboard, label: "Dashboard", color: "hsl(var(--accent))" },
    { icon: Wallet, label: "Treasury", color: "hsl(var(--chart-1))" },
    { icon: Users, label: "Assistants", color: "hsl(var(--chart-2))" },
  ];

  // Auto-redirect to home when connected
  useEffect(() => {
    if (account && !isRedirecting) {
      setIsRedirecting(true);
      const timeout = setTimeout(() => {
        navigate("/home", { replace: true });
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [account, navigate, isRedirecting]);

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

      {/* Glass Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-md w-full space-y-6 glass-card p-8 rounded-2xl border border-border/20 backdrop-blur-xl relative z-10 shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--card)/0.8) 0%, hsl(var(--card)/0.6) 100%)',
        }}
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center"
          >
            <Wallet className="h-8 w-8 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            MusicOS
          </h1>
          <p className="text-muted-foreground">
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
              className="flex items-center gap-3 text-sm text-muted-foreground"
            >
              <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
              <span>{feature}</span>
            </motion.div>
          ))}
        </div>

        {/* Connect Button */}
        <div className="space-y-4">
          {!account ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-full flex justify-center [&_button]:!w-full [&_button]:!rounded-lg [&_button]:!py-3 [&_button]:!text-base [&_button]:!font-medium">
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
                  <div className="w-full border-t border-border/30"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 text-muted-foreground bg-card/80 rounded-full">
                    or continue with
                  </span>
                </div>
              </div>

              {/* Guest Access */}
              <Button
                variant="outline"
                className="w-full border-border/30 hover:bg-accent/10 hover:border-accent/30 transition-all duration-300"
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
              <div className="text-center p-4 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">Connected as</p>
                <p className="font-mono text-primary font-medium">
                  {truncateAddress(account.address)}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Redirecting to dashboard...</span>
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
              <div className="p-2 rounded-xl bg-background/50 backdrop-blur-sm border border-border/20 mb-2 hover:border-primary/30 transition-colors">
                <item.icon
                  className="h-5 w-5"
                  style={{ color: item.color }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border/10">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
          <p className="mt-2 text-primary/60">Powered by Thirdweb • Secure & Non-custodial</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
