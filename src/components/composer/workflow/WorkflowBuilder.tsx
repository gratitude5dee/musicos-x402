import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  Play,
  Settings,
  ZoomIn,
  ZoomOut,
  Maximize,
  X,
  Plus,
  Trash2,
  Copy,
  ArrowLeft,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Workflow, WorkflowNode, WorkflowEdge, WorkflowNodeType } from '@/types/workflow';
import WorkflowCanvas from './WorkflowCanvas';
import WorkflowNodePalette from './WorkflowNodePalette';
import WorkflowNodeConfig from './WorkflowNodeConfig';
import { useAgent } from '@/context/AgentContext';

interface WorkflowBuilderProps {
  workflow: Workflow;
  onSave: (workflow: Workflow) => Promise<void>;
  onClose: () => void;
  onExecute: (workflowId: string) => Promise<void>;
}

const WorkflowBuilder = ({ workflow, onSave, onClose, onExecute }: WorkflowBuilderProps) => {
  const { agents } = useAgent();
  const [localWorkflow, setLocalWorkflow] = useState<Workflow>(workflow);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showNodePalette, setShowNodePalette] = useState(true);
  const [showNodeConfig, setShowNodeConfig] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedNode = localWorkflow.nodes.find(n => n.id === selectedNodeId);

  const handleAddNode = (type: WorkflowNodeType) => {
    const newNode: WorkflowNode = {
      id: crypto.randomUUID(),
      type,
      label: getDefaultLabel(type),
      position: {
        x: 100 + localWorkflow.nodes.length * 50,
        y: 100 + localWorkflow.nodes.length * 50,
      },
      data: {},
    };

    setLocalWorkflow({
      ...localWorkflow,
      nodes: [...localWorkflow.nodes, newNode],
      updated_at: new Date().toISOString(),
    });
  };

  const handleUpdateNode = (nodeId: string, updates: Partial<WorkflowNode>) => {
    setLocalWorkflow({
      ...localWorkflow,
      nodes: localWorkflow.nodes.map(n =>
        n.id === nodeId ? { ...n, ...updates } : n
      ),
      updated_at: new Date().toISOString(),
    });
  };

  const handleDeleteNode = (nodeId: string) => {
    setLocalWorkflow({
      ...localWorkflow,
      nodes: localWorkflow.nodes.filter(n => n.id !== nodeId),
      edges: localWorkflow.edges.filter(e => e.source !== nodeId && e.target !== nodeId),
      updated_at: new Date().toISOString(),
    });
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
      setShowNodeConfig(false);
    }
  };

  const handleAddEdge = (sourceId: string, targetId: string) => {
    // Check if edge already exists
    const edgeExists = localWorkflow.edges.some(
      e => e.source === sourceId && e.target === targetId
    );

    if (edgeExists) return;

    const newEdge: WorkflowEdge = {
      id: crypto.randomUUID(),
      source: sourceId,
      target: targetId,
    };

    setLocalWorkflow({
      ...localWorkflow,
      edges: [...localWorkflow.edges, newEdge],
      updated_at: new Date().toISOString(),
    });
  };

  const handleDeleteEdge = (edgeId: string) => {
    setLocalWorkflow({
      ...localWorkflow,
      edges: localWorkflow.edges.filter(e => e.id !== edgeId),
      updated_at: new Date().toISOString(),
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(localWorkflow);
    } catch (error) {
      console.error('Error saving workflow:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExecute = async () => {
    try {
      setIsExecuting(true);
      await onExecute(localWorkflow.id);
    } catch (error) {
      console.error('Error executing workflow:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setShowNodeConfig(true);
  };

  const getDefaultLabel = (type: WorkflowNodeType): string => {
    const labels: Record<WorkflowNodeType, string> = {
      agent_invoke: 'Invoke Agent',
      condition: 'Condition',
      parallel: 'Parallel Execution',
      transform: 'Transform Data',
      trigger: 'Trigger',
      webhook: 'Webhook',
      wait: 'Wait',
      aggregate: 'Aggregate Results',
    };
    return labels[type];
  };

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header */}
      <div className="h-16 border-b border-white/10 backdrop-blur-xl bg-black/80 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <Input
              value={localWorkflow.name}
              onChange={(e) => setLocalWorkflow({ ...localWorkflow, name: e.target.value })}
              className="w-64 bg-white/5 border-white/10"
              placeholder="Workflow name"
            />
            <Badge variant={localWorkflow.status === 'active' ? 'default' : 'secondary'}>
              {localWorkflow.status}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground mr-4">
            {localWorkflow.nodes.length} nodes · {localWorkflow.edges.length} connections
          </div>

          <Button variant="outline" size="sm" onClick={handleResetView}>
            <Maximize className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>

          <div className="text-sm text-muted-foreground">
            {Math.round(zoom * 100)}%
          </div>

          <div className="w-px h-6 bg-white/10" />

          <Button
            variant="outline"
            size="sm"
            onClick={handleExecute}
            disabled={isExecuting || localWorkflow.nodes.length === 0}
          >
            <Play className="h-4 w-4 mr-2" />
            {isExecuting ? 'Executing...' : 'Test Run'}
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-purple-500 to-blue-500"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Node Palette */}
        {showNodePalette && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            className="w-80 border-r border-white/10 backdrop-blur-xl bg-black/40 overflow-y-auto"
          >
            <WorkflowNodePalette onAddNode={handleAddNode} agents={agents} />
          </motion.div>
        )}

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20">
          <WorkflowCanvas
            workflow={localWorkflow}
            zoom={zoom}
            pan={pan}
            onPanChange={setPan}
            onNodeClick={handleNodeClick}
            onNodeMove={handleUpdateNode}
            onEdgeAdd={handleAddEdge}
            onEdgeDelete={handleDeleteEdge}
            selectedNodeId={selectedNodeId}
          />

          {/* Empty State */}
          {localWorkflow.nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Card className="p-8 backdrop-blur-xl bg-white/5 border-white/10 text-center max-w-md">
                <Zap className="h-12 w-12 mx-auto mb-4 text-purple-400" />
                <h3 className="text-xl font-semibold mb-2">Start Building Your Workflow</h3>
                <p className="text-muted-foreground mb-4">
                  Drag nodes from the left palette onto the canvas to begin creating your
                  multi-agent workflow.
                </p>
                <Button
                  onClick={() => handleAddNode('trigger')}
                  className="bg-gradient-to-r from-purple-500 to-blue-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Trigger Node
                </Button>
              </Card>
            </div>
          )}
        </div>

        {/* Node Configuration Panel */}
        {showNodeConfig && selectedNode && (
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            className="w-96 border-l border-white/10 backdrop-blur-xl bg-black/40 overflow-y-auto"
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-semibold">Configure Node</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNodeConfig(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <WorkflowNodeConfig
              node={selectedNode}
              agents={agents}
              onUpdate={(updates) => handleUpdateNode(selectedNode.id, updates)}
              onDelete={() => handleDeleteNode(selectedNode.id)}
            />
          </motion.div>
        )}
      </div>

      {/* Toggle Palette Button */}
      {!showNodePalette && (
        <Button
          className="absolute top-20 left-4 z-10"
          size="sm"
          onClick={() => setShowNodePalette(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Show Palette
        </Button>
      )}
    </div>
  );
};

export default WorkflowBuilder;
