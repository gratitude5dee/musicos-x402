import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import ComposerLayout from "@/layouts/composer-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radio, Activity, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ComposerFeed() {
  const { user } = useAuth();
  const userId = user?.id;

  // Fetch recent agent activity
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['agent-feed', userId],
    enabled: !!userId,
    refetchInterval: 10000, // Refresh every 10 seconds
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_activity_log')
        .select(`
          *,
          agents (
            id,
            name,
            type,
            avatar_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failure':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      tool_call: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      planning: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      approval_requested: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      approved: 'bg-green-500/10 text-green-400 border-green-500/20',
      rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
      execution: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    };
    return colors[type] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  };

  return (
    <ComposerLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 shadow-lg">
              <Radio className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Activity Feed
              </h1>
              <p className="text-sm text-muted-foreground">
                Real-time updates from your agents
              </p>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : activities.length === 0 ? (
          <Card className="backdrop-blur-xl bg-white/5 border border-white/10 p-12">
            <div className="text-center space-y-2">
              <Radio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">No activity yet</p>
              <p className="text-sm text-muted-foreground">
                Agent activities will appear here as they happen
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <Card
                key={activity.id}
                className="backdrop-blur-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-200 p-4"
              >
                <div className="flex items-start gap-4">
                  {/* Agent Avatar */}
                  <div className="flex-shrink-0">
                    {activity.agents?.avatar_url ? (
                      <img
                        src={activity.agents.avatar_url}
                        alt={activity.agents.name}
                        className="w-10 h-10 rounded-lg"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Activity Details */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">
                          {activity.agents?.name || 'Unknown Agent'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className={`text-xs ${getActivityColor(activity.activity_type)}`}
                          >
                            {activity.activity_type?.replace(/_/g, ' ')}
                          </Badge>
                          {activity.tool_name && (
                            <Badge variant="outline" className="text-xs border-white/10">
                              {activity.tool_name}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(activity.tool_status)}
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>

                    {/* Additional Info */}
                    {(activity.latency_ms || activity.cost_usd || activity.tokens_used) && (
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {activity.latency_ms && (
                          <span>⚡ {activity.latency_ms}ms</span>
                        )}
                        {activity.tokens_used && (
                          <span>🎯 {activity.tokens_used} tokens</span>
                        )}
                        {activity.cost_usd && (
                          <span>💰 ${activity.cost_usd.toFixed(4)}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ComposerLayout>
  );
}
