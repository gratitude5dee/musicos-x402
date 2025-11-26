import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, GitBranch, Clock, Activity } from 'lucide-react';
import { DerivativeStats } from '@/components/derivatives/DerivativeStats';
import { DerivativeGrid } from '@/components/derivatives/DerivativeGrid';
import { CreateDerivativeDialog } from '@/components/derivatives/CreateDerivativeDialog';
import { DerivativeDetailModal } from '@/components/derivatives/DerivativeDetailModal';
import { useDerivatives } from '@/hooks/useDerivatives';
import type { DerivativeWork } from '@/types/derivative';

export default function DerivativesPage() {
  const { derivatives, stats, activities } = useDerivatives();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedDerivative, setSelectedDerivative] = useState<DerivativeWork | null>(null);

  const pendingDerivatives = derivatives.filter((d) => d.status === 'pending');
  const activeDerivatives = derivatives.filter((d) => d.status === 'active');

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <GitBranch className="h-8 w-8" />
            Derivative Licensing
          </h1>
          <p className="text-muted-foreground mt-1">
            Create, manage, and track derivative works with flexible licensing terms
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Derivative
        </Button>
      </div>

      {/* Stats */}
      <DerivativeStats stats={stats} />

      {/* Content Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            All Derivatives
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Approval ({pendingDerivatives.length})
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Recent Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <DerivativeGrid
            derivatives={derivatives}
            onSelect={setSelectedDerivative}
          />
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <DerivativeGrid
            derivatives={pendingDerivatives}
            onSelect={setSelectedDerivative}
          />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="space-y-2">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 bg-card rounded-lg border"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'created' ? 'bg-blue-500/10' :
                    activity.type === 'approved' ? 'bg-green-500/10' :
                    activity.type === 'rejected' ? 'bg-red-500/10' :
                    'bg-purple-500/10'
                  }`}>
                    {activity.type === 'created' && <Plus className="h-4 w-4 text-blue-500" />}
                    {activity.type === 'approved' && <GitBranch className="h-4 w-4 text-green-500" />}
                    {activity.type === 'rejected' && <Clock className="h-4 w-4 text-red-500" />}
                    {activity.type === 'royalty_paid' && <Activity className="h-4 w-4 text-purple-500" />}
                  </div>
                  <div>
                    <p className="font-medium">{activity.derivativeName}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {activity.type.replace('_', ' ')}
                      {activity.amount && ` - ${activity.amount}`}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">
                  {activity.timestamp.toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateDerivativeDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
      <DerivativeDetailModal
        derivative={selectedDerivative}
        open={!!selectedDerivative}
        onOpenChange={(open) => !open && setSelectedDerivative(null)}
      />
    </div>
  );
}
