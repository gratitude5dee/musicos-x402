import { motion } from 'framer-motion';
import {
  Zap,
  Music,
  DollarSign,
  Share2,
  BarChart3,
  Users,
  Sparkles,
  Star,
  Clock,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WorkflowTemplate } from '@/types/workflow';

interface WorkflowTemplatesProps {
  onSelectTemplate: (template: WorkflowTemplate) => void;
}

const templates: WorkflowTemplate[] = [
  {
    id: 'creator-onboarding',
    name: 'Creator Onboarding Flow',
    description: 'Automated workflow to onboard new creators with wallet creation, KYC verification, and welcome sequence',
    category: 'onboarding',
    icon: 'users',
    difficulty: 'beginner',
    estimated_time: '5 mins',
    estimated_cost: '$0.20',
    nodes: [
      {
        id: '1',
        type: 'trigger',
        label: 'New Creator Signup',
        position: { x: 100, y: 100 },
        data: { trigger: { type: 'event', eventType: 'creator.signup' } },
      },
      {
        id: '2',
        type: 'agent_invoke',
        label: 'Create Wallet',
        position: { x: 100, y: 220 },
        data: {
          agentName: 'Treasury Agent',
          input: { action: 'create_wallet', creatorId: '{{trigger.creatorId}}' },
        },
      },
      {
        id: '3',
        type: 'agent_invoke',
        label: 'Send Welcome Email',
        position: { x: 100, y: 340 },
        data: {
          agentName: 'Distribution Agent',
          input: { action: 'send_email', template: 'welcome' },
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
    ],
    required_agents: ['treasury', 'distribution'],
    required_tools: ['wallet_create', 'web_search'],
    usage_count: 45,
    rating: 4.8,
    created_by: 'x402',
    created_at: new Date().toISOString(),
  },
  {
    id: 'content-generation-mint',
    name: 'Content Generation & Mint',
    description: 'Generate music content with AI, review it, and automatically mint as NFT when approved',
    category: 'content',
    icon: 'music',
    difficulty: 'intermediate',
    estimated_time: '15 mins',
    estimated_cost: '$1.50',
    nodes: [
      {
        id: '1',
        type: 'trigger',
        label: 'Manual Trigger',
        position: { x: 100, y: 100 },
        data: { trigger: { type: 'manual' } },
      },
      {
        id: '2',
        type: 'agent_invoke',
        label: 'Generate Content',
        position: { x: 100, y: 220 },
        data: {
          agentName: 'Studio Agent',
          input: { prompt: '{{input.prompt}}', style: '{{input.style}}' },
        },
      },
      {
        id: '3',
        type: 'condition',
        label: 'Quality Check',
        position: { x: 100, y: 340 },
        data: {
          condition: { operator: 'greater_than', field: 'quality_score', value: 0.8 },
        },
      },
      {
        id: '4',
        type: 'agent_invoke',
        label: 'Mint NFT',
        position: { x: 300, y: 460 },
        data: { agentName: 'Treasury Agent', input: { action: 'mint' } },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4', label: 'true' },
    ],
    required_agents: ['studio', 'treasury'],
    required_tools: ['kb_search', 'wallet_transfer', 'storage_put'],
    usage_count: 32,
    rating: 4.6,
    created_by: 'x402',
    created_at: new Date().toISOString(),
  },
  {
    id: 'royalty-distribution',
    name: 'Automated Royalty Distribution',
    description: 'Calculate and distribute royalties to creators based on streaming analytics and rights allocation',
    category: 'treasury',
    icon: 'dollar-sign',
    difficulty: 'advanced',
    estimated_time: '20 mins',
    estimated_cost: '$2.00',
    nodes: [
      {
        id: '1',
        type: 'trigger',
        label: 'Monthly Schedule',
        position: { x: 100, y: 100 },
        data: { trigger: { type: 'schedule', schedule: '0 0 1 * *' } },
      },
      {
        id: '2',
        type: 'agent_invoke',
        label: 'Fetch Analytics',
        position: { x: 100, y: 220 },
        data: {
          agentName: 'Analytics Agent',
          input: { period: 'last_month', metric: 'streams' },
        },
      },
      {
        id: '3',
        type: 'agent_invoke',
        label: 'Calculate Royalties',
        position: { x: 100, y: 340 },
        data: {
          agentName: 'Rights Agent',
          input: { data: '{{previousOutput}}' },
        },
      },
      {
        id: '4',
        type: 'parallel',
        label: 'Distribute Payments',
        position: { x: 100, y: 460 },
        data: { parallel: { branches: [], waitForAll: true } },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4' },
    ],
    required_agents: ['analytics', 'rights', 'treasury'],
    required_tools: ['supabase_query_sql', 'wallet_transfer'],
    usage_count: 28,
    rating: 4.9,
    created_by: 'x402',
    created_at: new Date().toISOString(),
  },
  {
    id: 'social-distribution',
    name: 'Multi-Platform Social Distribution',
    description: 'Automatically post content across multiple social media platforms with optimized timing',
    category: 'distribution',
    icon: 'share-2',
    difficulty: 'beginner',
    estimated_time: '8 mins',
    estimated_cost: '$0.30',
    nodes: [
      {
        id: '1',
        type: 'trigger',
        label: 'Content Ready',
        position: { x: 100, y: 100 },
        data: { trigger: { type: 'event', eventType: 'content.ready' } },
      },
      {
        id: '2',
        type: 'agent_invoke',
        label: 'Optimize Post',
        position: { x: 100, y: 220 },
        data: {
          agentName: 'Distribution Agent',
          input: { content: '{{trigger.content}}', platforms: '{{trigger.platforms}}' },
        },
      },
      {
        id: '3',
        type: 'parallel',
        label: 'Post to Platforms',
        position: { x: 100, y: 340 },
        data: { parallel: { branches: [], waitForAll: false } },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
    ],
    required_agents: ['distribution'],
    required_tools: ['web_search', 'webhook'],
    usage_count: 56,
    rating: 4.7,
    created_by: 'x402',
    created_at: new Date().toISOString(),
  },
  {
    id: 'analytics-reporting',
    name: 'Weekly Analytics Report',
    description: 'Generate comprehensive weekly performance reports with insights and recommendations',
    category: 'analytics',
    icon: 'bar-chart-3',
    difficulty: 'beginner',
    estimated_time: '10 mins',
    estimated_cost: '$0.50',
    nodes: [
      {
        id: '1',
        type: 'trigger',
        label: 'Weekly Schedule',
        position: { x: 100, y: 100 },
        data: { trigger: { type: 'schedule', schedule: '0 9 * * 1' } },
      },
      {
        id: '2',
        type: 'agent_invoke',
        label: 'Gather Metrics',
        position: { x: 100, y: 220 },
        data: {
          agentName: 'Analytics Agent',
          input: { period: 'last_week', include: ['streams', 'revenue', 'engagement'] },
        },
      },
      {
        id: '3',
        type: 'agent_invoke',
        label: 'Generate Report',
        position: { x: 100, y: 340 },
        data: {
          agentName: 'Analytics Agent',
          input: { data: '{{previousOutput}}', format: 'pdf' },
        },
      },
      {
        id: '4',
        type: 'webhook',
        label: 'Send to Email',
        position: { x: 100, y: 460 },
        data: {
          webhook: {
            url: 'https://api.sendgrid.com/v3/mail/send',
            method: 'POST',
            bodyTemplate: '{"to": "{{user.email}}", "report": "{{previousOutput}}"}',
          },
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4' },
    ],
    required_agents: ['analytics'],
    required_tools: ['supabase_query_sql', 'kb_search'],
    usage_count: 67,
    rating: 4.5,
    created_by: 'x402',
    created_at: new Date().toISOString(),
  },
];

const getIcon = (iconName: string) => {
  const icons: Record<string, React.ReactNode> = {
    'users': <Users className="h-6 w-6" />,
    'music': <Music className="h-6 w-6" />,
    'dollar-sign': <DollarSign className="h-6 w-6" />,
    'share-2': <Share2 className="h-6 w-6" />,
    'bar-chart-3': <BarChart3 className="h-6 w-6" />,
  };
  return icons[iconName] || <Sparkles className="h-6 w-6" />;
};

const getDifficultyColor = (difficulty: string) => {
  const colors: Record<string, string> = {
    beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
    intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return colors[difficulty] || colors.beginner;
};

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    onboarding: 'from-green-500 to-emerald-500',
    content: 'from-purple-500 to-blue-500',
    distribution: 'from-orange-500 to-red-500',
    analytics: 'from-cyan-500 to-blue-500',
    treasury: 'from-yellow-500 to-orange-500',
    custom: 'from-pink-500 to-purple-500',
  };
  return colors[category] || colors.custom;
};

const WorkflowTemplates = ({ onSelectTemplate }: WorkflowTemplatesProps) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Workflow Templates</h2>
        <p className="text-muted-foreground">
          Start with a pre-built workflow and customize it for your needs
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template, idx) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="p-6 backdrop-blur-xl bg-white/5 border-white/10 hover:border-white/20 transition-all group h-full flex flex-col">
              {/* Icon & Rating */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${getCategoryColor(
                    template.category
                  )}`}
                >
                  {getIcon(template.icon)}
                </div>
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-medium">{template.rating}</span>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="font-semibold text-lg mb-2 group-hover:text-purple-400 transition-colors">
                {template.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 flex-1">
                {template.description}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className={getDifficultyColor(template.difficulty)}>
                  {template.difficulty}
                </Badge>
                <Badge variant="outline" className="border-white/10">
                  {template.category}
                </Badge>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="p-2 rounded-lg bg-white/5">
                  <p className="text-sm font-bold">{template.nodes.length}</p>
                  <p className="text-xs text-muted-foreground">Nodes</p>
                </div>
                <div className="p-2 rounded-lg bg-white/5">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3" />
                    <p className="text-sm font-bold">{template.estimated_time}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Time</p>
                </div>
                <div className="p-2 rounded-lg bg-white/5">
                  <p className="text-sm font-bold">{template.estimated_cost}</p>
                  <p className="text-xs text-muted-foreground">Cost</p>
                </div>
              </div>

              {/* Required Agents */}
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2">Required Agents:</p>
                <div className="flex flex-wrap gap-1">
                  {template.required_agents.map(agent => (
                    <Badge key={agent} variant="secondary" className="text-xs">
                      {agent}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  Used by {template.usage_count} creators
                </div>
                <Button
                  onClick={() => onSelectTemplate(template)}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  size="sm"
                >
                  Use Template
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Custom Template Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: templates.length * 0.05 }}
      >
        <Card className="p-8 backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20 text-center">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-400" />
          <h3 className="text-xl font-semibold mb-2">Need a Custom Workflow?</h3>
          <p className="text-muted-foreground mb-4">
            Start from scratch and build a completely custom workflow tailored to your needs
          </p>
          <Button
            variant="outline"
            className="border-purple-500/30 hover:bg-purple-500/10"
          >
            Start from Scratch
          </Button>
        </Card>
      </motion.div>
    </div>
  );
};

export default WorkflowTemplates;
