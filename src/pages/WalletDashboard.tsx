import { useNavigate, useSearchParams } from "react-router-dom";
import { ConnectButton, useActiveAccount, useActiveWalletChain } from "thirdweb/react";
import { client } from "@/providers/ThirdwebProvider";
import { motion } from "framer-motion";
import { 
  Wallet, 
  MessageSquare, 
  ArrowRightLeft, 
  Coins, 
  FileCode, 
  ChevronRight,
  Network,
  Copy,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export default function WalletDashboard() {
  const account = useActiveAccount();
  const chain = useActiveWalletChain();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = async () => {
    if (account?.address) {
      await navigator.clipboard.writeText(account.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const quickActions = [
    {
      title: "Show Balances",
      description: "View all token balances",
      icon: Coins,
      prompt: "Show my balances",
    },
    {
      title: "Swap Tokens",
      description: "Exchange tokens across chains",
      icon: ArrowRightLeft,
      prompt: "Swap 0.01 ETH to USDC",
    },
    {
      title: "Deploy Token",
      description: "Create an ERC20 token",
      icon: FileCode,
      prompt: "Deploy an ERC20 token called TestToken with symbol TST",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            <span className="font-semibold text-foreground">AI Wallet Manager</span>
          </div>
          <ConnectButton 
            client={client}
            theme="dark"
            connectButton={{
              style: {
                fontSize: "14px",
                padding: "8px 16px",
              }
            }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back</h1>
            <p className="text-muted-foreground">
              Manage your wallet with natural language commands
            </p>
          </div>

          {/* Wallet Overview & Quick Actions Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Wallet Overview Card */}
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  Wallet Overview
                </CardTitle>
                <CardDescription>Your connected wallet details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Address</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-foreground">
                        {account ? truncateAddress(account.address) : "Not connected"}
                      </span>
                      {account && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={copyAddress}
                        >
                          {copied ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Network className="h-4 w-4" />
                      Network
                    </span>
                    <span className="text-sm text-foreground">
                      {chain?.name || "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Chain ID</span>
                    <span className="font-mono text-sm text-foreground">
                      {chain?.id || "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common tasks with prefilled prompts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => navigate(`/wallet-dashboard/chat?prompt=${encodeURIComponent(action.prompt)}`)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left group"
                  >
                    <div className="p-2 rounded-md bg-primary/10">
                      <action.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{action.title}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </motion.button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* AI Assistant Section */}
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                AI Assistant
              </CardTitle>
              <CardDescription>
                Chat with AI to manage your wallet using natural language
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate("/wallet-dashboard/chat")}
                size="lg"
                className="w-full sm:w-auto"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Open Chat Assistant
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
