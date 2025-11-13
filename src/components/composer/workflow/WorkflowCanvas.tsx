import { useRef, useState, useCallback, MouseEvent } from 'react';
import { Workflow, WorkflowNode, WorkflowEdge } from '@/types/workflow';
import {
  Users,
  GitBranch,
  Grid3x3,
  Shuffle,
  Webhook,
  Clock,
  Layers,
  Play,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WorkflowCanvasProps {
  workflow: Workflow;
  zoom: number;
  pan: { x: number; y: number };
  onPanChange: (pan: { x: number; y: number }) => void;
  onNodeClick: (nodeId: string) => void;
  onNodeMove: (nodeId: string, updates: Partial<WorkflowNode>) => void;
  onEdgeAdd: (sourceId: string, targetId: string) => void;
  onEdgeDelete: (edgeId: string) => void;
  selectedNodeId: string | null;
}

const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;

const WorkflowCanvas = ({
  workflow,
  zoom,
  pan,
  onPanChange,
  onNodeClick,
  onNodeMove,
  onEdgeAdd,
  onEdgeDelete,
  selectedNodeId,
}: WorkflowCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const getNodeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      trigger: <Play className="h-4 w-4" />,
      agent_invoke: <Users className="h-4 w-4" />,
      condition: <GitBranch className="h-4 w-4" />,
      parallel: <Grid3x3 className="h-4 w-4" />,
      transform: <Shuffle className="h-4 w-4" />,
      webhook: <Webhook className="h-4 w-4" />,
      wait: <Clock className="h-4 w-4" />,
      aggregate: <Layers className="h-4 w-4" />,
    };
    return icons[type] || <Users className="h-4 w-4" />;
  };

  const getNodeColor = (type: string) => {
    const colors: Record<string, string> = {
      trigger: 'from-green-500 to-emerald-500',
      agent_invoke: 'from-purple-500 to-blue-500',
      condition: 'from-orange-500 to-red-500',
      parallel: 'from-cyan-500 to-blue-500',
      transform: 'from-pink-500 to-purple-500',
      webhook: 'from-yellow-500 to-orange-500',
      wait: 'from-gray-500 to-slate-500',
      aggregate: 'from-indigo-500 to-purple-500',
    };
    return colors[type] || 'from-purple-500 to-blue-500';
  };

  const handleNodeMouseDown = (e: MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = workflow.nodes.find(n => n.id === nodeId);
    if (!node) return;

    setDraggedNodeId(nodeId);
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - node.position.x * zoom - pan.x,
      y: e.clientY - node.position.y * zoom - pan.y,
    });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      if (isDragging && draggedNodeId) {
        const node = workflow.nodes.find(n => n.id === draggedNodeId);
        if (!node) return;

        const newX = (e.clientX - dragOffset.x - pan.x) / zoom;
        const newY = (e.clientY - dragOffset.y - pan.y) / zoom;

        onNodeMove(draggedNodeId, {
          position: { x: newX, y: newY },
        });
      }
    },
    [isDragging, draggedNodeId, dragOffset, pan, zoom, workflow.nodes, onNodeMove]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedNodeId(null);
  };

  const handleConnectStart = (e: MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setConnectingFrom(nodeId);
  };

  const handleConnectEnd = (e: MouseEvent, targetNodeId: string) => {
    e.stopPropagation();
    if (connectingFrom && connectingFrom !== targetNodeId) {
      onEdgeAdd(connectingFrom, targetNodeId);
    }
    setConnectingFrom(null);
  };

  const handleCanvasMouseUp = () => {
    setConnectingFrom(null);
    setIsDragging(false);
    setDraggedNodeId(null);
  };

  const getEdgePath = (edge: WorkflowEdge): string => {
    const sourceNode = workflow.nodes.find(n => n.id === edge.source);
    const targetNode = workflow.nodes.find(n => n.id === edge.target);

    if (!sourceNode || !targetNode) return '';

    const x1 = sourceNode.position.x + NODE_WIDTH / 2;
    const y1 = sourceNode.position.y + NODE_HEIGHT;
    const x2 = targetNode.position.x + NODE_WIDTH / 2;
    const y2 = targetNode.position.y;

    const midY = (y1 + y2) / 2;

    return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
  };

  const getNodeCenter = (node: WorkflowNode) => ({
    x: node.position.x + NODE_WIDTH / 2,
    y: node.position.y + NODE_HEIGHT / 2,
  });

  return (
    <div
      ref={canvasRef}
      className="w-full h-full relative overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onMouseLeave={handleCanvasMouseUp}
    >
      {/* Canvas Content */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      >
        {/* SVG Layer for Edges */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="rgba(168, 85, 247, 0.5)" />
            </marker>
          </defs>

          {/* Render Edges */}
          {workflow.edges.map(edge => (
            <g key={edge.id} className="group cursor-pointer" onClick={() => onEdgeDelete(edge.id)}>
              <path
                d={getEdgePath(edge)}
                stroke="rgba(168, 85, 247, 0.3)"
                strokeWidth="2"
                fill="none"
                markerEnd="url(#arrowhead)"
                className="group-hover:stroke-purple-400 transition-colors"
              />
              {/* Invisible wider path for easier clicking */}
              <path
                d={getEdgePath(edge)}
                stroke="transparent"
                strokeWidth="20"
                fill="none"
                className="pointer-events-auto"
              />
            </g>
          ))}

          {/* Active Connection Line */}
          {connectingFrom && (
            <line
              x1={
                workflow.nodes.find(n => n.id === connectingFrom)
                  ? workflow.nodes.find(n => n.id === connectingFrom)!.position.x + NODE_WIDTH / 2
                  : 0
              }
              y1={
                workflow.nodes.find(n => n.id === connectingFrom)
                  ? workflow.nodes.find(n => n.id === connectingFrom)!.position.y + NODE_HEIGHT
                  : 0
              }
              x2={(mousePos.x - pan.x) / zoom}
              y2={(mousePos.y - pan.y) / zoom}
              stroke="rgba(168, 85, 247, 0.5)"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          )}
        </svg>

        {/* Nodes Layer */}
        {workflow.nodes.map(node => {
          const isSelected = node.id === selectedNodeId;
          const isDragged = node.id === draggedNodeId;

          return (
            <div
              key={node.id}
              className={`absolute cursor-move transition-shadow ${
                isSelected ? 'ring-2 ring-purple-500' : ''
              } ${isDragged ? 'opacity-70' : ''}`}
              style={{
                left: node.position.x,
                top: node.position.y,
                width: NODE_WIDTH,
                height: NODE_HEIGHT,
              }}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
              onClick={(e) => {
                e.stopPropagation();
                onNodeClick(node.id);
              }}
            >
              <Card className="h-full backdrop-blur-xl bg-black/60 border-white/20 hover:border-white/40 transition-all">
                <div className="p-3 h-full flex flex-col">
                  {/* Node Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`p-1.5 rounded bg-gradient-to-br ${getNodeColor(
                        node.type
                      )} bg-opacity-20`}
                    >
                      {getNodeIcon(node.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{node.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {node.type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  {/* Node Data Preview */}
                  {node.data.agentName && (
                    <Badge variant="secondary" className="text-xs truncate">
                      {node.data.agentName}
                    </Badge>
                  )}
                </div>

                {/* Connection Points */}
                <div
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-purple-500 border-2 border-black cursor-crosshair hover:scale-125 transition-transform"
                  onMouseUp={(e) => handleConnectEnd(e, node.id)}
                  title="Input"
                />
                <div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-500 border-2 border-black cursor-crosshair hover:scale-125 transition-transform"
                  onMouseDown={(e) => handleConnectStart(e, node.id)}
                  title="Output"
                />
              </Card>
            </div>
          );
        })}

        {/* Grid Background */}
        <div className="absolute inset-0 -z-10" style={{ backgroundImage: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      </div>
    </div>
  );
};

export default WorkflowCanvas;
