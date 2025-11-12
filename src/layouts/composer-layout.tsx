import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/layouts/dashboard-layout";
import { Home, MessageSquare, Users, Scan, Radio, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ComposerLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export default function ComposerLayout({ children, title, subtitle }: ComposerLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { value: "home", label: "Home", path: "/composer", icon: Home },
    { value: "chat", label: "Chat", path: "/composer/chat", icon: MessageSquare },
    { value: "agents", label: "Agents", path: "/composer/agents", icon: Users },
    { value: "scan", label: "Scan", path: "/composer/scan", icon: Scan, isNew: true },
    { value: "feed", label: "Feed", path: "/composer/feed", icon: Radio },
  ];

  const currentTab = tabs.find((tab) => location.pathname.startsWith(tab.path))?.value || "home";

  return (
    <DashboardLayout>
      {/* Premium App Bar - Composer Style */}
      <div className="border-b border-white/10 bg-background/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-medium text-foreground">
              UniversalAI / <span className="text-muted-foreground">Composer</span>
            </h1>
          </div>
        </div>

        {/* Premium Tabs */}
        <div className="px-6 pb-3">
          <Tabs value={currentTab} onValueChange={(value) => {
            const tab = tabs.find((t) => t.value === value);
            if (tab) navigate(tab.path);
          }}>
            <TabsList className="glass-card border border-white/10 p-1 h-auto bg-background/50 backdrop-blur-xl">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.value;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/20 gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 hover:bg-white/5 relative"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{tab.label}</span>
                    {tab.isNew && (
                      <Badge
                        variant="secondary"
                        className="ml-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[10px] px-1.5 py-0 h-4"
                      >
                        NEW
                      </Badge>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
