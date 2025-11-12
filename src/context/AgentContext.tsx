'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export interface Agent {
  id: string
  user_id: string
  name: string
  type: 'studio' | 'treasury' | 'distribution' | 'rights' | 'analytics' | 'custom'
  description: string
  avatar_url?: string | null
  config: Record<string, any>
  capabilities: string[]
  tools_enabled: string[]
  status: 'active' | 'paused' | 'disabled' | 'archived'
  spend_limit_sol: number
  daily_spend_limit_sol: number
  requires_approval: boolean
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  last_active_at: string
}

export interface AgentInvocationResult {
  status: 'completed' | 'approval_required' | 'failed'
  correlationId: string
  response?: string
  executionResults?: any[]
  plan?: any[]
  approvalRequestId?: string
  message?: string
  error?: string
}

interface AgentContextType {
  agents: Agent[]
  activeAgent: Agent | null
  setActiveAgent: (agent: Agent | null) => void
  loading: boolean
  error: string | null
  createAgent: (data: Partial<Agent>) => Promise<Agent>
  updateAgent: (id: string, data: Partial<Agent>) => Promise<Agent>
  deleteAgent: (id: string) => Promise<void>
  invokeAgent: (
    agentId: string,
    input: string,
    context?: Record<string, any>
  ) => Promise<AgentInvocationResult>
  getAgentActivity: (agentId: string, limit?: number) => Promise<any[]>
}

const AgentContext = createContext<AgentContextType | undefined>(undefined)

export const useAgent = () => {
  const context = useContext(AgentContext)
  if (!context) {
    throw new Error('useAgent must be used within an AgentProvider')
  }
  return context
}

export function AgentProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null)
  const queryClient = useQueryClient()

  const userId = user?.id

  const {
    data: agents = [],
    isLoading: loading,
    error: fetchError,
  } = useQuery({
    queryKey: ['agents', userId],
    enabled: !!userId,
    refetchInterval: 30000,
    queryFn: async () => {
      if (!userId) return []

      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', userId)
        .order('last_active_at', { ascending: false })

      if (error) throw error

      return (data ?? []).map((agent) => ({
        ...agent,
        config: agent.config ?? {},
        capabilities: agent.capabilities ?? [],
        tools_enabled: agent.tools_enabled ?? [],
        metadata: agent.metadata ?? {},
      })) as Agent[]
    },
  })

  useEffect(() => {
    if (!agents.length) {
      setActiveAgent(null)
      return
    }

    setActiveAgent((current) => {
      if (!current) {
        return agents[0]
      }

      const stillExists = agents.find((agent) => agent.id === current.id)
      return stillExists ?? agents[0]
    })
  }, [agents])

  const createAgentMutation = useMutation({
    mutationFn: async (data: Partial<Agent>) => {
      if (!userId) throw new Error('User not authenticated')

      const { data: newAgent, error } = await supabase
        .from('agents')
        .insert({
          user_id: userId,
          ...data,
        })
        .select()
        .single()

      if (error) throw error
      return {
        ...newAgent,
        config: newAgent?.config ?? {},
        capabilities: newAgent?.capabilities ?? [],
        tools_enabled: newAgent?.tools_enabled ?? [],
        metadata: newAgent?.metadata ?? {},
      } as Agent
    },
    onSuccess: (createdAgent) => {
      queryClient.invalidateQueries({ queryKey: ['agents', userId] })
      setActiveAgent((current) => current ?? createdAgent)
    },
  })

  const updateAgentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Agent> }) => {
      const { data: updatedAgent, error } = await supabase
        .from('agents')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return {
        ...updatedAgent,
        config: updatedAgent?.config ?? {},
        capabilities: updatedAgent?.capabilities ?? [],
        tools_enabled: updatedAgent?.tools_enabled ?? [],
        metadata: updatedAgent?.metadata ?? {},
      } as Agent
    },
    onSuccess: (agent) => {
      queryClient.invalidateQueries({ queryKey: ['agents', userId] })
      setActiveAgent((current) => (current?.id === agent.id ? agent : current))
    },
  })

  const deleteAgentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('agents').delete().eq('id', id)
      if (error) throw error
      return id
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['agents', userId] })
      setActiveAgent((current) => {
        if (!current) return null
        if (current.id !== deletedId) return current
        const fallback = agents.find((agent) => agent.id !== deletedId)
        return fallback ?? null
      })
    },
  })

  const invokeAgent = useCallback(
    async (
      agentId: string,
      input: string,
      context: Record<string, any> = {}
    ): Promise<AgentInvocationResult> => {
      const { data, error } = await supabase.functions.invoke('agent-invoke', {
        body: {
          agentId,
          input,
          context,
        },
      })

      if (error) throw error
      return data as AgentInvocationResult
    },
    []
  )

  const getAgentActivity = useCallback(async (agentId: string, limit = 50) => {
    const { data, error } = await supabase
      .from('agent_activity_log')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data ?? []
  }, [])

  const value = useMemo<AgentContextType>(
    () => ({
      agents,
      activeAgent,
      setActiveAgent,
      loading,
      error: fetchError?.message ?? null,
      createAgent: createAgentMutation.mutateAsync,
      updateAgent: (id, data) => updateAgentMutation.mutateAsync({ id, data }),
      deleteAgent: (id) => deleteAgentMutation.mutateAsync(id),
      invokeAgent,
      getAgentActivity,
    }),
    [
      agents,
      activeAgent,
      loading,
      fetchError?.message,
      createAgentMutation.mutateAsync,
      updateAgentMutation.mutateAsync,
      deleteAgentMutation.mutateAsync,
      invokeAgent,
      getAgentActivity,
    ]
  )

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>
}
