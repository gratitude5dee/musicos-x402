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
  // Query agents directly since RPC functions don't exist
  const { data: agentsData, error } = await supabase
    .from('agent_activity_log')
    .select(`
      agent_id,
      agents!inner(*)
    `)
    .limit(limit)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const rawRows = agentsData ?? [];
  const total = rawRows.length;
  
  // Group by agent and create summaries
  const agentMap = new Map<string, AgentScanRow>();
  rawRows.forEach(row => {
    const agentId = row.agent_id;
    if (!agentMap.has(agentId) && row.agents) {
      const agent = row.agents as any;
      agentMap.set(agentId, {
        agent_id: agentId,
        agent_name: agent.name || 'Unknown Agent',
        agent_type: agent.type || 'custom',
        agent_status: agent.status || 'active',
        user_id: agent.user_id || '',
        created_at: agent.created_at || new Date().toISOString(),
        last_active_at: agent.last_active_at,
        activity_count: 0,
        success_rate: 0,
        avg_latency: null,
        avg_tokens: null,
        transaction_count: null,
        transaction_volume: null,
        resource_count: null,
        metadata: agent.metadata || null,
        total_count: total,
      });
    }
  });
  
  const summaries = Array.from(agentMap.values()).map(mapSummary);
  const filtered = filterSummaries(summaries, filters.search);
  const ordered = sortSummaries(filtered, filters.sortBy);
  const meta = computeMetaSnapshot(ordered);

  return {
    summaries: ordered,
    total,
    nextCursor: null, // Simple implementation - no pagination for now
    meta,
  };
};

export const fetchAgentAnalytics = async (
  agentId: string,
  timeRange: ScanTimeRange,
): Promise<AgentAnalyticsPayload> => {
  // Query activity logs directly since RPC function doesn't exist
  const { data, error } = await supabase
    .from('agent_activity_log')
    .select('*')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;

  // Create a basic analytics payload from the data
  const activities = data ?? [];
  const payload: AgentAnalyticsPayload = {
    timeseries: [],
    topTools: [],
    totals: {
      activity: activities.length,
      success: activities.filter(a => a.tool_status === 'success').length,
      transactions: 0,
      transactionVolume: 0,
    },
    successRate: activities.length > 0 
      ? (activities.filter(a => a.tool_status === 'success').length / activities.length) * 100 
      : 0,
  };

  return {
    ...payload,
    timeseries: mergeTimeseriesWithDefaults(payload.timeseries, timeRange),
  };
};
