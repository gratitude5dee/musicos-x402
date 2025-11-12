import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { ScanFilters } from "@/pages/composer/ComposerScan";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

interface ScanAnalyticsProps {
  filters: ScanFilters;
}

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

export function ScanAnalytics({ filters }: ScanAnalyticsProps) {
  const { userId } = useAuth();

  // Fetch analytics data
  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['agent-analytics', userId, filters.timeRange],
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
          dateThreshold = new Date(0);
      }

      // Fetch activity data
      const { data: activities, error: activityError } = await supabase
        .from('agent_activity_log')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', dateThreshold.toISOString())
        .order('created_at', { ascending: true });

      if (activityError) throw activityError;

      // Fetch agents
      const { data: agents, error: agentsError } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', userId);

      if (agentsError) throw agentsError;

      // Process data for charts

      // 1. Activity by Type
      const activityByType = activities.reduce((acc, activity) => {
        const type = activity.activity_type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const activityTypeData = Object.entries(activityByType).map(([name, value]) => ({
        name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value,
      }));

      // 2. Agent Type Distribution
      const agentsByType = agents.reduce((acc, agent) => {
        const type = agent.type || 'custom';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const agentTypeData = Object.entries(agentsByType).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));

      // 3. Success Rate Over Time
      const dailyStats = activities.reduce((acc, activity) => {
        const date = new Date(activity.created_at).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { date, total: 0, success: 0, failed: 0 };
        }
        acc[date].total++;
        if (activity.tool_status === 'success') acc[date].success++;
        if (activity.tool_status === 'failure') acc[date].failed++;
        return acc;
      }, {} as Record<string, any>);

      const timeSeriesData = Object.values(dailyStats).map((day: any) => ({
        date: day.date,
        successRate: day.total > 0 ? Math.round((day.success / day.total) * 100) : 0,
        activities: day.total,
      }));

      // 4. Top Agents by Activity
      const agentActivity = activities.reduce((acc, activity) => {
        const agentId = activity.agent_id;
        acc[agentId] = (acc[agentId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topAgents = Object.entries(agentActivity)
        .map(([agentId, count]) => {
          const agent = agents.find(a => a.id === agentId);
          return {
            name: agent?.name || 'Unknown',
            activities: count,
          };
        })
        .sort((a, b) => b.activities - a.activities)
        .slice(0, 5);

      // 5. Cost Analysis
      const costByAgent = activities.reduce((acc, activity) => {
        const agentId = activity.agent_id;
        acc[agentId] = (acc[agentId] || 0) + (activity.cost_usd || 0);
        return acc;
      }, {} as Record<string, number>);

      const costData = Object.entries(costByAgent)
        .map(([agentId, cost]) => {
          const agent = agents.find(a => a.id === agentId);
          return {
            name: agent?.name || 'Unknown',
            cost: parseFloat(cost.toFixed(2)),
          };
        })
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 5);

      return {
        activityTypeData,
        agentTypeData,
        timeSeriesData,
        topAgents,
        costData,
      };
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
          Failed to load analytics data. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="space-y-6">
      {/* Activity Type Distribution */}
      <Card className="backdrop-blur-xl bg-white/5 border border-white/10 p-6">
        <h3 className="text-lg font-medium text-foreground mb-4">
          Activity Distribution by Type
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={analyticsData.activityTypeData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              label={(entry) => `${entry.name}: ${entry.value}`}
            >
              {analyticsData.activityTypeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Success Rate Over Time */}
      <Card className="backdrop-blur-xl bg-white/5 border border-white/10 p-6">
        <h3 className="text-lg font-medium text-foreground mb-4">
          Success Rate & Activity Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analyticsData.timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="date"
              stroke="rgba(255,255,255,0.5)"
              fontSize={12}
            />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="successRate"
              stroke="#10B981"
              strokeWidth={2}
              name="Success Rate (%)"
            />
            <Line
              type="monotone"
              dataKey="activities"
              stroke="#3B82F6"
              strokeWidth={2}
              name="Total Activities"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Agents by Activity */}
        <Card className="backdrop-blur-xl bg-white/5 border border-white/10 p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">
            Most Active Agents
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.topAgents} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={12} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="rgba(255,255,255,0.5)"
                fontSize={12}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="activities" fill="#8B5CF6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Cost by Agent */}
        <Card className="backdrop-blur-xl bg-white/5 border border-white/10 p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">
            Cost by Agent
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.costData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={12} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="rgba(255,255,255,0.5)"
                fontSize={12}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => `$${value.toFixed(2)}`}
              />
              <Bar dataKey="cost" fill="#10B981" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Agent Type Distribution */}
      <Card className="backdrop-blur-xl bg-white/5 border border-white/10 p-6">
        <h3 className="text-lg font-medium text-foreground mb-4">
          Agent Distribution by Type
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analyticsData.agentTypeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
