import ComposerLayout from "@/layouts/composer-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare, Users, Scan, Radio } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ComposerHome() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Agent Chat",
      description: "Interact with your AI agents in real-time conversations",
      icon: MessageSquare,
      path: "/composer/chat",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Agent Management",
      description: "View and manage all your active agents",
      icon: Users,
      path: "/composer/agents",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Agent Scanner",
      description: "Scan and analyze agent activity, resources, and performance",
      icon: Scan,
      path: "/composer/scan",
      gradient: "from-green-500 to-emerald-500",
      isNew: true,
    },
    {
      title: "Activity Feed",
      description: "Monitor agent activities and system events",
      icon: Radio,
      path: "/composer/feed",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  return (
    <ComposerLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome to Composer
          </h1>
          <p className="text-lg text-muted-foreground">
            Your central hub for managing AI agents and workflows
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.path}
                className="backdrop-blur-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer group p-6"
                onClick={() => navigate(feature.path)}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} shadow-lg`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium text-foreground">
                        {feature.title}
                      </h3>
                      {feature.isNew && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="group-hover:translate-x-1 transition-transform duration-200 p-0 h-auto text-purple-400 hover:text-purple-300"
                    >
                      Explore <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="backdrop-blur-xl bg-white/5 border border-white/10 p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Active Agents</p>
              <p className="text-3xl font-bold text-foreground">12</p>
              <p className="text-xs text-green-400">+2 from last week</p>
            </div>
          </Card>
          <Card className="backdrop-blur-xl bg-white/5 border border-white/10 p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Activities</p>
              <p className="text-3xl font-bold text-foreground">1,234</p>
              <p className="text-xs text-blue-400">+156 today</p>
            </div>
          </Card>
          <Card className="backdrop-blur-xl bg-white/5 border border-white/10 p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Resource Usage</p>
              <p className="text-3xl font-bold text-foreground">78%</p>
              <p className="text-xs text-orange-400">Within limits</p>
            </div>
          </Card>
        </div>
      </div>
    </ComposerLayout>
  );
}
