import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Circle, RotateCw, FileText, Settings, TrendingUp, 
  Activity, Clock, AlertCircle 
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { motion } from "framer-motion";

interface AgentHealth {
  agentId: string;
  name: string;
  status: 'healthy' | 'degraded' | 'error' | 'offline';
  uptime: number;
  uptimePercentage: number;
  requestsPerMinute: number;
  avgResponseTime: number;
  errorRate: number;
  memoryUsage: number;
  lastResponse: Date;
}

const AgentHealthMonitor = () => {
  const { toast } = useToast();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [autoRestart, setAutoRestart] = useState(true);
  const [maxRestarts, setMaxRestarts] = useState(3);

  // Mock data
  const agents: AgentHealth[] = [
    {
      agentId: '1',
      name: 'GigFinder Pro',
      status: 'healthy',
      uptime: 2592000,
      uptimePercentage: 99.8,
      requestsPerMinute: 12,
      avgResponseTime: 245,
      errorRate: 0.2,
      memoryUsage: 256,
      lastResponse: new Date()
    },
    {
      agentId: '2',
      name: 'PayMaster',
      status: 'degraded',
      uptime: 2505600,
      uptimePercentage: 94.2,
      requestsPerMinute: 8,
      avgResponseTime: 680,
      errorRate: 4.5,
      memoryUsage: 512,
      lastResponse: new Date(Date.now() - 300000)
    },
    {
      agentId: '3',
      name: 'ViralVibe',
      status: 'healthy',
      uptime: 2678400,
      uptimePercentage: 100,
      requestsPerMinute: 45,
      avgResponseTime: 180,
      errorRate: 0.1,
      memoryUsage: 384,
      lastResponse: new Date()
    },
    {
      agentId: '4',
      name: 'CodeWhiz',
      status: 'error',
      uptime: 0,
      uptimePercentage: 0,
      requestsPerMinute: 0,
      avgResponseTime: 0,
      errorRate: 100,
      memoryUsage: 0,
      lastResponse: new Date(Date.now() - 3600000)
    }
  ];

  const performanceData = [
    { time: '00:00', responseTime: 200, throughput: 45, errors: 0 },
    { time: '04:00', responseTime: 220, throughput: 52, errors: 1 },
    { time: '08:00', responseTime: 280, throughput: 68, errors: 2 },
    { time: '12:00', responseTime: 310, throughput: 85, errors: 3 },
    { time: '16:00', responseTime: 290, throughput: 72, errors: 1 },
    { time: '20:00', responseTime: 240, throughput: 58, errors: 0 }
  ];

  const getStatusColor = (status: AgentHealth['status']) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      case 'offline': return 'text-gray-500';
    }
  };

  const getStatusBadge = (status: AgentHealth['status']) => {
    const colors = {
      healthy: 'bg-green-500/20 text-green-400 border-green-500/30',
      degraded: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      error: 'bg-red-500/20 text-red-400 border-red-500/30',
      offline: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return <Badge variant="outline" className={colors[status]}>{status}</Badge>;
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${hours}h`;
  };

  const handleRestartAgent = (agentId: string, agentName: string) => {
    toast({
      title: 'Restarting agent',
      description: `${agentName} is being restarted...`
    });
    
    setTimeout(() => {
      toast({
        title: 'Agent restarted',
        description: `${agentName} is now online`,
        variant: 'default'
      });
    }, 2000);
  };

  const agent = selectedAgent ? agents.find(a => a.agentId === selectedAgent) : null;

  return (
    <div className="space-y-6">
      {/* Agent List */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-[hsl(var(--text-primary))]">Agent Health Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {agents.map((agent, idx) => (
              <motion.div
                key={agent.agentId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent cursor-pointer transition-all hover-scale"
                onClick={() => setSelectedAgent(agent.agentId)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <Circle className={`w-3 h-3 fill-current ${getStatusColor(agent.status)}`} />
                  <div className="flex-1">
                    <div className="font-medium text-[hsl(var(--text-primary))]">{agent.name}</div>
                    <div className="text-sm text-[hsl(var(--text-secondary))]">
                      {agent.status === 'offline' ? 'Offline' : `${agent.uptimePercentage}% uptime • ${agent.requestsPerMinute} RPM`}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {getStatusBadge(agent.status)}
                  {agent.status === 'error' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestartAgent(agent.agentId, agent.name);
                      }}
                    >
                      <RotateCw className="w-4 h-4 mr-2" />
                      Restart
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      toast({ title: 'Opening logs', description: `Fetching logs for ${agent.name}` });
                    }}
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Agent Details */}
      {agent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Tabs defaultValue="performance">
            <TabsList className="glass-card grid w-full grid-cols-3">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-[hsl(var(--text-primary))]">Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="responseTime" stroke="#8b5cf6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-[hsl(var(--text-primary))]">Throughput</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="throughput" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-[hsl(var(--text-primary))]">Error Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="metrics">
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[hsl(var(--text-secondary))]">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Uptime</span>
                    </div>
                    <div className="text-2xl font-bold text-[hsl(var(--text-primary))]">{formatUptime(agent.uptime)}</div>
                    <div className="text-xs text-[hsl(var(--text-tertiary))]">{agent.uptimePercentage}%</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[hsl(var(--text-secondary))]">
                      <Activity className="w-4 h-4" />
                      <span className="text-sm">Requests/Min</span>
                    </div>
                    <div className="text-2xl font-bold text-[hsl(var(--text-primary))]">{agent.requestsPerMinute}</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[hsl(var(--text-secondary))]">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">Avg Response</span>
                    </div>
                    <div className="text-2xl font-bold text-[hsl(var(--text-primary))]">{agent.avgResponseTime}ms</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[hsl(var(--text-secondary))]">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">Error Rate</span>
                    </div>
                    <div className="text-2xl font-bold text-[hsl(var(--text-primary))]">{agent.errorRate}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-[hsl(var(--text-primary))]">Alert Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-restart">Auto-restart on failure</Label>
                    <Switch
                      id="auto-restart"
                      checked={autoRestart}
                      onCheckedChange={setAutoRestart}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-restarts">Max restarts per hour</Label>
                    <Input
                      id="max-restarts"
                      type="number"
                      value={maxRestarts}
                      onChange={(e) => setMaxRestarts(parseInt(e.target.value))}
                      min={1}
                      max={10}
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-medium text-[hsl(var(--text-primary))]">Alert Thresholds</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Response time &gt; (ms)</Label>
                        <Input type="number" defaultValue="500" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Error rate &gt; (%)</Label>
                        <Input type="number" defaultValue="5" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Downtime &gt; (minutes)</Label>
                      <Input type="number" defaultValue="5" />
                    </div>
                  </div>
                </div>

                <Button className="w-full">Save Alert Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </motion.div>
      )}
    </div>
  );
};

export default AgentHealthMonitor;
