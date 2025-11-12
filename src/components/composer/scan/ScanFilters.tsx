import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { ScanFilters as ScanFiltersType } from "@/pages/composer/ComposerScan";

interface ScanFiltersProps {
  filters: ScanFiltersType;
  onFiltersChange: (filters: ScanFiltersType) => void;
}

export function ScanFilters({ filters, onFiltersChange }: ScanFiltersProps) {
  const updateFilter = (key: keyof ScanFiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      timeRange: '7d',
      agentType: undefined,
      status: undefined,
      searchQuery: undefined,
    });
  };

  const hasActiveFilters = filters.agentType || filters.status || filters.searchQuery;

  return (
    <Card className="backdrop-blur-xl bg-white/5 border border-white/10 p-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search agents by name..."
            value={filters.searchQuery || ''}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            className="pl-10 bg-background/50 border-white/10"
          />
        </div>

        {/* Time Range */}
        <Select
          value={filters.timeRange}
          onValueChange={(value) => updateFilter('timeRange', value)}
        >
          <SelectTrigger className="w-[140px] bg-background/50 border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>

        {/* Agent Type */}
        <Select
          value={filters.agentType || 'all'}
          onValueChange={(value) => updateFilter('agentType', value === 'all' ? undefined : value)}
        >
          <SelectTrigger className="w-[160px] bg-background/50 border-white/10">
            <SelectValue placeholder="Agent Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="studio">Studio</SelectItem>
            <SelectItem value="treasury">Treasury</SelectItem>
            <SelectItem value="distribution">Distribution</SelectItem>
            <SelectItem value="rights">Rights</SelectItem>
            <SelectItem value="analytics">Analytics</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>

        {/* Status */}
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) => updateFilter('status', value === 'all' ? undefined : value as any)}
        >
          <SelectTrigger className="w-[140px] bg-background/50 border-white/10">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearFilters}
            className="hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}
