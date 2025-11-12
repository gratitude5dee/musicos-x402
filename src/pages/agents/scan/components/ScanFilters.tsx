import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter, RefreshCw } from "lucide-react";
import { AgentScanFilters, ScanSortOption, ScanTimeRange } from "../lib/scanTypes";

interface ScanFiltersProps {
  filters: AgentScanFilters;
  onChange: (filters: AgentScanFilters) => void;
  onReset: () => void;
  availableFacilitators: string[];
  availableNetworks: string[];
  availableResourceTypes: string[];
  isBusy?: boolean;
}

const TIME_RANGE_LABELS: Record<ScanTimeRange, string> = {
  "24h": "24 Hours",
  "7d": "7 Days",
  "30d": "30 Days",
  all: "All Time",
};

const SORT_LABELS: Record<ScanSortOption, string> = {
  activity: "Activity",
  "creation-date": "Creation Date",
  "transaction-volume": "Transaction Volume",
  "resource-count": "Resource Count",
  "token-usage": "Token Usage",
};

export const ScanFilters = ({
  filters,
  onChange,
  onReset,
  availableFacilitators,
  availableNetworks,
  availableResourceTypes,
  isBusy,
}: ScanFiltersProps) => {
  const [searchValue, setSearchValue] = useState(filters.search ?? "");

  useEffect(() => {
    setSearchValue(filters.search ?? "");
  }, [filters.search]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchValue !== filters.search) {
        onChange({ ...filters, search: searchValue || undefined });
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [searchValue, filters, onChange]);

  const facilitatorOptions = useMemo(() => {
    return availableFacilitators.length ? availableFacilitators : ["agent-network", "creator-ops"];
  }, [availableFacilitators]);

  const networkOptions = useMemo(() => {
    return availableNetworks.length ? availableNetworks : ["solana", "ethereum", "polygon"];
  }, [availableNetworks]);

  const resourceOptions = useMemo(() => {
    return availableResourceTypes.length ? availableResourceTypes : ["audio", "video", "metadata", "wallet"];
  }, [availableResourceTypes]);

  return (
    <Card className="bg-card/80 backdrop-blur border border-white/10 shadow-lg">
      <CardContent className="py-6 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 text-foreground">
            <Filter className="h-4 w-4" />
            <h2 className="text-lg font-semibold">Scan Filters</h2>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={onReset}
              disabled={isBusy}
            >
              <RefreshCw className="h-4 w-4" /> Reset
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="col-span-1">
            <label className="text-sm text-muted-foreground mb-1 block">Search agents</label>
            <Input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search by name or type"
              className="bg-background/60"
            />
          </div>

          <div className="col-span-1">
            <label className="text-sm text-muted-foreground mb-1 block">Facilitator</label>
            <Select
              value={filters.facilitatorId ?? "all"}
              onValueChange={(value) =>
                onChange({
                  ...filters,
                  facilitatorId: value === "all" ? undefined : value,
                })
              }
              disabled={isBusy}
            >
              <SelectTrigger className="bg-background/60">
                <SelectValue placeholder="All facilitators" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All facilitators</SelectItem>
                {facilitatorOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-1">
            <label className="text-sm text-muted-foreground mb-1 block">Network</label>
            <Select
              value={filters.networkId ?? "all"}
              onValueChange={(value) =>
                onChange({
                  ...filters,
                  networkId: value === "all" ? undefined : value,
                })
              }
              disabled={isBusy}
            >
              <SelectTrigger className="bg-background/60">
                <SelectValue placeholder="All networks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All networks</SelectItem>
                {networkOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-1">
            <label className="text-sm text-muted-foreground mb-1 block">Resource type</label>
            <Select
              value={filters.resourceType ?? "all"}
              onValueChange={(value) =>
                onChange({
                  ...filters,
                  resourceType: value === "all" ? undefined : value,
                })
              }
              disabled={isBusy}
            >
              <SelectTrigger className="bg-background/60">
                <SelectValue placeholder="All resource types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All resources</SelectItem>
                {resourceOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <span className="text-sm text-muted-foreground">Time range</span>
            <Tabs
              value={filters.timeRange}
              onValueChange={(value) =>
                onChange({
                  ...filters,
                  timeRange: value as ScanTimeRange,
                })
              }
              className="mt-2"
            >
              <TabsList className="grid grid-cols-4 bg-background/60">
                {(Object.keys(TIME_RANGE_LABELS) as ScanTimeRange[]).map((key) => (
                  <TabsTrigger key={key} value={key}>
                    {TIME_RANGE_LABELS[key]}
                  </TabsTrigger>
                ))}
              </TabsList>
              {(Object.keys(TIME_RANGE_LABELS) as ScanTimeRange[]).map((key) => (
                <TabsContent key={key} value={key} />
              ))}
            </Tabs>
          </div>

          <div className="w-full lg:w-auto">
            <label className="text-sm text-muted-foreground mb-1 block">Sort results</label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) =>
                onChange({
                  ...filters,
                  sortBy: value as ScanSortOption,
                })
              }
              disabled={isBusy}
            >
              <SelectTrigger className="bg-background/60">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(SORT_LABELS) as ScanSortOption[]).map((option) => (
                  <SelectItem key={option} value={option}>
                    {SORT_LABELS[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
