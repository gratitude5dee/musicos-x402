import { supabase } from "@/integrations/supabase/client";
import {
  AgentAnalyticsPayload,
  AgentScanSummary,
  ScanQueryParams,
  ScanQueryResult,
  ScanTimeRange,
} from "./scanTypes";
import {
  DEFAULT_SCAN_LIMIT,
  buildQueryArgs,
  computeMetaSnapshot,
  ensureAnalyticsPayload,
  filterSummaries,
  mergeTimeseriesWithDefaults,
  parseCursor,
  resolveCreatorLabel,
  serializeCursor,
  sortSummaries,
} from "./scanUtils";

type AgentScanRow = {
  agent_id: string;
  agent_name: string;
  agent_type: string;
  agent_status: string;
  user_id: string;
  created_at: string;
  last_active_at: string | null;
  activity_count: number | null;
  success_rate: number | null;
  avg_latency: number | null;
  avg_tokens: number | null;
  transaction_count: number | null;
  transaction_volume: number | null;
  resource_count: number | null;
  metadata: unknown;
  total_count: number | null;
};

const coerceNumber = (value: unknown, fallback = 0) => {
  if (value === null || value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const mapSummary = (row: AgentScanRow): AgentScanSummary => {
  const metadata = (row.metadata ?? null) as AgentScanSummary["metadata"];

  return {
    agentId: row.agent_id,
    name: row.agent_name,
    type: row.agent_type,
    status: row.agent_status,
    creatorId: row.user_id,
    creatorLabel: resolveCreatorLabel(metadata, row.user_id),
    createdAt: row.created_at,
    lastActiveAt: row.last_active_at ?? null,
    activityCount: coerceNumber(row.activity_count),
    successRate: coerceNumber(row.success_rate),
    averageLatencyMs: coerceNumber(row.avg_latency),
    averageTokens: coerceNumber(row.avg_tokens),
    transactionCount: coerceNumber(row.transaction_count),
    transactionVolume: coerceNumber(row.transaction_volume),
    resourceCount: coerceNumber(row.resource_count),
    metadata,
  };
};

export const fetchAgentScanSummaries = async ({
  filters,
  limit = DEFAULT_SCAN_LIMIT,
  cursor,
}: ScanQueryParams): Promise<ScanQueryResult> => {
  const offset = parseCursor(cursor);
  const args = {
    ...buildQueryArgs(filters),
    p_limit: limit,
    p_offset: offset,
  };

  const { data, error } = await supabase.rpc("get_agent_scan_summaries", args);
  if (error) throw error;

  const rawRows = data ?? [];
  const total = rawRows.length ? coerceNumber(rawRows[0]?.total_count, rawRows.length) : 0;
  const summaries = rawRows.map(mapSummary);
  const filtered = filterSummaries(summaries, filters.search);
  const ordered = sortSummaries(filtered, filters.sortBy);
  const meta = computeMetaSnapshot(ordered);
  const hasMore = offset + (rawRows.length ?? 0) < total;

  return {
    summaries: ordered,
    total,
    nextCursor: hasMore ? serializeCursor(offset + limit) : null,
    meta,
  };
};

export const fetchAgentAnalytics = async (
  agentId: string,
  timeRange: ScanTimeRange,
): Promise<AgentAnalyticsPayload> => {
  const { data, error } = await supabase.rpc("get_agent_scan_analytics", {
    p_agent_id: agentId,
    p_time_range: timeRange,
  });

  if (error) throw error;
  const payload = ensureAnalyticsPayload(data as AgentAnalyticsPayload | null);
  return {
    ...payload,
    timeseries: mergeTimeseriesWithDefaults(payload.timeseries, timeRange),
  };
};
