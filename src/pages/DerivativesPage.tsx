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
import DashboardLayout from '@/layouts/dashboard-layout';
import { motion } from 'framer-motion';

export default function DerivativesPage() {
  const { derivatives, stats, activities } = useDerivatives();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedDerivative, setSelectedDerivative] = useState<DerivativeWork | null>(null);

  const pendingDerivatives = derivatives.filter((d) => d.status === 'pending');
  const activeDerivatives = derivatives.filter((d) => d.status === 'active');

  return (
    <DashboardLayout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3 text-[hsl(var(--text-primary))]">
                  <GitBranch className="h-8 w-8" />
                  Derivative Licensing
                </h1>
                <p className="text-[hsl(var(--text-secondary))] mt-1">
                  Create, manage, and track derivative works with flexible licensing terms
                </p>
              </div>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Derivative
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DerivativeStats stats={stats} />
          </motion.div>

          {/* Content Tabs */}
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="glass-card mb-6 w-fit">
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <DerivativeGrid
                  derivatives={derivatives}
                  onSelect={setSelectedDerivative}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <DerivativeGrid
                  derivatives={pendingDerivatives}
                  onSelect={setSelectedDerivative}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="glass-card border border-border/50 flex items-center justify-between p-4 rounded-lg"
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
                        <p className="font-medium text-[hsl(var(--text-primary))]">{activity.derivativeName}</p>
                        <p className="text-sm text-[hsl(var(--text-secondary))] capitalize">
                          {activity.type.replace('_', ' ')}
                          {activity.amount && ` - ${activity.amount}`}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-[hsl(var(--text-secondary))]">
                      {activity.timestamp.toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>

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
    </DashboardLayout>
  );
}
