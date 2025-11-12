import { memo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Radar, Activity, Gauge, Coins, Cpu } from "lucide-react";
import { AgentScanMetaSnapshot, ScanTimeRange } from "../lib/scanTypes";

interface AgentScannerProps {
  meta: AgentScanMetaSnapshot;
  timeRange: ScanTimeRange;
  onRefresh: () => void;
  isRefreshing?: boolean;
  lastUpdated?: Date | null;
}

const formatPercent = (value: number) => {
  const percentage = (value ?? 0) * 100;
  return `${percentage < 1 ? percentage.toFixed(2) : percentage.toFixed(1)}%`;
};

const formatVolume = (value: number) => {
  if (!value) return "0";
  if (value > 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value > 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(2);
};

const formatTokens = (value: number) => {
  if (!Number.isFinite(value)) return "0";
  if (value > 10_000) return Math.round(value).toLocaleString();
  return value.toFixed(0);
};

const metricCards = [
  {
    key: "agents",
    label: "Tracked Agents",
    icon: Radar,
    getValue: (meta: AgentScanMetaSnapshot) => meta.totalAgents,
    accent: "from-cyan-500/40 to-blue-500/30",
  },
  {
    key: "active",
    label: "Active in Range",
    icon: Activity,
    getValue: (meta: AgentScanMetaSnapshot) => meta.activeAgents,
    accent: "from-emerald-500/30 to-lime-500/20",
  },
  {
    key: "success",
    label: "Avg Success",
    icon: Sparkles,
    getValue: (meta: AgentScanMetaSnapshot) => formatPercent(meta.averageSuccessRate),
    accent: "from-purple-500/30 to-indigo-500/20",
  },
  {
    key: "latency",
    label: "Avg Latency",
    icon: Gauge,
    getValue: (meta: AgentScanMetaSnapshot) => `${meta.averageLatencyMs.toFixed(0)} ms`,
    accent: "from-amber-500/30 to-orange-500/20",
  },
  {
    key: "tokens",
    label: "Avg Tokens",
    icon: Cpu,
    getValue: (meta: AgentScanMetaSnapshot) => formatTokens(meta.averageTokens),
    accent: "from-fuchsia-500/30 to-purple-500/20",
  },
  {
    key: "volume",
    label: "Tx Volume",
    icon: Coins,
    getValue: (meta: AgentScanMetaSnapshot) => `${formatVolume(meta.transactionVolume)} SOL`,
    accent: "from-pink-500/30 to-rose-500/20",
  },
];

export const AgentScanner = memo(({ meta, timeRange, onRefresh, isRefreshing, lastUpdated }: AgentScannerProps) => {
  const updatedLabel = lastUpdated ? lastUpdated.toLocaleTimeString() : "--";

  return (
    <Card className="bg-card/80 border border-white/10 shadow-xl">
      <CardContent className="py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-200 border-cyan-400/40">
                Scan
              </Badge>
              <span className="text-sm text-muted-foreground uppercase tracking-wider">
                {timeRange === "all" ? "Full history" : `Last ${timeRange}`}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mt-2">Agent Scanner</h1>
            <p className="text-muted-foreground mt-1 max-w-2xl">
              Monitor activity, transactions, and resource usage across your Lovable agent ecosystem in real time.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground">
              <span className="block">Updated {updatedLabel}</span>
            </div>
            <Button onClick={onRefresh} disabled={isRefreshing} variant="secondary" className="gap-2">
              <Radar className="h-4 w-4" /> {isRefreshing ? "Scanning" : "Rescan"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
          {metricCards.map((card, index) => {
            const Icon = card.icon;
            const value = card.getValue(meta);
            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="relative overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br from-background/80 to-background/60 shadow-inner">
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-40`} />
                  <div className="relative p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{card.label}</span>
                      <div className="p-2 rounded-lg bg-white/5">
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="text-2xl font-semibold text-white">
                      {typeof value === "number" ? value.toLocaleString() : value}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});

AgentScanner.displayName = "AgentScanner";
