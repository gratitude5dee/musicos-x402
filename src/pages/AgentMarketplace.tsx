'use client'

import { useState } from 'react'
import DashboardLayout from '@/layouts/dashboard-layout'
import { useQuery } from '@tanstack/react-query'
import { useAgent } from '@/context/AgentContext'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { motion } from 'framer-motion'
import {
  Search,
  Bot,
  Coins,
  Palette,
  BarChart3,
  FileText,
  TrendingUp,
  Download,
  Star,
} from 'lucide-react'
import { toast } from 'sonner'

interface MarketplaceAgent {
  id: string
  name: string
  type: string
  description: string
  avatar_url?: string
  capabilities: string[]
  tools_enabled: string[]
  creator_name: string
  rating: number
  installations: number
  is_featured: boolean
  is_public: boolean
  config_template: Record<string, any>
}

const AGENT_TYPE_ICONS = {
  studio: Palette,
  treasury: Coins,
  distribution: TrendingUp,
  rights: FileText,
  analytics: BarChart3,
  custom: Bot,
}

const skeletonArray = (count: number) => Array.from({ length: count }, (_, index) => index)

export default function AgentMarketplacePage() {
  const { createAgent } = useAgent()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')

  const { data: marketplaceAgents = [], isLoading } = useQuery({
    queryKey: ['marketplace-agents', searchQuery, selectedType],
    queryFn: async () => {
      let query = supabase
        .from('agents')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (selectedType !== 'all') {
        query = query.eq('type', selectedType)
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }

      const { data, error } = await query.limit(50)

      if (error) throw error
      
      // Map database agents to marketplace format
      return (data ?? []).map(agent => ({
        id: agent.id,
        name: agent.name,
        type: agent.type,
        description: agent.description || 'No description available',
        avatar_url: agent.avatar_url,
        capabilities: Array.isArray(agent.capabilities) ? agent.capabilities as string[] : [],
        tools_enabled: Array.isArray(agent.tools_enabled) ? agent.tools_enabled as string[] : [],
        creator_name: 'System',
        rating: 4.5,
        installations: 0,
        is_featured: false,
        is_public: true,
        config_template: typeof agent.config === 'object' ? agent.config : {},
      })) as MarketplaceAgent[]
    },
  })

  const handleInstallAgent = async (agent: MarketplaceAgent) => {
    try {
      await createAgent({
        name: `${agent.name} (Copy)`,
        type: agent.type as any,
        description: agent.description,
        capabilities: agent.capabilities,
        tools_enabled: agent.tools_enabled,
        config: agent.config_template || {},
      })

      toast.success('Agent installed', {
        description: `${agent.name} has been added to your workspace`,
      })
    } catch (error: any) {
      toast.error('Installation failed', {
        description: error?.message || 'Unable to install agent',
      })
    }
  }

  const featuredAgents = marketplaceAgents.filter((agent) => agent.is_featured)
  const allAgents = marketplaceAgents

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Agent Marketplace</h1>
          <p className="text-lg text-muted-foreground">
            Discover and install AI agents to supercharge your creative workflows
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Agent type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="studio">Studio</SelectItem>
              <SelectItem value="treasury">Treasury</SelectItem>
              <SelectItem value="distribution">Distribution</SelectItem>
              <SelectItem value="rights">Rights</SelectItem>
              <SelectItem value="analytics">Analytics</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="featured">
          <TabsList>
            <TabsTrigger value="featured">Featured ({featuredAgents.length})</TabsTrigger>
            <TabsTrigger value="all">All Agents ({allAgents.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="featured" className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {skeletonArray(3).map((index) => (
                  <Card key={index} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded mb-2" />
                      <div className="h-4 bg-muted rounded" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-20 bg-muted rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : featuredAgents.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Bot className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No featured agents available</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredAgents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} onInstall={handleInstallAgent} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {skeletonArray(6).map((index) => (
                  <Card key={index} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded mb-2" />
                      <div className="h-4 bg-muted rounded" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-20 bg-muted rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : allAgents.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Bot className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No agents found matching your criteria
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allAgents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} onInstall={handleInstallAgent} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

function AgentCard({
  agent,
  onInstall,
}: {
  agent: MarketplaceAgent
  onInstall: (agent: MarketplaceAgent) => void
}) {
  const Icon = AGENT_TYPE_ICONS[agent.type as keyof typeof AGENT_TYPE_ICONS] || Bot

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full flex flex-col hover:border-primary/50 transition-colors">
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <Avatar className="h-12 w-12">
              <AvatarImage src={agent.avatar_url} />
              <AvatarFallback>
                <Icon className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            {agent.is_featured && (
              <Badge variant="default" className="bg-yellow-500">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>

          <CardTitle className="text-xl">{agent.name}</CardTitle>
          <CardDescription className="line-clamp-2">{agent.description}</CardDescription>

          <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-current text-yellow-500" />
              <span>{agent.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>{agent.installations.toLocaleString()}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col justify-between">
          <div className="space-y-3 mb-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Capabilities</p>
              <div className="flex flex-wrap gap-1">
                {agent.capabilities.slice(0, 3).map((capability) => (
                  <Badge key={capability} variant="secondary" className="text-xs">
                    {capability}
                  </Badge>
                ))}
                {agent.capabilities.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{agent.capabilities.length - 3}
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">Tools</p>
              <p className="text-sm">{agent.tools_enabled.length} tools enabled</p>
            </div>
          </div>

          <Button onClick={() => onInstall(agent)} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Install Agent
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
