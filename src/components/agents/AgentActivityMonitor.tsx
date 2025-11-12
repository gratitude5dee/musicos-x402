'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAgent } from '@/context/AgentContext'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock as ClockIcon,
  Zap,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface ActivityLog {
  id: string
  agent_id: string
  correlation_id: string
  activity_type: string
  tool_name: string | null
  tool_status: 'success' | 'failure' | 'pending' | null
  latency_ms: number | null
  tokens_used: number | null
  cost_usd: number | null
  error_message: string | null
  created_at: string
  completed_at: string | null
}

interface ActivityMetrics {
  totalCalls: number
  successRate: number
  avgLatencyMs: number
  totalCostUsd: number
  toolDistribution: Array<{ tool: string; count: number }>
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function AgentActivityMonitor() {
  const { activeAgent } = useAgent()
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [metrics, setMetrics] = useState<ActivityMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const calculateMetrics = useCallback((logs: ActivityLog[]) => {
    if (!logs.length) {
      setMetrics(null)
      return
    }

    const toolCalls = logs.filter((log) => log.activity_type === 'tool_call')
    const successCount = toolCalls.filter((log) => log.tool_status === 'success').length
    const totalLatency = toolCalls.reduce((sum, log) => sum + (log.latency_ms ?? 0), 0)
    const totalCost = logs.reduce((sum, log) => sum + (log.cost_usd ?? 0), 0)

    const distributionMap = toolCalls.reduce((acc, log) => {
      if (!log.tool_name) return acc
      acc[log.tool_name] = (acc[log.tool_name] ?? 0) + 1
      return acc
    }, {} as Record<string, number>)

    setMetrics({
      totalCalls: toolCalls.length,
      successRate: toolCalls.length ? (successCount / toolCalls.length) * 100 : 0,
      avgLatencyMs: toolCalls.length ? totalLatency / toolCalls.length : 0,
      totalCostUsd: totalCost,
      toolDistribution: Object.entries(distributionMap).map(([tool, count]) => ({
        tool,
        count,
      })),
    })
  }, [])

  useEffect(() => {
    if (!activeAgent) {
      setActivityLogs([])
      setMetrics(null)
      return
    }

    let isMounted = true

    const fetchActivity = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('agent_activity_log')
          .select('*')
          .eq('agent_id', activeAgent.id)
          .order('created_at', { ascending: false })
          .limit(100)

        if (error) throw error

        if (!isMounted) return

        const logs = (data ?? []) as ActivityLog[]
        setActivityLogs(logs)
        calculateMetrics(logs)
      } catch (error) {
        console.error('Failed to fetch activity:', error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchActivity()

    const channel = supabase
      .channel(`agent_activity:${activeAgent.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_activity_log',
          filter: `agent_id=eq.${activeAgent.id}`,
        },
        (payload) => {
          const newLog = payload.new as ActivityLog
          setActivityLogs((prev) => {
            const updated = [newLog, ...prev].slice(0, 100)
            calculateMetrics(updated)
            return updated
          })
        }
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [activeAgent, calculateMetrics])

  if (!activeAgent) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Select an agent to view activity</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Calls</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.totalCalls}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <Zap className="h-3 w-3 inline mr-1" />
                Tool invocations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Success Rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.successRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                Successful executions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg Latency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.avgLatencyMs.toFixed(0)}ms</div>
              <p className="text-xs text-muted-foreground mt-1">
                <ClockIcon className="h-3 w-3 inline mr-1" />
                Response time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Cost</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${metrics.totalCostUsd.toFixed(4)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                API usage
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>Real-time agent execution history</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="timeline">
            <TabsList>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="charts">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline">
              <ScrollArea className="h-[600px]">
                <AnimatePresence>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((index) => (
                        <div key={index} className="h-20 bg-muted animate-pulse rounded-lg" />
                      ))}
                    </div>
                  ) : activityLogs.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Activity className="w-12 h-12 mx-auto mb-4" />
                      <p>No activity recorded yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activityLogs.map((log) => (
                        <ActivityLogItem key={log.id} log={log} />
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="charts">
              {metrics && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-sm font-medium mb-4">Tool Usage Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={metrics.toolDistribution}
                          dataKey="count"
                          nameKey="tool"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        >
                          {metrics.toolDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-4">Latency Trend (Last 20 calls)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={activityLogs
                          .filter((log) => log.latency_ms != null)
                          .slice(0, 20)
                          .reverse()}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="created_at"
                          tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                        />
                        <YAxis />
                        <Tooltip labelFormatter={(value) => new Date(value).toLocaleString()} />
                        <Line type="monotone" dataKey="latency_ms" stroke="#3b82f6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function ActivityLogItem({ log }: { log: ActivityLog }) {
  const getStatusIcon = () => {
    if (log.tool_status === 'success') {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />
    }
    if (log.tool_status === 'failure') {
      return <XCircle className="h-5 w-5 text-red-500" />
    }
    if (log.tool_status === 'pending') {
      return <ClockIcon className="h-5 w-5 text-yellow-500" />
    }
    return <Activity className="h-5 w-5 text-blue-500" />
  }

  const getStatusBadge = () => {
    if (log.tool_status === 'success') {
      return <Badge variant="default">Success</Badge>
    }
    if (log.tool_status === 'failure') {
      return <Badge variant="destructive">Failed</Badge>
    }
    if (log.tool_status === 'pending') {
      return <Badge variant="secondary">Pending</Badge>
    }
    return <Badge variant="outline">{log.activity_type}</Badge>
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
    >
      <div className="mt-1">{getStatusIcon()}</div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm">{log.tool_name || log.activity_type}</p>
            {getStatusBadge()}
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date(log.created_at).toLocaleTimeString()}
          </p>
        </div>

        {log.latency_ms != null && (
          <p className="text-xs text-muted-foreground">
            <ClockIcon className="h-3 w-3 inline mr-1" />
            {log.latency_ms}ms
          </p>
        )}

        {log.error_message && (
          <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
            <AlertCircle className="h-3 w-3 inline mr-1" />
            {log.error_message}
          </div>
        )}
      </div>
    </motion.div>
  )
}
