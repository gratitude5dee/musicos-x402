import { useState } from "react";
import ComposerLayout from "@/layouts/composer-layout";
import { ScanDashboard } from "@/components/composer/scan/ScanDashboard";
import { ScanFilters } from "@/components/composer/scan/ScanFilters";
import { ScanAnalytics } from "@/components/composer/scan/ScanAnalytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, BarChart3, Filter } from "lucide-react";

export type ScanFilters = {
  timeRange: '24h' | '7d' | '30d' | 'all';
  agentType?: string;
  status?: 'active' | 'paused' | 'disabled' | 'archived';
  searchQuery?: string;
};

export default function ComposerScan() {
  const [filters, setFilters] = useState<ScanFilters>({
    timeRange: '7d',
  });

  const [activeView, setActiveView] = useState<'dashboard' | 'analytics'>('dashboard');

  return (
    <ComposerLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Agent Scanner
              </h1>
              <p className="text-sm text-muted-foreground">
                Real-time monitoring and analytics for your x402 agents
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <ScanFilters filters={filters} onFiltersChange={setFilters} />

        {/* View Tabs */}
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
          <TabsList className="glass-card border border-white/10 p-1 h-auto bg-background/50 backdrop-blur-xl">
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg gap-2 px-4 py-2 rounded-lg transition-all duration-200"
            >
              <Activity className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg gap-2 px-4 py-2 rounded-lg transition-all duration-200"
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <ScanDashboard filters={filters} />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <ScanAnalytics filters={filters} />
          </TabsContent>
        </Tabs>
      </div>
    </ComposerLayout>
  );
}
