import React, { useEffect, useRef } from 'react';
import { type Address } from 'viem';
import { RoyaltyNode } from '@/types/royalty';
import { Card } from '@/components/ui/card';

interface RoyaltyGraphVisualizationProps {
  rootIpId: Address;
  viewMode: 'tree' | 'force' | 'sankey';
  onNodeSelect: (ipId: Address) => void;
  showValues: boolean;
  animateFlows: boolean;
}

interface GraphNode {
  id: string;
  name: string;
  val: number;
  color: string;
}

interface GraphLink {
  source: string;
  target: string;
  value: number;
}

export function RoyaltyGraphVisualization({
  rootIpId,
  viewMode,
  onNodeSelect,
  showValues,
  animateFlows,
}: RoyaltyGraphVisualizationProps) {
  const forceRef = useRef<any>();

  // Mock graph data - in production, fetch from SDK/IPKit
  const graphData = {
    nodes: [
      { id: rootIpId, name: 'Root IP Asset', val: 100, color: 'hsl(var(--primary))' },
      { id: '0x001' as Address, name: 'Derivative 1', val: 50, color: 'hsl(var(--accent-blue))' },
      { id: '0x002' as Address, name: 'Derivative 2', val: 30, color: 'hsl(var(--accent-green))' },
      { id: '0x003' as Address, name: 'Sub-derivative 1', val: 20, color: 'hsl(var(--accent-purple))' },
    ] as GraphNode[],
    links: [
      { source: rootIpId, target: '0x001', value: 50 },
      { source: rootIpId, target: '0x002', value: 30 },
      { source: '0x001', target: '0x003', value: 20 },
    ] as GraphLink[],
  };

  useEffect(() => {
    if (forceRef.current && viewMode === 'tree') {
      forceRef.current.d3Force('charge').strength(-1000);
    }
  }, [viewMode]);

  if (viewMode === 'force') {
    return (
      <Card className="p-4 glass-card border border-border/50">
        <div className="h-[600px] w-full flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Force Graph Visualization
            </h3>
            <p className="text-sm text-text-secondary">
              Interactive force-directed graph visualization
            </p>
            <div className="mt-4 space-y-2">
              {graphData.nodes.map((node) => (
                <div
                  key={node.id}
                  className="p-3 rounded-lg bg-background/50 text-left cursor-pointer hover:bg-background/70 transition-colors"
                  onClick={() => onNodeSelect(node.id as Address)}
                >
                  <div className="font-medium text-text-primary">{node.name}</div>
                  <div className="text-xs text-text-secondary">{node.id}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Fallback for other view modes
  return (
    <Card className="p-6 glass-card border border-border/50">
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            {viewMode === 'tree' ? 'Tree View' : 'Sankey View'}
          </h3>
          <p className="text-sm text-text-secondary">
            {viewMode} visualization coming soon
          </p>
        </div>
      </div>
    </Card>
  );
}
