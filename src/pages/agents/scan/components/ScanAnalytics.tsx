import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AgentAnalyticsPayload, AgentScanSummary, ScanTimeRange } from "../lib/scanTypes";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { mergeTimeseriesWithDefaults } from "../lib/scanUtils";
import { Activity, BarChart3 } from "lucide-react";

interface ScanAnalyticsProps {
  agent?: AgentScanSummary | null;
  analytics?: AgentAnalyticsPayload | null;
  timeRange: ScanTimeRange;
  isLoading?: boolean;
}

const AnalyticsSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Skeleton className="h-64" />
    <Skeleton className="h-64" />
  </div>
);

export const ScanAnalytics = memo(({ agent, analytics, timeRange, isLoading }: ScanAnalyticsProps) => {
  if (!agent) {
    return (
      <Card className="bg-card/70 border border-dashed border-white/10 shadow-xl">
        <CardContent className="py-16 flex flex-col items-center justify-center gap-4 text-center">
          <BarChart3 className="h-8 w-8 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">Select an agent to inspect analytics</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              Choose a row from the scan results to view detailed activity, resource usage, and transaction flow.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-card/70 border border-white/10 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-300" />
            Loading analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnalyticsSkeleton />
        </CardContent>
      </Card>
    );
  }

  const resolvedAnalytics = analytics ?? {
    timeseries: [],
    topTools: [],
    totals: {
      activity: 0,
      success: 0,
      transactions: 0,
      transactionVolume: 0,
    },
    successRate: 0,
  };

  const timeseries = mergeTimeseriesWithDefaults(resolvedAnalytics.timeseries, timeRange);

  return (
    <Card className="bg-card/70 border border-white/10 shadow-xl">
      <CardHeader className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-200 border-emerald-400/40">
            {agent.type}
          </Badge>
          <CardTitle className="text-xl font-semibold text-foreground">{agent.name}</CardTitle>
        </div>
        <div className="text-sm text-muted-foreground flex flex-wrap gap-3">
          <span>Success {resolvedAnalytics.successRate ? (resolvedAnalytics.successRate * 100).toFixed(1) : "0.0"}%</span>
          <span>Transactions {resolvedAnalytics.totals.transactions.toLocaleString()}</span>
          <span>Volume {resolvedAnalytics.totals.transactionVolume.toFixed(2)} SOL</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Activity timeline</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeseries}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="period" stroke="rgba(148,163,184,0.6)" fontSize={12} tickLine={false} />
                <YAxis stroke="rgba(148,163,184,0.6)" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ stroke: "rgba(148,163,184,0.4)", strokeDasharray: "3 3" }}
                  contentStyle={{ background: "rgba(15,23,42,0.9)", borderRadius: 12, border: "1px solid rgba(148,163,184,0.3)" }}
                />
                <Line type="monotone" dataKey="activityCount" stroke="#34d399" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="successCount" stroke="#38bdf8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="h-72">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Transaction velocity</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeseries}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="period" stroke="rgba(148,163,184,0.6)" fontSize={12} tickLine={false} />
                <YAxis stroke="rgba(148,163,184,0.6)" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "rgba(56,189,248,0.1)" }}
                  contentStyle={{ background: "rgba(15,23,42,0.9)", borderRadius: 12, border: "1px solid rgba(148,163,184,0.3)" }}
                />
                <Bar dataKey="transactionCount" fill="rgba(56,189,248,0.7)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="transactionVolume" fill="rgba(16,185,129,0.6)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Top tools</h3>
          {resolvedAnalytics.topTools.length ? (
            <div className="flex flex-wrap gap-2">
              {resolvedAnalytics.topTools.map((tool) => (
                <Badge key={tool.tool} className="bg-white/5 border border-white/10 text-sm">
                  {tool.tool} <span className="ml-1 text-xs text-muted-foreground">×{tool.count}</span>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No tool usage recorded during this window.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

ScanAnalytics.displayName = "ScanAnalytics";
