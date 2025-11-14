import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  Terminal,
  Clock,
  DollarSign,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  Download,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { useAgent } from '@/context/AgentContext';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface TestExecution {
  id: string;
  agent_id: string;
  agent_name: string;
  input: any;
  output?: any;
  error?: string;
  status: 'running' | 'success' | 'failed';
  duration_ms?: number;
  cost_usd?: number;
  tokens?: number;
  started_at: string;
  completed_at?: string;
}

const ComposerPlayground = () => {
  const { user } = useAuth();
  const { agents, invokeAgent } = useAgent();
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [inputJson, setInputJson] = useState('{\n  "message": "Hello"\n}');
  const [isRunning, setIsRunning] = useState(false);
  const [currentExecution, setCurrentExecution] = useState<TestExecution | null>(null);
  const [executionHistory, setExecutionHistory] = useState<TestExecution[]>([]);
  const [activeTab, setActiveTab] = useState<'input' | 'output' | 'logs' | 'history'>('input');

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  useEffect(() => {
    if (selectedAgentId) {
      loadExecutionHistory();
    }
  }, [selectedAgentId]);

  const loadExecutionHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('agent_activity_log')
        .select('*')
        .eq('agent_id', selectedAgentId)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const history: TestExecution[] = (data || []).map(log => ({
        id: log.id,
        agent_id: log.agent_id,
        agent_name: selectedAgent?.name || '',
        input: log.metadata?.input,
        output: log.metadata?.output,
        error: log.error_message,
        status: log.tool_status === 'success' ? 'success' : log.tool_status === 'error' ? 'failed' : 'running',
        duration_ms: log.latency_ms,
        cost_usd: log.cost_usd,
        tokens: log.tokens_used,
        started_at: log.created_at,
        completed_at: log.completed_at,
      }));

      setExecutionHistory(history);
    } catch (error) {
      console.error('Error loading execution history:', error);
    }
  };

  const handleRunTest = async () => {
    if (!selectedAgentId) return;

    try {
      setIsRunning(true);
      setActiveTab('output');

      let parsedInput;
      try {
        parsedInput = JSON.parse(inputJson);
      } catch (e) {
        throw new Error('Invalid JSON input');
      }

      const execution: TestExecution = {
        id: crypto.randomUUID(),
        agent_id: selectedAgentId,
        agent_name: selectedAgent?.name || '',
        input: parsedInput,
        status: 'running',
        started_at: new Date().toISOString(),
      };

      setCurrentExecution(execution);

      const startTime = Date.now();
      const result = await invokeAgent(selectedAgentId, parsedInput);
      const endTime = Date.now();

      const completedExecution: TestExecution = {
        ...execution,
        status: 'success',
        output: result,
        duration_ms: endTime - startTime,
        completed_at: new Date().toISOString(),
      };

      setCurrentExecution(completedExecution);
      setExecutionHistory(prev => [completedExecution, ...prev]);
    } catch (error: any) {
      const failedExecution: TestExecution = {
        ...currentExecution!,
        status: 'failed',
        error: error.message,
        completed_at: new Date().toISOString(),
      };

      setCurrentExecution(failedExecution);
      setExecutionHistory(prev => [failedExecution, ...prev]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setCurrentExecution(null);
    setActiveTab('input');
  };

  const handleCopyOutput = () => {
    if (currentExecution?.output) {
      navigator.clipboard.writeText(JSON.stringify(currentExecution.output, null, 2));
    }
  };

  const handleLoadFromHistory = (execution: TestExecution) => {
    setInputJson(JSON.stringify(execution.input, null, 2));
    setSelectedAgentId(execution.agent_id);
    setCurrentExecution(execution);
    setActiveTab('output');
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Agent Playground
            </h1>
            <p className="text-muted-foreground mt-2">
              Test and debug your agents in a safe sandbox environment
            </p>
          </div>

          <Button
            onClick={handleReset}
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Configuration */}
        <Card className="p-6 backdrop-blur-xl bg-white/5 border-white/10 lg:col-span-1">
          <h3 className="font-semibold mb-4">Test Configuration</h3>

          <div className="space-y-4">
            {/* Agent Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Select Agent</label>
              <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Choose an agent to test" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>
                      <div className="flex items-center gap-2">
                        <span>{agent.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {agent.type}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Agent Info */}
            {selectedAgent && (
              <Card className="p-3 bg-white/5 border-white/10">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <Badge variant="secondary">{selectedAgent.type}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge
                      variant={selectedAgent.status === 'active' ? 'default' : 'secondary'}
                    >
                      {selectedAgent.status}
                    </Badge>
                  </div>
                  {selectedAgent.capabilities && (
                    <div>
                      <span className="text-muted-foreground">Capabilities:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedAgent.capabilities.slice(0, 3).map((cap, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Run Button */}
            <Button
              onClick={handleRunTest}
              disabled={!selectedAgentId || isRunning}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4 mr-2 animate-pulse" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Test
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Right Panel - Input/Output */}
        <Card className="backdrop-blur-xl bg-white/5 border-white/10 lg:col-span-2">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <div className="border-b border-white/10 px-6 py-4">
              <TabsList className="bg-white/5">
                <TabsTrigger value="input">
                  <Terminal className="h-4 w-4 mr-2" />
                  Input
                </TabsTrigger>
                <TabsTrigger value="output">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Output
                </TabsTrigger>
                <TabsTrigger value="logs">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Logs
                </TabsTrigger>
                <TabsTrigger value="history">
                  <Clock className="h-4 w-4 mr-2" />
                  History
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Input Tab */}
            <TabsContent value="input" className="p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Input JSON</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setInputJson(JSON.stringify(JSON.parse(inputJson), null, 2))}
                    >
                      Format
                    </Button>
                  </div>
                  <Textarea
                    value={inputJson}
                    onChange={(e) => setInputJson(e.target.value)}
                    className="font-mono text-sm bg-black/20 border-white/10 min-h-[400px]"
                    placeholder='{\n  "message": "Your input here"\n}'
                  />
                </div>

                <Card className="p-4 bg-blue-500/10 border-blue-500/20">
                  <div className="flex gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-400 mb-1">Pro Tip</p>
                      <p className="text-muted-foreground">
                        Use valid JSON format. You can reference agent capabilities to know what
                        inputs it expects.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Output Tab */}
            <TabsContent value="output" className="p-6">
              {currentExecution ? (
                <div className="space-y-4">
                  {/* Execution Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {currentExecution.status === 'running' && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                          <span className="text-sm text-blue-400">Running...</span>
                        </div>
                      )}
                      {currentExecution.status === 'success' && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-400" />
                          <span className="text-sm text-green-400">Success</span>
                        </div>
                      )}
                      {currentExecution.status === 'failed' && (
                        <div className="flex items-center gap-2">
                          <XCircle className="h-5 w-5 text-red-400" />
                          <span className="text-sm text-red-400">Failed</span>
                        </div>
                      )}
                    </div>

                    {currentExecution.output && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyOutput}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    )}
                  </div>

                  {/* Metrics */}
                  {currentExecution.duration_ms && (
                    <div className="grid grid-cols-3 gap-4">
                      <Card className="p-3 bg-white/5 border-white/10">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-400" />
                          <div>
                            <p className="text-xs text-muted-foreground">Duration</p>
                            <p className="text-sm font-medium">{currentExecution.duration_ms}ms</p>
                          </div>
                        </div>
                      </Card>
                      <Card className="p-3 bg-white/5 border-white/10">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-400" />
                          <div>
                            <p className="text-xs text-muted-foreground">Cost</p>
                            <p className="text-sm font-medium">
                              ${(currentExecution.cost_usd || 0).toFixed(4)}
                            </p>
                          </div>
                        </div>
                      </Card>
                      <Card className="p-3 bg-white/5 border-white/10">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-yellow-400" />
                          <div>
                            <p className="text-xs text-muted-foreground">Tokens</p>
                            <p className="text-sm font-medium">{currentExecution.tokens || 0}</p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}

                  {/* Output/Error */}
                  {currentExecution.error ? (
                    <Card className="p-4 bg-red-500/10 border-red-500/20">
                      <p className="font-medium text-red-400 mb-2">Error</p>
                      <pre className="text-sm text-red-300 whitespace-pre-wrap">
                        {currentExecution.error}
                      </pre>
                    </Card>
                  ) : currentExecution.output ? (
                    <div>
                      <p className="text-sm font-medium mb-2">Response</p>
                      <pre className="p-4 rounded-lg bg-black/20 border border-white/10 text-sm overflow-auto max-h-[400px]">
                        {JSON.stringify(currentExecution.output, null, 2)}
                      </pre>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Terminal className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No execution yet. Configure and run a test to see results here.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Logs Tab */}
            <TabsContent value="logs" className="p-6">
              <div className="space-y-2 font-mono text-xs">
                {currentExecution ? (
                  <>
                    <div className="flex gap-2 text-muted-foreground">
                      <span>[{new Date(currentExecution.started_at).toLocaleTimeString()}]</span>
                      <span>Starting execution for agent: {currentExecution.agent_name}</span>
                    </div>
                    {currentExecution.completed_at && (
                      <div className="flex gap-2 text-muted-foreground">
                        <span>[{new Date(currentExecution.completed_at).toLocaleTimeString()}]</span>
                        <span>Execution completed with status: {currentExecution.status}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">No logs available</p>
                )}
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="p-6">
              <div className="space-y-2">
                {executionHistory.length > 0 ? (
                  executionHistory.map(execution => (
                    <Card
                      key={execution.id}
                      className="p-4 bg-white/5 border-white/10 hover:border-white/20 cursor-pointer transition-all"
                      onClick={() => handleLoadFromHistory(execution)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {execution.status === 'success' ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-400" />
                          )}
                          <div>
                            <p className="text-sm font-medium">{execution.agent_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(execution.started_at))} ago
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          {execution.duration_ms}ms
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-center">
                    <Clock className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No execution history</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default ComposerPlayground;
