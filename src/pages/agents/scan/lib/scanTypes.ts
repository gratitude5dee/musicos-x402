import type { Json } from "@/integrations/supabase/types";

export type ScanTimeRange = "24h" | "7d" | "30d" | "all";
export type ScanSortOption =
  | "activity"
  | "creation-date"
  | "transaction-volume"
  | "resource-count"
  | "token-usage";

export interface AgentScanFilters {
  facilitatorId?: string;
  networkId?: string;
  resourceType?: string;
  timeRange: ScanTimeRange;
  search?: string;
  sortBy: ScanSortOption;
}

export interface AgentScanSummary {
  agentId: string;
  name: string;
  type: string;
  status: string;
  creatorId: string;
  creatorLabel?: string | null;
  createdAt: string;
  lastActiveAt: string | null;
  activityCount: number;
  successRate: number;
  averageLatencyMs: number;
  averageTokens: number;
  transactionCount: number;
  transactionVolume: number;
  resourceCount: number;
  metadata: Json | null;
}

export interface AgentScanResponse {
  summaries: AgentScanSummary[];
  total: number;
  nextCursor: string | null;
}

export interface AgentAnalyticsTimeseriesPoint {
  period: string;
  activityCount: number;
  successCount: number;
  failureCount: number;
  avgLatencyMs: number;
  avgTokens: number;
  transactionCount: number;
  transactionVolume: number;
}

export interface AgentAnalyticsTopTool {
  tool: string;
  count: number;
}

export interface AgentAnalyticsTotals {
  activity: number;
  success: number;
  transactions: number;
  transactionVolume: number;
}

export interface AgentAnalyticsPayload {
  timeseries: AgentAnalyticsTimeseriesPoint[];
  topTools: AgentAnalyticsTopTool[];
  totals: AgentAnalyticsTotals;
  successRate: number;
}

export interface AgentScanMetaSnapshot {
  totalAgents: number;
  activeAgents: number;
  averageSuccessRate: number;
  averageLatencyMs: number;
  averageTokens: number;
  transactionVolume: number;
}

export interface ScanQueryParams {
  filters: AgentScanFilters;
  limit?: number;
  cursor?: string | null;
}

export interface ScanQueryResult extends AgentScanResponse {
  meta: AgentScanMetaSnapshot;
}
