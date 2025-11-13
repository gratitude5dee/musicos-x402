import { WorkflowNode } from '@/types/workflow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';

interface WorkflowNodeConfigProps {
  node: WorkflowNode;
  agents: any[];
  onUpdate: (updates: Partial<WorkflowNode>) => void;
  onDelete: () => void;
}

const WorkflowNodeConfig = ({ node, agents, onUpdate, onDelete }: WorkflowNodeConfigProps) => {
  const handleLabelChange = (label: string) => {
    onUpdate({ label });
  };

  const handleDataChange = (key: string, value: any) => {
    onUpdate({
      data: {
        ...node.data,
        [key]: value,
      },
    });
  };

  const renderAgentInvokeConfig = () => (
    <div className="space-y-4">
      <div>
        <Label>Select Agent</Label>
        <Select
          value={node.data.agentId || ''}
          onValueChange={(value) => {
            const agent = agents.find(a => a.id === value);
            handleDataChange('agentId', value);
            handleDataChange('agentName', agent?.name);
            handleDataChange('agentType', agent?.type);
          }}
        >
          <SelectTrigger className="bg-white/5 border-white/10">
            <SelectValue placeholder="Choose an agent" />
          </SelectTrigger>
          <SelectContent>
            {agents.map(agent => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.name} ({agent.type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Input (JSON or template)</Label>
        <Textarea
          value={typeof node.data.input === 'string' ? node.data.input : JSON.stringify(node.data.input || {}, null, 2)}
          onChange={(e) => handleDataChange('input', e.target.value)}
          placeholder='{"message": "Hello"} or {{previousOutput}}'
          className="bg-white/5 border-white/10 font-mono text-sm"
          rows={5}
        />
      </div>
    </div>
  );

  const renderConditionConfig = () => (
    <div className="space-y-4">
      <div>
        <Label>Field to Check</Label>
        <Input
          value={node.data.condition?.field || ''}
          onChange={(e) =>
            handleDataChange('condition', {
              ...node.data.condition,
              field: e.target.value,
            })
          }
          placeholder="response.status"
          className="bg-white/5 border-white/10"
        />
      </div>

      <div>
        <Label>Operator</Label>
        <Select
          value={node.data.condition?.operator || 'equals'}
          onValueChange={(value) =>
            handleDataChange('condition', {
              ...node.data.condition,
              operator: value,
            })
          }
        >
          <SelectTrigger className="bg-white/5 border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="equals">Equals</SelectItem>
            <SelectItem value="contains">Contains</SelectItem>
            <SelectItem value="greater_than">Greater Than</SelectItem>
            <SelectItem value="less_than">Less Than</SelectItem>
            <SelectItem value="exists">Exists</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Value</Label>
        <Input
          value={node.data.condition?.value || ''}
          onChange={(e) =>
            handleDataChange('condition', {
              ...node.data.condition,
              value: e.target.value,
            })
          }
          placeholder="success"
          className="bg-white/5 border-white/10"
        />
      </div>
    </div>
  );

  const renderTransformConfig = () => (
    <div className="space-y-4">
      <div>
        <Label>Transform Type</Label>
        <Select
          value={node.data.transform?.type || 'template'}
          onValueChange={(value) =>
            handleDataChange('transform', {
              ...node.data.transform,
              type: value,
            })
          }
        >
          <SelectTrigger className="bg-white/5 border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="template">Template</SelectItem>
            <SelectItem value="jq">JQ Expression</SelectItem>
            <SelectItem value="javascript">JavaScript</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Expression</Label>
        <Textarea
          value={node.data.transform?.expression || ''}
          onChange={(e) =>
            handleDataChange('transform', {
              ...node.data.transform,
              expression: e.target.value,
            })
          }
          placeholder='{{input.field1}} + {{input.field2}}'
          className="bg-white/5 border-white/10 font-mono text-sm"
          rows={6}
        />
      </div>
    </div>
  );

  const renderTriggerConfig = () => (
    <div className="space-y-4">
      <div>
        <Label>Trigger Type</Label>
        <Select
          value={node.data.trigger?.type || 'manual'}
          onValueChange={(value) =>
            handleDataChange('trigger', {
              ...node.data.trigger,
              type: value,
            })
          }
        >
          <SelectTrigger className="bg-white/5 border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Manual</SelectItem>
            <SelectItem value="schedule">Schedule</SelectItem>
            <SelectItem value="event">Event</SelectItem>
            <SelectItem value="webhook">Webhook</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {node.data.trigger?.type === 'schedule' && (
        <div>
          <Label>Schedule (Cron Expression)</Label>
          <Input
            value={node.data.trigger?.schedule || ''}
            onChange={(e) =>
              handleDataChange('trigger', {
                ...node.data.trigger,
                schedule: e.target.value,
              })
            }
            placeholder="0 0 * * *"
            className="bg-white/5 border-white/10 font-mono"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Example: 0 0 * * * (daily at midnight)
          </p>
        </div>
      )}

      {node.data.trigger?.type === 'event' && (
        <div>
          <Label>Event Type</Label>
          <Input
            value={node.data.trigger?.eventType || ''}
            onChange={(e) =>
              handleDataChange('trigger', {
                ...node.data.trigger,
                eventType: e.target.value,
              })
            }
            placeholder="agent.completed"
            className="bg-white/5 border-white/10"
          />
        </div>
      )}
    </div>
  );

  const renderWebhookConfig = () => (
    <div className="space-y-4">
      <div>
        <Label>Webhook URL</Label>
        <Input
          value={node.data.webhook?.url || ''}
          onChange={(e) =>
            handleDataChange('webhook', {
              ...node.data.webhook,
              url: e.target.value,
            })
          }
          placeholder="https://api.example.com/webhook"
          className="bg-white/5 border-white/10"
        />
      </div>

      <div>
        <Label>Method</Label>
        <Select
          value={node.data.webhook?.method || 'POST'}
          onValueChange={(value) =>
            handleDataChange('webhook', {
              ...node.data.webhook,
              method: value,
            })
          }
        >
          <SelectTrigger className="bg-white/5 border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Body Template (JSON)</Label>
        <Textarea
          value={node.data.webhook?.bodyTemplate || ''}
          onChange={(e) =>
            handleDataChange('webhook', {
              ...node.data.webhook,
              bodyTemplate: e.target.value,
            })
          }
          placeholder='{"data": "{{input}}"}'
          className="bg-white/5 border-white/10 font-mono text-sm"
          rows={4}
        />
      </div>
    </div>
  );

  const renderWaitConfig = () => (
    <div className="space-y-4">
      <div>
        <Label>Duration</Label>
        <Input
          type="number"
          value={node.data.wait?.duration || 1}
          onChange={(e) =>
            handleDataChange('wait', {
              ...node.data.wait,
              duration: parseInt(e.target.value),
            })
          }
          className="bg-white/5 border-white/10"
        />
      </div>

      <div>
        <Label>Unit</Label>
        <Select
          value={node.data.wait?.unit || 'seconds'}
          onValueChange={(value) =>
            handleDataChange('wait', {
              ...node.data.wait,
              unit: value,
            })
          }
        >
          <SelectTrigger className="bg-white/5 border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="seconds">Seconds</SelectItem>
            <SelectItem value="minutes">Minutes</SelectItem>
            <SelectItem value="hours">Hours</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="p-4 space-y-6">
      {/* Basic Info */}
      <Card className="p-4 backdrop-blur-xl bg-white/5 border-white/10 space-y-4">
        <div>
          <Label>Node Label</Label>
          <Input
            value={node.label}
            onChange={(e) => handleLabelChange(e.target.value)}
            className="bg-white/5 border-white/10"
          />
        </div>

        <div>
          <Label>Node Type</Label>
          <Input value={node.type} disabled className="bg-white/5 border-white/10" />
        </div>
      </Card>

      {/* Type-Specific Config */}
      <Card className="p-4 backdrop-blur-xl bg-white/5 border-white/10">
        <h4 className="font-semibold mb-4">Configuration</h4>
        {node.type === 'agent_invoke' && renderAgentInvokeConfig()}
        {node.type === 'condition' && renderConditionConfig()}
        {node.type === 'transform' && renderTransformConfig()}
        {node.type === 'trigger' && renderTriggerConfig()}
        {node.type === 'webhook' && renderWebhookConfig()}
        {node.type === 'wait' && renderWaitConfig()}
        {node.type === 'parallel' && (
          <p className="text-sm text-muted-foreground">
            Connect multiple nodes to this parallel node to execute them simultaneously.
          </p>
        )}
        {node.type === 'aggregate' && (
          <div>
            <Label>Aggregation Strategy</Label>
            <Select
              value={node.data.aggregate?.strategy || 'merge'}
              onValueChange={(value) =>
                handleDataChange('aggregate', {
                  strategy: value,
                })
              }
            >
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="merge">Merge Objects</SelectItem>
                <SelectItem value="concat">Concatenate Arrays</SelectItem>
                <SelectItem value="first">First Result</SelectItem>
                <SelectItem value="last">Last Result</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </Card>

      {/* Delete Button */}
      <Button
        variant="destructive"
        onClick={onDelete}
        className="w-full"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete Node
      </Button>
    </div>
  );
};

export default WorkflowNodeConfig;
