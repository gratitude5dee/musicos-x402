import { motion } from 'framer-motion';
import {
  Zap,
  GitBranch,
  Grid3x3,
  Shuffle,
  Webhook,
  Clock,
  Layers,
  Play,
  Users,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WorkflowNodeType } from '@/types/workflow';

interface WorkflowNodePaletteProps {
  onAddNode: (type: WorkflowNodeType) => void;
  agents: any[];
}

interface NodeTypeConfig {
  type: WorkflowNodeType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  category: 'trigger' | 'action' | 'logic' | 'integration';
}

const nodeTypes: NodeTypeConfig[] = [
  {
    type: 'trigger',
    label: 'Trigger',
    description: 'Start workflow on event or schedule',
    icon: <Play className="h-5 w-5" />,
    color: 'from-green-500 to-emerald-500',
    category: 'trigger',
  },
  {
    type: 'agent_invoke',
    label: 'Invoke Agent',
    description: 'Execute an x402 agent with input',
    icon: <Users className="h-5 w-5" />,
    color: 'from-purple-500 to-blue-500',
    category: 'action',
  },
  {
    type: 'condition',
    label: 'Condition',
    description: 'Branch execution based on condition',
    icon: <GitBranch className="h-5 w-5" />,
    color: 'from-orange-500 to-red-500',
    category: 'logic',
  },
  {
    type: 'parallel',
    label: 'Parallel',
    description: 'Execute multiple branches in parallel',
    icon: <Grid3x3 className="h-5 w-5" />,
    color: 'from-cyan-500 to-blue-500',
    category: 'logic',
  },
  {
    type: 'transform',
    label: 'Transform',
    description: 'Transform data between steps',
    icon: <Shuffle className="h-5 w-5" />,
    color: 'from-pink-500 to-purple-500',
    category: 'action',
  },
  {
    type: 'webhook',
    label: 'Webhook',
    description: 'Call external webhook endpoint',
    icon: <Webhook className="h-5 w-5" />,
    color: 'from-yellow-500 to-orange-500',
    category: 'integration',
  },
  {
    type: 'wait',
    label: 'Wait',
    description: 'Delay execution for specified time',
    icon: <Clock className="h-5 w-5" />,
    color: 'from-gray-500 to-slate-500',
    category: 'logic',
  },
  {
    type: 'aggregate',
    label: 'Aggregate',
    description: 'Combine results from multiple inputs',
    icon: <Layers className="h-5 w-5" />,
    color: 'from-indigo-500 to-purple-500',
    category: 'logic',
  },
];

const categories = [
  { key: 'trigger', label: 'Triggers', icon: <Zap className="h-4 w-4" /> },
  { key: 'action', label: 'Actions', icon: <Play className="h-4 w-4" /> },
  { key: 'logic', label: 'Logic', icon: <GitBranch className="h-4 w-4" /> },
  { key: 'integration', label: 'Integrations', icon: <Webhook className="h-4 w-4" /> },
];

const WorkflowNodePalette = ({ onAddNode, agents }: WorkflowNodePaletteProps) => {
  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Node Palette</h2>
        <p className="text-sm text-muted-foreground">
          Click to add nodes to your workflow
        </p>
      </div>

      {categories.map((category, idx) => {
        const categoryNodes = nodeTypes.filter(n => n.category === category.key);
        if (categoryNodes.length === 0) return null;

        return (
          <motion.div
            key={category.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="flex items-center gap-2 mb-3">
              {category.icon}
              <h3 className="text-sm font-semibold">{category.label}</h3>
            </div>

            <div className="space-y-2">
              {categoryNodes.map((nodeType) => (
                <motion.div
                  key={nodeType.type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className="p-3 backdrop-blur-xl bg-white/5 border-white/10 cursor-pointer hover:border-white/20 transition-all"
                    onClick={() => onAddNode(nodeType.type)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg bg-gradient-to-br ${nodeType.color} bg-opacity-20`}
                      >
                        {nodeType.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{nodeType.label}</p>
                          {nodeType.type === 'agent_invoke' && agents.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {agents.length}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {nodeType.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      })}

      {/* Quick Info */}
      <Card className="p-4 backdrop-blur-xl bg-blue-500/10 border-blue-500/20">
        <div className="flex gap-2 mb-2">
          <Zap className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-400">Pro Tip</p>
            <p className="text-xs text-muted-foreground mt-1">
              Start with a Trigger node, then add Agent Invoke nodes for your workflow.
              Use Condition nodes to add branching logic.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WorkflowNodePalette;
