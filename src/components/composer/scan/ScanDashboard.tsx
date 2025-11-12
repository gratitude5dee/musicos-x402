import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScanFilters } from "@/pages/composer/ComposerScan";
import { AgentScanCard } from "./AgentScanCard";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ScanDashboardProps {
  filters: ScanFilters;
}

export function ScanDashboard({ filters }: ScanDashboardProps) {
  const { userId } = useAuth();

  // Fetch agents with activity data
  const { data: agents = [], isLoading, error } = useQuery({
    queryKey: ['agent-scan', userId, filters],
    enabled: !!userId,
    refetchInterval: 30000, // Refresh every 30 seconds
    queryFn: async () => {
      let query = supabase
        .from('agents')
        .select(`
          *,
          agent_activity_log(count)
        `)
        .eq('user_id', userId);

      // Apply filters
      if (filters.agentType) {
        query = query.eq('type', filters.agentType);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.searchQuery) {
        query = query.ilike('name', `%${filters.searchQuery}%`);
      }

      // Time range filter for last_active_at
      if (filters.timeRange !== 'all') {
        const now = new Date();
        let dateThreshold = new Date();

        switch (filters.timeRange) {
          case '24h':
            dateThreshold.setHours(now.getHours() - 24);
            break;
          case '7d':
            dateThreshold.setDate(now.getDate() - 7);
            break;
          case '30d':
            dateThreshold.setDate(now.getDate() - 30);
            break;
        }

        query = query.gte('last_active_at', dateThreshold.toISOString());
      }

      query = query.order('last_active_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });

  // Fetch activity summary
  const { data: activitySummary } = useQuery({
    queryKey: ['activity-summary', userId, filters.timeRange],
    enabled: !!userId,
    queryFn: async () => {
      const now = new Date();
      let dateThreshold = new Date();

      switch (filters.timeRange) {
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
          dateThreshold = new Date(0); // All time
      }

      const { data, error } = await supabase
        .from('agent_activity_log')
        .select('activity_type, tool_status, cost_usd, tokens_used')
        .eq('user_id', userId)
        .gte('created_at', dateThreshold.toISOString());

      if (error) throw error;

      const summary = {
        totalActivities: data.length,
        successfulActivities: data.filter(a => a.tool_status === 'success').length,
        failedActivities: data.filter(a => a.tool_status === 'failure').length,
        totalCost: data.reduce((sum, a) => sum + (a.cost_usd || 0), 0),
        totalTokens: data.reduce((sum, a) => sum + (a.tokens_used || 0), 0),
      };

      return summary;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load agent data. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      {activitySummary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="backdrop-blur-xl bg-white/5 border border-white/10 p-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total Agents</p>
              <p className="text-2xl font-bold text-foreground">{agents.length}</p>
            </div>
          </Card>
          <Card className="backdrop-blur-xl bg-white/5 border border-white/10 p-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total Activities</p>
              <p className="text-2xl font-bold text-foreground">{activitySummary.totalActivities}</p>
            </div>
          </Card>
          <Card className="backdrop-blur-xl bg-white/5 border border-white/10 p-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold text-green-400">
                {activitySummary.totalActivities > 0
                  ? Math.round((activitySummary.successfulActivities / activitySummary.totalActivities) * 100)
                  : 0}%
              </p>
            </div>
          </Card>
          <Card className="backdrop-blur-xl bg-white/5 border border-white/10 p-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total Cost</p>
              <p className="text-2xl font-bold text-foreground">
                ${activitySummary.totalCost.toFixed(2)}
              </p>
            </div>
          </Card>
          <Card className="backdrop-blur-xl bg-white/5 border border-white/10 p-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Tokens Used</p>
              <p className="text-2xl font-bold text-foreground">
                {(activitySummary.totalTokens / 1000).toFixed(1)}K
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Agent Cards */}
      {agents.length === 0 ? (
        <Card className="backdrop-blur-xl bg-white/5 border border-white/10 p-12">
          <div className="text-center space-y-2">
            <p className="text-lg text-muted-foreground">No agents found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or create a new agent
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.href = '/create-agent'}
            >
              Create Agent
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <AgentScanCard key={agent.id} agent={agent} timeRange={filters.timeRange} />
          ))}
        </div>
      )}
    </div>
  );
}
