import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/layouts/dashboard-layout";
import { AgentScanFilters, AgentScanSummary } from "../lib/scanTypes";
import { fetchAgentAnalytics, fetchAgentScanSummaries } from "../lib/scanApi";
import { AgentScanner } from "./AgentScanner";
import { ScanFilters } from "./ScanFilters";
import { ScanResults } from "./ScanResults";
import { ScanAnalytics } from "./ScanAnalytics";
import { collectFilterOptions, computeMetaSnapshot, DEFAULT_SCAN_LIMIT } from "../lib/scanUtils";
import { Separator } from "@/components/ui/separator";

const DEFAULT_FILTERS: AgentScanFilters = {
  timeRange: "7d",
  sortBy: "activity",
};

const cacheTtlMs = Number(import.meta.env.VITE_SCAN_CACHE_TTL ?? 300) * 1000;

export const ScanDashboard = () => {
  const [filters, setFilters] = useState<AgentScanFilters>(DEFAULT_FILTERS);
  const [cursor, setCursor] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<AgentScanSummary[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentScanSummary | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["agent-scan", filters, cursor],
    queryFn: () => fetchAgentScanSummaries({ filters, cursor, limit: DEFAULT_SCAN_LIMIT }),
    staleTime: cacheTtlMs,
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    if (!data) return;

    setSummaries((prev) => {
      if (cursor) {
        const existing = new Map(prev.map((item) => [item.agentId, item]));
        data.summaries.forEach((item) => existing.set(item.agentId, item));
        return Array.from(existing.values());
      }
      return data.summaries;
    });

    if (!selectedAgent && data.summaries.length) {
      setSelectedAgent(data.summaries[0]);
    } else if (selectedAgent) {
      const updated = data.summaries.find((item) => item.agentId === selectedAgent.agentId);
      if (updated) {
        setSelectedAgent(updated);
      }
    }

    setLastUpdated(new Date());
  }, [data, cursor, selectedAgent]);

  const analyticsQuery = useQuery({
    queryKey: ["agent-scan-analytics", selectedAgent?.agentId, filters.timeRange],
    queryFn: () => fetchAgentAnalytics(selectedAgent!.agentId, filters.timeRange),
    enabled: Boolean(selectedAgent),
    staleTime: cacheTtlMs,
  });

  const availableFilters = useMemo(() => collectFilterOptions(summaries), [summaries]);
  const metaSnapshot = useMemo(() => computeMetaSnapshot(summaries), [summaries]);
  const hasMore = Boolean(data?.nextCursor);

  const handleFiltersChange = useCallback((next: AgentScanFilters) => {
    setFilters(next);
    setCursor(null);
    setSummaries([]);
    setSelectedAgent(null);
  }, []);

  const handleReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setCursor(null);
    setSummaries([]);
    setSelectedAgent(null);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (data?.nextCursor) {
      setCursor(data.nextCursor);
    }
  }, [data?.nextCursor]);

  const handleSelectAgent = useCallback((summary: AgentScanSummary) => {
    setSelectedAgent(summary);
  }, []);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <AgentScanner
          meta={metaSnapshot}
          timeRange={filters.timeRange}
          onRefresh={refetch}
          isRefreshing={isFetching}
          lastUpdated={lastUpdated}
        />

        <ScanFilters
          filters={filters}
          onChange={handleFiltersChange}
          onReset={handleReset}
          availableFacilitators={availableFilters.facilitators}
          availableNetworks={availableFilters.networks}
          availableResourceTypes={availableFilters.resourceTypes}
          isBusy={isFetching}
        />

        <ScanResults
          summaries={summaries}
          isLoading={isLoading}
          isFetching={isFetching}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          onSelectAgent={handleSelectAgent}
          selectedAgentId={selectedAgent?.agentId ?? null}
        />

        <Separator className="bg-white/5" />

        <ScanAnalytics
          agent={selectedAgent}
          analytics={analyticsQuery.data}
          timeRange={filters.timeRange}
          isLoading={analyticsQuery.isLoading || analyticsQuery.isFetching}
        />
      </div>
    </DashboardLayout>
  );
};
