import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Clock, DollarSign, Zap, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AgentScanCardProps {
  agent: any;
  timeRange: '24h' | '7d' | '30d' | 'all';
}

export function AgentScanCard({ agent, timeRange }: AgentScanCardProps) {
  const navigate = useNavigate();

  // Fetch recent activity for this agent
  const { data: recentActivity } = useQuery({
    queryKey: ['agent-activity', agent.id, timeRange],
    queryFn: async () => {
      const now = new Date();
      let dateThreshold = new Date();

      switch (timeRange) {
        case '24h':
          dateThreshold.setHours(now.getHours() - 24);
          break;
        case '7d':
          dateThreshold.setDate(now.getDate() - 7);
          break;
        case '30d':
          dateThreshold.setDate(now.getDate() - 30);
          break;
        default:
          dateThreshold = new Date(0);
      }

      const { data, error } = await supabase
        .from('agent_activity_log')
        .select('activity_type, tool_status, cost_usd, tokens_used, latency_ms')
        .eq('agent_id', agent.id)
        .gte('created_at', dateThreshold.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      return {
        count: data.length,
        successRate: data.length > 0
          ? (data.filter(a => a.tool_status === 'success').length / data.length) * 100
          : 0,
        totalCost: data.reduce((sum, a) => sum + (a.cost_usd || 0), 0),
        avgLatency: data.length > 0
          ? data.reduce((sum, a) => sum + (a.latency_ms || 0), 0) / data.length
          : 0,
      };
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'paused':
        return 'bg-yellow-500';
      case 'disabled':
        return 'bg-red-500';
      case 'archived':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTypeGradient = (type: string) => {
    switch (type) {
      case 'studio':
        return 'from-purple-500 to-pink-500';
      case 'treasury':
        return 'from-green-500 to-emerald-500';
      case 'distribution':
        return 'from-blue-500 to-cyan-500';
      case 'rights':
        return 'from-orange-500 to-red-500';
      case 'analytics':
        return 'from-indigo-500 to-purple-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  return (
    <Card className="backdrop-blur-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-200 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {agent.avatar_url ? (
            <img
              src={agent.avatar_url}
              alt={agent.name}
              className="w-10 h-10 rounded-lg"
            />
          ) : (
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getTypeGradient(agent.type)} flex items-center justify-center`}>
              <Activity className="h-5 w-5 text-white" />
            </div>
          )}
          <div>
            <h3 className="font-medium text-foreground">{agent.name}</h3>
            <p className="text-xs text-muted-foreground">{agent.type}</p>
          </div>
        </div>
        <Badge
          variant="secondary"
          className={`${getStatusColor(agent.status)} text-white text-xs`}
        >
          {agent.status}
        </Badge>
      </div>

      {/* Description */}
      {agent.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {agent.description}
        </p>
      )}

      {/* Stats */}
      {recentActivity && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Activity className="h-3 w-3" />
              Activities
            </div>
            <p className="text-lg font-bold text-foreground">{recentActivity.count}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Zap className="h-3 w-3" />
              Success
            </div>
            <p className="text-lg font-bold text-green-400">
              {recentActivity.successRate.toFixed(0)}%
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              Cost
            </div>
            <p className="text-lg font-bold text-foreground">
              ${recentActivity.totalCost.toFixed(2)}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Avg Latency
            </div>
            <p className="text-lg font-bold text-foreground">
              {recentActivity.avgLatency.toFixed(0)}ms
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-white/10">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 hover:bg-white/5"
          onClick={() => navigate(`/observability?agent=${agent.id}`)}
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          View Details
        </Button>
      </div>
    </Card>
  );
}
