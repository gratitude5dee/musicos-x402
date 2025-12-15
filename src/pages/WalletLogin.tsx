import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { client } from "@/providers/ThirdwebProvider";
import { motion } from "framer-motion";
import { Wallet, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WalletLogin() {
  const account = useActiveAccount();
  const navigate = useNavigate();

  // Auto-redirect to dashboard when connected
  useEffect(() => {
    if (account) {
      const timeout = setTimeout(() => {
        navigate("/wallet-dashboard", { replace: true });
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [account, navigate]);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass-card rounded-2xl p-8 border border-border/50 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center"
            >
              <Wallet className="h-8 w-8 text-primary" />
            </motion.div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              AI Wallet Manager
            </h1>
            <p className="text-muted-foreground text-sm">
              A natural language interface to do anything with your wallet.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-8">
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
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                <span>{feature}</span>
              </motion.div>
            ))}
          </div>

          {/* Connect Button */}
          <div className="space-y-4">
            {!account ? (
              <div className="flex justify-center">
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
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-1">Connected as</p>
                  <p className="font-mono text-primary font-medium">
                    {truncateAddress(account.address)}
                  </p>
                </div>
                <Button
                  onClick={() => navigate("/wallet-dashboard")}
                  className="w-full"
                  size="lg"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <p className="text-xs text-muted-foreground text-center mt-6">
            Powered by Thirdweb • Secure & Non-custodial
          </p>
        </div>
      </motion.div>
    </div>
  );
}
