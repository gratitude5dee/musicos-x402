import { differenceInHours } from "date-fns";
import type { Json } from "@/integrations/supabase/types";
import {
  AgentAnalyticsPayload,
  AgentScanFilters,
  AgentScanMetaSnapshot,
  AgentScanSummary,
  AgentAnalyticsTimeseriesPoint,
  ScanSortOption,
  ScanTimeRange,
} from "./scanTypes";

const CURSOR_PREFIX = "scan::";

type AgentMetadataRecord = {
  facilitatorId?: Json;
  networkId?: Json;
  primaryResourceType?: Json;
  creatorName?: Json;
  creatorHandle?: Json;
  creatorLabel?: Json;
  creator?: Json;
  creatorEmail?: Json;
  profile?: Json;
} & Record<string, Json | undefined>;

const isMetadataRecord = (
  metadata: AgentScanSummary["metadata"],
): metadata is AgentMetadataRecord => {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return false;
  }

  return true;
};

const normalizeFilterValue = (value: Json | undefined): string | undefined => {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return undefined;
};

const browserBtoa = (value: string) => {
  if (typeof window !== "undefined" && window.btoa) {
    return window.btoa(value);
  }

  return Buffer.from(value, "utf-8").toString("base64");
};

const browserAtob = (value: string) => {
  if (typeof window !== "undefined" && window.atob) {
    return window.atob(value);
  }

  return Buffer.from(value, "base64").toString("utf-8");
};

export const serializeCursor = (offset: number) => browserBtoa(`${CURSOR_PREFIX}${offset}`);

export const parseCursor = (cursor?: string | null): number => {
  if (!cursor) return 0;

  try {
    const decoded = browserAtob(cursor);
    if (!decoded.startsWith(CURSOR_PREFIX)) return 0;
    const offset = Number.parseInt(decoded.slice(CURSOR_PREFIX.length), 10);
    return Number.isFinite(offset) ? offset : 0;
  } catch (error) {
    console.warn("Unable to parse scan cursor", error);
    return 0;
  }
};

export const resolveTimeBoundary = (timeRange: ScanTimeRange) => {
  const now = new Date();

  switch (timeRange) {
    case "24h":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  }
};

export const computeMetaSnapshot = (summaries: AgentScanSummary[]): AgentScanMetaSnapshot => {
  if (!summaries.length) {
    return {
      totalAgents: 0,
      activeAgents: 0,
      averageSuccessRate: 0,
      averageLatencyMs: 0,
      averageTokens: 0,
      transactionVolume: 0,
    };
  }

  const totals = summaries.reduce(
    (acc, summary) => {
      acc.totalAgents += 1;
      acc.activeAgents += summary.activityCount > 0 ? 1 : 0;
      acc.successRate += summary.successRate;
      acc.latency += summary.averageLatencyMs;
      acc.tokens += summary.averageTokens;
      acc.transactionVolume += summary.transactionVolume;
      return acc;
    },
    {
      totalAgents: 0,
      activeAgents: 0,
      successRate: 0,
      latency: 0,
      tokens: 0,
      transactionVolume: 0,
    }
  );

  return {
    totalAgents: totals.totalAgents,
    activeAgents: totals.activeAgents,
    averageSuccessRate: totals.totalAgents ? totals.successRate / totals.totalAgents : 0,
    averageLatencyMs: totals.totalAgents ? totals.latency / totals.totalAgents : 0,
    averageTokens: totals.totalAgents ? totals.tokens / totals.totalAgents : 0,
    transactionVolume: totals.transactionVolume,
  };
};

export const sortSummaries = (summaries: AgentScanSummary[], sortBy: ScanSortOption) => {
  const sorted = [...summaries];

  switch (sortBy) {
    case "transaction-volume":
      sorted.sort((a, b) => b.transactionVolume - a.transactionVolume);
      break;
    case "token-usage":
      sorted.sort((a, b) => b.averageTokens - a.averageTokens);
      break;
    case "creation-date":
      sorted.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
    case "resource-count":
      sorted.sort((a, b) => b.resourceCount - a.resourceCount);
      break;
    default:
      sorted.sort((a, b) => b.activityCount - a.activityCount);
  }

  return sorted;
};

export const filterSummaries = (summaries: AgentScanSummary[], search?: string) => {
  if (!search) return summaries;
  const needle = search.toLowerCase();

  return summaries.filter((summary) =>
    summary.name.toLowerCase().includes(needle) ||
    summary.type.toLowerCase().includes(needle)
  );
};

export const collectFilterOptions = (summaries: AgentScanSummary[]) => {
  const facilitators = new Set<string>();
  const networks = new Set<string>();
  const resourceTypes = new Set<string>();

  summaries.forEach((summary) => {
    if (!isMetadataRecord(summary.metadata)) return;

    const facilitator = normalizeFilterValue(summary.metadata.facilitatorId);
    if (facilitator) facilitators.add(facilitator);

    const network = normalizeFilterValue(summary.metadata.networkId);
    if (network) networks.add(network);

    const resource = normalizeFilterValue(summary.metadata.primaryResourceType);
    if (resource) resourceTypes.add(resource);
  });

  return {
    facilitators: Array.from(facilitators),
    networks: Array.from(networks),
    resourceTypes: Array.from(resourceTypes),
  };
};

export const resolveCreatorLabel = (metadata: unknown, fallback: string): string => {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return fallback;
  }

  const record = metadata as AgentMetadataRecord;

  const candidates: (Json | undefined)[] = [
    record.creatorName,
    record.creatorLabel,
    record.creatorHandle,
    record.creator,
    record.creatorEmail,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeFilterValue(candidate);
    if (normalized) return normalized;
  }

  const profile = record.profile;
  if (profile && typeof profile === "object" && !Array.isArray(profile)) {
    const profileRecord = profile as Record<string, Json | undefined>;
    const profileCandidates = [
      profileRecord.displayName,
      profileRecord.name,
      profileRecord.handle,
      profileRecord.username,
      profileRecord.email,
    ];

    for (const candidate of profileCandidates) {
      const normalized = normalizeFilterValue(candidate);
      if (normalized) return normalized;
    }
  }

  return fallback;
};

export const deriveActivityHealth = (summary: AgentScanSummary) => {
  if (!summary.lastActiveAt) return "idle";
  const hoursSinceActive = differenceInHours(new Date(), new Date(summary.lastActiveAt));
  if (hoursSinceActive <= 24) return "active";
  if (hoursSinceActive <= 72) return "cooldown";
  return "idle";
};

export const ensureAnalyticsPayload = (payload?: AgentAnalyticsPayload | null): AgentAnalyticsPayload => {
  if (payload) return payload;
  return {
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
};

export const mergeTimeseriesWithDefaults = (
  timeseries: AgentAnalyticsTimeseriesPoint[],
  range: ScanTimeRange
) => {
  if (timeseries.length) return timeseries;

  const start = resolveTimeBoundary(range);
  return [
    {
      period: start.toISOString().slice(0, 10),
      activityCount: 0,
      successCount: 0,
      failureCount: 0,
      avgLatencyMs: 0,
      avgTokens: 0,
      transactionCount: 0,
      transactionVolume: 0,
    },
  ];
};

export const DEFAULT_SCAN_LIMIT = 25;

export const buildQueryArgs = (filters: AgentScanFilters) => ({
  p_facilitator: filters.facilitatorId ?? null,
  p_network: filters.networkId ?? null,
  p_resource_type: filters.resourceType ?? null,
  p_time_range: filters.timeRange,
});
