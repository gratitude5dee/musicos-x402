import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Play, Save, Settings, Trash2, Copy, Download, Upload, Zap, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Workflow, WorkflowStatus } from '@/types/workflow';
import WorkflowBuilder from '@/components/composer/workflow/WorkflowBuilder';
import WorkflowTemplates from '@/components/composer/workflow/WorkflowTemplates';
import WorkflowList from '@/components/composer/workflow/WorkflowList';

type ViewMode = 'list' | 'builder' | 'templates';

const ComposerWorkflows = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    total_executions: 0,
    avg_success_rate: 0,
  });

  useEffect(() => {
    if (user) {
      loadWorkflows();
      loadStats();
    }
  }, [user]);

  const loadWorkflows = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setWorkflows(data || []);
    } catch (error) {
      console.error('Error loading workflows:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data: workflowData } = await supabase
        .from('workflows')
        .select('id, status, execution_count')
        .eq('user_id', user?.id);

      const { data: executionData } = await supabase
        .from('workflow_executions')
        .select('status')
        .eq('user_id', user?.id);

      const total = workflowData?.length || 0;
      const active = workflowData?.filter(w => w.status === 'active').length || 0;
      const total_executions = executionData?.length || 0;
      const successful = executionData?.filter(e => e.status === 'completed').length || 0;
      const avg_success_rate = total_executions > 0 ? (successful / total_executions) * 100 : 0;

      setStats({ total, active, total_executions, avg_success_rate });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const createNewWorkflow = () => {
    const newWorkflow: Workflow = {
      id: crypto.randomUUID(),
      user_id: user?.id || '',
      name: 'Untitled Workflow',
      description: '',
      status: 'draft',
      trigger_type: 'manual',
      nodes: [],
      edges: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setSelectedWorkflow(newWorkflow);
    setViewMode('builder');
  };

  const openWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setViewMode('builder');
  };

  const saveWorkflow = async (workflow: Workflow) => {
    try {
      const { error } = await supabase
        .from('workflows')
        .upsert({
          ...workflow,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      await loadWorkflows();
      await loadStats();
    } catch (error) {
      console.error('Error saving workflow:', error);
      throw error;
    }
  };

  const deleteWorkflow = async (workflowId: string) => {
    try {
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', workflowId)
        .eq('user_id', user?.id);

      if (error) throw error;

      await loadWorkflows();
      await loadStats();

      if (selectedWorkflow?.id === workflowId) {
        setSelectedWorkflow(null);
        setViewMode('list');
      }
    } catch (error) {
      console.error('Error deleting workflow:', error);
    }
  };

  const duplicateWorkflow = async (workflow: Workflow) => {
    try {
      const duplicate: Workflow = {
        ...workflow,
        id: crypto.randomUUID(),
        name: `${workflow.name} (Copy)`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_executed_at: undefined,
        execution_count: 0,
      };

      const { error } = await supabase
        .from('workflows')
        .insert(duplicate);

      if (error) throw error;
      await loadWorkflows();
    } catch (error) {
      console.error('Error duplicating workflow:', error);
    }
  };

  const filteredWorkflows = workflows.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Workflow Composer
            </h1>
            <p className="text-muted-foreground mt-2">
              Build multi-agent workflows with visual orchestration
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
            >
              My Workflows
            </Button>
            <Button
              variant={viewMode === 'templates' ? 'default' : 'outline'}
              onClick={() => setViewMode('templates')}
            >
              Templates
            </Button>
            <Button
              onClick={createNewWorkflow}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Workflow
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        {viewMode === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 backdrop-blur-xl bg-white/5 border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Workflows</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Zap className="h-8 w-8 text-purple-400" />
              </div>
            </Card>

            <Card className="p-4 backdrop-blur-xl bg-white/5 border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Workflows</p>
                  <p className="text-2xl font-bold text-green-400">{stats.active}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </Card>

            <Card className="p-4 backdrop-blur-xl bg-white/5 border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Executions</p>
                  <p className="text-2xl font-bold">{stats.total_executions}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-400" />
              </div>
            </Card>

            <Card className="p-4 backdrop-blur-xl bg-white/5 border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">{stats.avg_success_rate.toFixed(1)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-400" />
              </div>
            </Card>
          </div>
        )}
      </motion.div>

      {/* View Content */}
      {viewMode === 'list' && (
        <WorkflowList
          workflows={filteredWorkflows}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpen={openWorkflow}
          onDelete={deleteWorkflow}
          onDuplicate={duplicateWorkflow}
        />
      )}

      {viewMode === 'templates' && (
        <WorkflowTemplates
          onSelectTemplate={(template) => {
            const newWorkflow: Workflow = {
              id: crypto.randomUUID(),
              user_id: user?.id || '',
              name: template.name,
              description: template.description,
              status: 'draft',
              trigger_type: 'manual',
              nodes: template.nodes,
              edges: template.edges,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            setSelectedWorkflow(newWorkflow);
            setViewMode('builder');
          }}
        />
      )}

      {viewMode === 'builder' && selectedWorkflow && (
        <WorkflowBuilder
          workflow={selectedWorkflow}
          onSave={async (updatedWorkflow) => {
            await saveWorkflow(updatedWorkflow);
            setSelectedWorkflow(updatedWorkflow);
          }}
          onClose={() => {
            setViewMode('list');
            setSelectedWorkflow(null);
          }}
          onExecute={async (workflowId) => {
            // Execute workflow logic will be implemented
            console.log('Executing workflow:', workflowId);
          }}
        />
      )}
    </div>
  );
};

export default ComposerWorkflows;
