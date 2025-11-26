import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/dashboard-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DollarSign, TrendingUp, Network, BarChart3 } from 'lucide-react';
import { RoyaltyGraphVisualization } from '@/components/royalties/RoyaltyGraphVisualization';
import { RoyaltyClaimPanel } from '@/components/royalties/RoyaltyClaimPanel';
import { RoyaltySplitEditor } from '@/components/royalties/RoyaltySplitEditor';
import { RoyaltyAnalyticsDashboard } from '@/components/royalties/RoyaltyAnalyticsDashboard';
import { useRoyaltyGraph } from '@/hooks/useRoyaltyGraph';
import { type Address } from 'viem';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const RoyaltiesPage = () => {
  const {
    viewMode,
    setViewMode,
    selectedNode,
    selectNode,
    timeRange,
    setTimeRange,
    claimableRoyalties,
    royaltyHistory,
    fetchClaimable,
    fetchHistory,
    claimRevenue,
    snapshot,
    isReady,
  } = useRoyaltyGraph();

  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock root IP ID - in production, get from user's assets
  const rootIpId = '0x1234567890123456789012345678901234567890' as Address;
  const royaltyVaultAddress = '0x0987654321098765432109876543210987654321' as Address;

  useEffect(() => {
    if (isReady) {
      fetchClaimable([rootIpId]);
      fetchHistory(rootIpId, timeRange);
    }
  }, [isReady, timeRange]);

  const handleClaim = async (tokens: Address[]) => {
    try {
      // Mock implementation - TODO: implement when SDK methods are available
      toast({
        title: 'Royalties Claimed',
        description: 'Mock claim successful',
      });
    } catch (error) {
      toast({
        title: 'Claim Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleSnapshot = async () => {
    try {
      // Mock implementation - TODO: implement when SDK methods are available
      toast({
        title: 'Snapshot Created',
        description: 'Royalty snapshot has been recorded on-chain',
      });
    } catch (error) {
      toast({
        title: 'Snapshot Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleSaveSplit = async (splits: any[]) => {
    toast({
      title: 'Royalty Split Saved',
      description: 'Configuration has been saved successfully',
    });
  };

  return (
    <DashboardLayout>
      <div className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-accent-green" />
            <h1 className="text-xl font-medium text-text-primary">
              Royalty Management
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Last 24h</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="glass-card mb-6 w-fit">
            <TabsTrigger value="overview" className="gap-2">
              <Network className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="graph" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Graph
            </TabsTrigger>
            <TabsTrigger value="claim" className="gap-2">
              <DollarSign className="w-4 h-4" />
              Claim
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RoyaltyClaimPanel
                  ipId={rootIpId}
                  royaltyVaultAddress={royaltyVaultAddress}
                  claimableTokens={Array.from(claimableRoyalties.get(rootIpId) || [])}
                  onClaim={handleClaim}
                  onSnapshot={handleSnapshot}
                />
                <RoyaltySplitEditor onSave={handleSaveSplit} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <Card className="p-6 glass-card border border-border/50">
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Royalty Flow Preview
                </h3>
                <RoyaltyGraphVisualization
                  rootIpId={rootIpId}
                  viewMode={viewMode}
                  onNodeSelect={selectNode}
                  showValues={true}
                  animateFlows={true}
                />
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="graph">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6 glass-card border border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">
                    Royalty Distribution Graph
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === 'force' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('force')}
                    >
                      Force
                    </Button>
                    <Button
                      variant={viewMode === 'tree' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('tree')}
                    >
                      Tree
                    </Button>
                    <Button
                      variant={viewMode === 'sankey' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('sankey')}
                    >
                      Sankey
                    </Button>
                  </div>
                </div>
                <RoyaltyGraphVisualization
                  rootIpId={rootIpId}
                  viewMode={viewMode}
                  onNodeSelect={selectNode}
                  showValues={true}
                  animateFlows={true}
                />
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="claim">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <RoyaltyClaimPanel
                ipId={rootIpId}
                royaltyVaultAddress={royaltyVaultAddress}
                claimableTokens={Array.from(claimableRoyalties.get(rootIpId) || [])}
                onClaim={handleClaim}
                onSnapshot={handleSnapshot}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="analytics">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <RoyaltyAnalyticsDashboard
                history={royaltyHistory}
                timeRange={timeRange}
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default RoyaltiesPage;
