import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Zap,
  Clock,
  Target,
  Lightbulb,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface CostMetrics {
  total_spend: number;
  avg_cost_per_execution: number;
  highest_cost_agent: string;
  total_tokens: number;
  trend: 'up' | 'down' | 'stable';
  projected_monthly: number;
  budget_usage_percent: number;
}

interface Recommendation {
  type: 'warning' | 'info' | 'success';
  title: string;
  description: string;
  potential_savings: number;
  action?: string;
}

const CostOptimizer = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<CostMetrics | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCostMetrics();
    }
  }, [user]);

  const loadCostMetrics = async () => {
    try {
      setIsLoading(true);

      // Get agent activity data
      const { data: activities } = await supabase
        .from('agent_activity_log')
        .select('*, agents(name)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (!activities || activities.length === 0) {
        setMetrics({
          total_spend: 0,
          avg_cost_per_execution: 0,
          highest_cost_agent: 'N/A',
          total_tokens: 0,
          trend: 'stable',
          projected_monthly: 0,
          budget_usage_percent: 0,
        });
        return;
      }

      // Calculate metrics
      const total_spend = activities.reduce((sum, a) => sum + (a.cost_usd || 0), 0);
      const total_tokens = activities.reduce((sum, a) => sum + (a.tokens_used || 0), 0);
      const avg_cost_per_execution = total_spend / activities.length;

      // Find highest cost agent
      const costByAgent = activities.reduce((acc, a) => {
        const agentName = a.agents?.name || 'Unknown';
        acc[agentName] = (acc[agentName] || 0) + (a.cost_usd || 0);
        return acc;
      }, {} as Record<string, number>);

      const highest_cost_agent = Object.entries(costByAgent).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

      // Calculate trend (comparing last 50 vs previous 50)
      const recentCost = activities.slice(0, 50).reduce((sum, a) => sum + (a.cost_usd || 0), 0);
      const previousCost = activities.slice(50, 100).reduce((sum, a) => sum + (a.cost_usd || 0), 0);
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (recentCost > previousCost * 1.1) trend = 'up';
      else if (recentCost < previousCost * 0.9) trend = 'down';

      // Project monthly cost (assume these 100 activities represent a proportional sample)
      const daysRange = Math.max(
        1,
        (new Date(activities[0].created_at).getTime() - new Date(activities[activities.length - 1].created_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      const projected_monthly = (total_spend / daysRange) * 30;

      const metrics: CostMetrics = {
        total_spend,
        avg_cost_per_execution,
        highest_cost_agent,
        total_tokens,
        trend,
        projected_monthly,
        budget_usage_percent: Math.min(100, (projected_monthly / 100) * 100), // Assume $100 budget
      };

      setMetrics(metrics);

      // Generate recommendations
      const recs: Recommendation[] = [];

      if (metrics.budget_usage_percent > 80) {
        recs.push({
          type: 'warning',
          title: 'Budget Alert',
          description: 'You are approaching your monthly budget limit',
          potential_savings: 0,
          action: 'Review high-cost agents',
        });
      }

      if (metrics.avg_cost_per_execution > 0.1) {
        recs.push({
          type: 'info',
          title: 'High Per-Execution Cost',
          description: 'Consider optimizing agent prompts or using smaller models',
          potential_savings: metrics.avg_cost_per_execution * 0.3 * activities.length,
          action: 'Optimize prompts',
        });
      }

      if (metrics.trend === 'up') {
        recs.push({
          type: 'warning',
          title: 'Rising Costs',
          description: 'Your agent costs have increased recently',
          potential_savings: 0,
          action: 'Analyze activity patterns',
        });
      }

      // Check for idle agents with high activity
      const agentActivityCount = activities.reduce((acc, a) => {
        acc[a.agent_id] = (acc[a.agent_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const highActivityAgents = Object.entries(agentActivityCount).filter(([_, count]) => count > 20);
      if (highActivityAgents.length > 0) {
        recs.push({
          type: 'info',
          title: 'High-Activity Agents',
          description: `${highActivityAgents.length} agents have high activity. Consider caching results.`,
          potential_savings: total_spend * 0.15,
          action: 'Enable caching',
        });
      }

      if (metrics.trend === 'down') {
        recs.push({
          type: 'success',
          title: 'Cost Reduction Success',
          description: 'Your optimization efforts are paying off!',
          potential_savings: 0,
        });
      }

      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading cost metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Cost Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 backdrop-blur-xl bg-white/5 border-white/10">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-5 w-5 text-green-400" />
            {metrics.trend === 'up' && <TrendingUp className="h-4 w-4 text-red-400" />}
            {metrics.trend === 'down' && <TrendingDown className="h-4 w-4 text-green-400" />}
          </div>
          <p className="text-sm text-muted-foreground">Total Spend</p>
          <p className="text-2xl font-bold">${metrics.total_spend.toFixed(2)}</p>
        </Card>

        <Card className="p-4 backdrop-blur-xl bg-white/5 border-white/10">
          <div className="flex items-center justify-between mb-2">
            <Zap className="h-5 w-5 text-yellow-400" />
          </div>
          <p className="text-sm text-muted-foreground">Avg Per Execution</p>
          <p className="text-2xl font-bold">${metrics.avg_cost_per_execution.toFixed(4)}</p>
        </Card>

        <Card className="p-4 backdrop-blur-xl bg-white/5 border-white/10">
          <div className="flex items-center justify-between mb-2">
            <Target className="h-5 w-5 text-blue-400" />
          </div>
          <p className="text-sm text-muted-foreground">Projected Monthly</p>
          <p className="text-2xl font-bold">${metrics.projected_monthly.toFixed(2)}</p>
        </Card>

        <Card className="p-4 backdrop-blur-xl bg-white/5 border-white/10">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-5 w-5 text-purple-400" />
          </div>
          <p className="text-sm text-muted-foreground">Total Tokens</p>
          <p className="text-2xl font-bold">{metrics.total_tokens.toLocaleString()}</p>
        </Card>
      </div>

      {/* Budget Usage */}
      <Card className="p-6 backdrop-blur-xl bg-white/5 border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Budget Usage</h3>
            <p className="text-sm text-muted-foreground">Based on projected monthly spend</p>
          </div>
          <Badge variant={metrics.budget_usage_percent > 80 ? 'destructive' : 'default'}>
            {metrics.budget_usage_percent.toFixed(0)}%
          </Badge>
        </div>
        <Progress value={metrics.budget_usage_percent} className="h-2" />
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span>${metrics.projected_monthly.toFixed(2)} / $100.00</span>
          <span>${(100 - metrics.projected_monthly).toFixed(2)} remaining</span>
        </div>
      </Card>

      {/* Recommendations */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-yellow-400" />
          <h3 className="font-semibold">Optimization Recommendations</h3>
        </div>

        <div className="space-y-3">
          {recommendations.map((rec, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card
                className={`p-4 backdrop-blur-xl border ${
                  rec.type === 'warning'
                    ? 'bg-orange-500/10 border-orange-500/20'
                    : rec.type === 'success'
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-blue-500/10 border-blue-500/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  {rec.type === 'warning' && <AlertTriangle className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />}
                  {rec.type === 'info' && <Lightbulb className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />}
                  {rec.type === 'success' && <TrendingDown className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />}

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium">{rec.title}</p>
                      {rec.potential_savings > 0 && (
                        <Badge variant="outline" className="bg-green-500/20 border-green-500/30 text-green-400">
                          Save ${rec.potential_savings.toFixed(2)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                    {rec.action && (
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        {rec.action}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Top Cost Agents */}
      <Card className="p-6 backdrop-blur-xl bg-white/5 border-white/10">
        <h3 className="font-semibold mb-4">Highest Cost Agent</h3>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-purple-500/20">
            <DollarSign className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <p className="font-medium">{metrics.highest_cost_agent}</p>
            <p className="text-sm text-muted-foreground">
              Consider optimizing this agent's prompts or reducing its activity
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CostOptimizer;
