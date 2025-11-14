import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  Trash2,
  Copy,
  MoreVertical,
  Clock,
  TrendingUp,
  AlertCircle,
  Search,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Workflow, WorkflowStatus } from '@/types/workflow';
import { formatDistanceToNow } from 'date-fns';

interface WorkflowListProps {
  workflows: Workflow[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpen: (workflow: Workflow) => void;
  onDelete: (workflowId: string) => void;
  onDuplicate: (workflow: Workflow) => void;
}

const WorkflowList = ({
  workflows,
  isLoading,
  searchQuery,
  onSearchChange,
  onOpen,
  onDelete,
  onDuplicate,
}: WorkflowListProps) => {
  const getStatusColor = (status: WorkflowStatus) => {
    const colors: Record<WorkflowStatus, string> = {
      draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      paused: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return colors[status];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <Card className="p-4 backdrop-blur-xl bg-white/5 border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search workflows..."
            className="pl-10 bg-white/5 border-white/10"
          />
        </div>
      </Card>

      {/* Workflows Grid */}
      {workflows.length === 0 ? (
        <Card className="p-12 backdrop-blur-xl bg-white/5 border-white/10 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Workflows Found</h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'Create your first workflow to get started'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map((workflow, idx) => (
            <motion.div
              key={workflow.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="p-6 backdrop-blur-xl bg-white/5 border-white/10 hover:border-white/20 transition-all group cursor-pointer">
                <div onClick={() => onOpen(workflow)}>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1 truncate group-hover:text-purple-400 transition-colors">
                        {workflow.name}
                      </h3>
                      {workflow.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {workflow.description}
                        </p>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="ml-2">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onOpen(workflow)}>
                          <Play className="h-4 w-4 mr-2" />
                          Open
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDuplicate(workflow)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(workflow.id)}
                          className="text-red-400"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Status & Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className={getStatusColor(workflow.status)}>
                      {workflow.status}
                    </Badge>
                    <Badge variant="outline" className="border-white/10">
                      {workflow.trigger_type}
                    </Badge>
                    {workflow.tags?.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center p-2 rounded-lg bg-white/5">
                      <p className="text-2xl font-bold text-purple-400">
                        {workflow.nodes.length}
                      </p>
                      <p className="text-xs text-muted-foreground">Nodes</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-white/5">
                      <p className="text-2xl font-bold text-blue-400">
                        {workflow.execution_count || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Executions</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-white/10">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {workflow.last_executed_at
                          ? `Run ${formatDistanceToNow(new Date(workflow.last_executed_at))} ago`
                          : 'Never run'}
                      </span>
                    </div>
                    <div>
                      Updated {formatDistanceToNow(new Date(workflow.updated_at))} ago
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkflowList;
