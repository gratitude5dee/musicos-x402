import React, { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import GreetingNode from './nodes/GreetingNode';
import FinancialOverviewNode from './nodes/FinancialOverviewNode';
import RecentCreationsNode from './nodes/RecentCreationsNode';
import VoiceAssistantNode from './nodes/VoiceAssistantNode';
import ScheduleCalendarNode from './nodes/ScheduleCalendarNode';
import ChatInterfaceNode from './nodes/ChatInterfaceNode';
import SuggestedActionsNode from './nodes/SuggestedActionsNode';
import { DashboardNode, DASHBOARD_NODE_TYPES } from './types';

const nodeTypes = {
  [DASHBOARD_NODE_TYPES.GREETING]: GreetingNode,
  [DASHBOARD_NODE_TYPES.FINANCIAL]: FinancialOverviewNode,
  [DASHBOARD_NODE_TYPES.CREATIONS]: RecentCreationsNode,
  [DASHBOARD_NODE_TYPES.VOICE_ASSISTANT]: VoiceAssistantNode,
  [DASHBOARD_NODE_TYPES.SCHEDULE]: ScheduleCalendarNode,
  [DASHBOARD_NODE_TYPES.CHAT]: ChatInterfaceNode,
  [DASHBOARD_NODE_TYPES.ACTIONS]: SuggestedActionsNode,
};

const initialNodes: DashboardNode[] = [
  // Header row with greeting
  {
    id: 'greeting-1',
    type: DASHBOARD_NODE_TYPES.GREETING,
    position: { x: 50, y: 30 },
    data: { label: 'Greeting' },
    style: { width: 700, height: 100 },
  },
  // Stats row
  {
    id: 'financial-1',
    type: DASHBOARD_NODE_TYPES.FINANCIAL,
    position: { x: 50, y: 160 },
    data: { label: 'Financial Overview' },
    style: { width: 900, height: 140 },
  },
  // Main content - left column
  {
    id: 'creations-1',
    type: DASHBOARD_NODE_TYPES.CREATIONS,
    position: { x: 50, y: 330 },
    data: { label: 'Recent Contacts' },
    style: { width: 380, height: 420 },
  },
  // Main content - center column
  {
    id: 'actions-1',
    type: DASHBOARD_NODE_TYPES.ACTIONS,
    position: { x: 460, y: 330 },
    data: { label: 'Revenue Targets' },
    style: { width: 320, height: 320 },
  },
  // Right sidebar - top
  {
    id: 'voice-1',
    type: DASHBOARD_NODE_TYPES.VOICE_ASSISTANT,
    position: { x: 810, y: 330 },
    data: { label: 'Quick Actions' },
    style: { width: 280, height: 280 },
  },
  // Right sidebar - middle
  {
    id: 'chat-1',
    type: DASHBOARD_NODE_TYPES.CHAT,
    position: { x: 460, y: 680 },
    data: { label: 'AI Chat' },
    style: { width: 280, height: 340 },
  },
  // Right sidebar - bottom
  {
    id: 'schedule-1',
    type: DASHBOARD_NODE_TYPES.SCHEDULE,
    position: { x: 770, y: 640 },
    data: { label: 'Recent Activity' },
    style: { width: 320, height: 380 },
  },
];

const initialEdges: Edge[] = [];

const DashboardFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="w-full h-full bg-transparent">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        snapToGrid={true}
        snapGrid={[20, 20]}
        fitView
        className="bg-transparent"
        style={{ backgroundColor: 'transparent' }}
        defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
      >
        <Background 
          color="rgba(255, 255, 255, 0.05)" 
          gap={20} 
          size={1}
          style={{ backgroundColor: 'transparent' }}
        />
        <Controls 
          className="react-flow__controls-glass"
          style={{
            background: 'rgba(30, 25, 20, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 200, 100, 0.15)',
            borderRadius: '12px',
          }}
        />
        <MiniMap 
          className="react-flow__minimap-glass"
          style={{
            background: 'rgba(30, 25, 20, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 200, 100, 0.15)',
            borderRadius: '12px',
          }}
          nodeColor={() => 'rgba(168, 85, 247, 0.6)'}
        />
      </ReactFlow>
    </div>
  );
};

export default DashboardFlow;
