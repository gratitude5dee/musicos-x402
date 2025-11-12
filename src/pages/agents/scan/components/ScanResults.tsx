import { memo } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AgentScanSummary } from "../lib/scanTypes";
import { deriveActivityHealth } from "../lib/scanUtils";
import { Loader2, MoreHorizontal, Activity, Info } from "lucide-react";

interface ScanResultsProps {
  summaries: AgentScanSummary[];
  isLoading: boolean;
  isFetching?: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
  onSelectAgent: (summary: AgentScanSummary) => void;
  selectedAgentId?: string | null;
}

const statusTone: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  cooldown: "bg-amber-500/20 text-amber-200 border border-amber-400/30",
  idle: "bg-slate-500/20 text-slate-200 border border-slate-400/30",
};

export const ScanResults = memo(({ summaries, isLoading, isFetching, onLoadMore, hasMore, onSelectAgent, selectedAgentId }: ScanResultsProps) => {
  if (isLoading) {
    return (
      <Card className="bg-card/70 border border-white/10 shadow-xl">
        <CardContent className="py-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-300" />
          <p className="text-muted-foreground">Scanning your agent mesh…</p>
        </CardContent>
      </Card>
    );
  }

  if (!summaries.length) {
    return (
      <Card className="bg-card/70 border border-dashed border-white/10 shadow-xl">
        <CardContent className="py-16 flex flex-col items-center justify-center gap-4 text-center">
          <Activity className="h-8 w-8 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">No activity detected</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              Adjust filters or deploy new agents to populate real-time scan results.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/70 border border-white/10 shadow-xl">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-white/5">
              <TableHead className="w-[220px]">Agent</TableHead>
              <TableHead>Creator</TableHead>
              <TableHead className="text-right">Activity</TableHead>
              <TableHead className="text-right">Success</TableHead>
              <TableHead className="text-right">Latency</TableHead>
              <TableHead className="text-right">Tokens</TableHead>
              <TableHead className="text-right">Resources</TableHead>
              <TableHead className="text-right">Transactions</TableHead>
              <TableHead className="w-[80px] text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summaries.map((summary, index) => {
              const activityHealth = deriveActivityHealth(summary);
              const badgeTone = statusTone[activityHealth] ?? statusTone.idle;
              const truncatedCreatorId =
                summary.creatorId.length > 10
                  ? `${summary.creatorId.slice(0, 6)}…${summary.creatorId.slice(-4)}`
                  : summary.creatorId;
              const hasDistinctLabel =
                Boolean(summary.creatorLabel) && summary.creatorLabel !== summary.creatorId;
              const creatorDisplay = hasDistinctLabel
                ? (summary.creatorLabel as string)
                : truncatedCreatorId;
              const showCreatorId = hasDistinctLabel;

              return (
                <motion.tr
                  key={summary.agentId}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`cursor-pointer transition-colors hover:bg-white/5 ${selectedAgentId === summary.agentId ? "bg-white/10" : ""}`}
                  onClick={() => onSelectAgent(summary)}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{summary.name}</span>
                      <span className="text-xs text-muted-foreground">{summary.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm text-foreground/90">{creatorDisplay}</span>
                      {showCreatorId && (
                        <span className="text-xs text-muted-foreground">{truncatedCreatorId}</span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {summary.lastActiveAt
                          ? `Updated ${formatDistanceToNow(new Date(summary.lastActiveAt), { addSuffix: true })}`
                          : "No activity"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-medium">{summary.activityCount.toLocaleString()}</span>
                      <Badge className={badgeTone}>{activityHealth}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {(summary.successRate * 100).toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right">{summary.averageLatencyMs.toFixed(0)} ms</TableCell>
                  <TableCell className="text-right">{Math.round(summary.averageTokens).toLocaleString()}</TableCell>
                  <TableCell className="text-right">{summary.resourceCount}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-medium">{summary.transactionCount.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">{summary.transactionVolume.toFixed(2)} SOL</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(event) => {
                      event.stopPropagation();
                      onSelectAgent(summary);
                    }}>
                      <Info className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </motion.tr>
              );
            })}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
          <div className="text-xs text-muted-foreground">
            Displaying {summaries.length} agents
          </div>
          <div className="flex items-center gap-2">
            {isFetching && <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />}
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={onLoadMore}
              disabled={!hasMore || isFetching}
            >
              <MoreHorizontal className="h-4 w-4" /> Load more
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ScanResults.displayName = "ScanResults";
