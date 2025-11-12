import { useNavigate } from "react-router-dom";
import ComposerLayout from "@/layouts/composer-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAgent } from "@/context/AgentContext";
import { Users, Plus, Calendar, CreditCard, Globe, Shield, Activity } from "lucide-react";

export default function ComposerAgents() {
  const navigate = useNavigate();
  const { agents, isLoading } = useAgent();

  const agentCollections = [
    {
      name: "Booking Agent",
      path: "/collection/booking-agent",
      icon: Calendar,
      gradient: "from-purple-500 to-pink-500",
      description: "Manage gigs, contracts, and payments",
    },
    {
      name: "Invoice Agent",
      path: "/collection/invoice-agent",
      icon: CreditCard,
      gradient: "from-green-500 to-emerald-500",
      description: "Generate and track invoices",
    },
    {
      name: "Social Media Agent",
      path: "/collection/social-media",
      icon: Globe,
      gradient: "from-blue-500 to-cyan-500",
      description: "Automate social media posting",
    },
    {
      name: "Contract Agent",
      path: "/collection/contract-agent",
      icon: Shield,
      gradient: "from-orange-500 to-red-500",
      description: "Handle legal documents and agreements",
    },
  ];

  return (
    <ComposerLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Agent Management</h1>
            <p className="text-sm text-muted-foreground">
              View and manage your AI agent collection
            </p>
          </div>
          <Button
            onClick={() => navigate('/create-agent')}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Agent
          </Button>
        </div>

        {/* Agent Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="backdrop-blur-xl bg-white/5 border border-white/10 p-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Agents</p>
              <p className="text-3xl font-bold text-foreground">
                {isLoading ? '...' : agents.length}
              </p>
            </div>
          </Card>
          <Card className="backdrop-blur-xl bg-white/5 border border-white/10 p-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Active Agents</p>
              <p className="text-3xl font-bold text-green-400">
                {isLoading ? '...' : agents.filter(a => a.status === 'active').length}
              </p>
            </div>
          </Card>
          <Card className="backdrop-blur-xl bg-white/5 border border-white/10 p-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Agent Types</p>
              <p className="text-3xl font-bold text-blue-400">
                {isLoading ? '...' : new Set(agents.map(a => a.type)).size}
              </p>
            </div>
          </Card>
        </div>

        {/* Agent Collections */}
        <div>
          <h2 className="text-lg font-medium text-foreground mb-4">
            Agent Collections
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agentCollections.map((collection) => {
              const Icon = collection.icon;
              return (
                <Card
                  key={collection.path}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer group p-6"
                  onClick={() => navigate(collection.path)}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${collection.gradient} shadow-lg`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-foreground group-hover:text-purple-400 transition-colors">
                        {collection.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {collection.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-medium text-foreground mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 border-white/10 hover:bg-white/5 flex flex-col items-start gap-2"
              onClick={() => navigate('/agent-marketplace')}
            >
              <Users className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Browse Marketplace</div>
                <div className="text-xs text-muted-foreground">
                  Discover new agents
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 border-white/10 hover:bg-white/5 flex flex-col items-start gap-2"
              onClick={() => navigate('/composer/scan')}
            >
              <Activity className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Scan Agents</div>
                <div className="text-xs text-muted-foreground">
                  Analyze performance
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[10px]">
                NEW
              </Badge>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 border-white/10 hover:bg-white/5 flex flex-col items-start gap-2"
              onClick={() => navigate('/observability')}
            >
              <Activity className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">View Logs</div>
                <div className="text-xs text-muted-foreground">
                  Monitor activity
                </div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </ComposerLayout>
  );
}
