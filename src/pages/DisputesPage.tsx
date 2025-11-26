import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/dashboard-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle, CheckCircle, List } from 'lucide-react';
import { DisputeCenter } from '@/components/disputes/DisputeCenter';
import { RaiseDisputeWizard } from '@/components/disputes/RaiseDisputeWizard';
import { DisputeDetailView } from '@/components/disputes/DisputeDetailView';
import { useDisputes } from '@/hooks/useDisputes';
import { useAccount } from 'wagmi';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const DisputesPage = () => {
  const { address } = useAccount();
  const navigate = useNavigate();
  const { disputeId } = useParams();
  const { toast } = useToast();

  const {
    activeDisputes,
    selectedDispute,
    disputeTimeline,
    fetchDisputes,
    loadDispute,
    raiseDispute,
    cancelDispute,
    resolveDispute,
    isReady,
  } = useDisputes();

  const [activeTab, setActiveTab] = useState('all');
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    if (isReady) {
      fetchDisputes();
    }
  }, [isReady]);

  useEffect(() => {
    if (disputeId && isReady) {
      loadDispute(disputeId);
    }
  }, [disputeId, isReady]);

  const handleDisputeSelect = (id: string) => {
    navigate(`/disputes/${id}`);
  };

  const handleRaiseSuccess = (id: string) => {
    setShowWizard(false);
    toast({
      title: 'Dispute Raised',
      description: `Dispute ${id} has been submitted to the blockchain`,
    });
    fetchDisputes();
    navigate(`/disputes/${id}`);
  };

  const handleCancel = async () => {
    if (!selectedDispute) return;
    try {
      await cancelDispute(BigInt(selectedDispute.id));
      toast({
        title: 'Dispute Cancelled',
        description: 'The dispute has been cancelled',
      });
      navigate('/disputes');
      fetchDisputes();
    } catch (error) {
      toast({
        title: 'Cancel Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleResolve = async () => {
    if (!selectedDispute) return;
    try {
      await resolveDispute(BigInt(selectedDispute.id));
      toast({
        title: 'Dispute Resolved',
        description: 'The dispute has been resolved on-chain',
      });
      fetchDisputes();
    } catch (error) {
      toast({
        title: 'Resolve Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  // Wizard view
  if (showWizard) {
    return (
      <DashboardLayout>
        <div className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              <h1 className="text-xl font-medium text-text-primary">
                Raise New Dispute
              </h1>
            </div>
          </div>
        </div>
        <div className="p-6">
          <RaiseDisputeWizard
            onSuccess={handleRaiseSuccess}
            onCancel={() => {
              setShowWizard(false);
              navigate('/disputes');
            }}
          />
        </div>
      </DashboardLayout>
    );
  }

  // Detail view
  if (disputeId && selectedDispute) {
    const userRole = selectedDispute.initiator === address ? 'initiator' 
      : selectedDispute.targetIpId === address ? 'target' 
      : 'observer';

    return (
      <DashboardLayout>
        <div className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              <h1 className="text-xl font-medium text-text-primary">
                Dispute Details
              </h1>
            </div>
          </div>
        </div>
        <div className="p-6">
          <DisputeDetailView
            dispute={selectedDispute}
            timeline={disputeTimeline}
            userRole={userRole}
            onCancel={userRole === 'initiator' ? handleCancel : undefined}
            onResolve={handleResolve}
          />
        </div>
      </DashboardLayout>
    );
  }

  // List view
  return (
    <DashboardLayout>
      <div className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-accent-blue" />
            <h1 className="text-xl font-medium text-text-primary">
              Dispute Management
            </h1>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="glass-card mb-6 w-fit">
            <TabsTrigger value="all" className="gap-2">
              <List className="w-4 h-4" />
              All Disputes
            </TabsTrigger>
            <TabsTrigger value="initiated" className="gap-2">
              <AlertTriangle className="w-4 h-4" />
              Initiated
            </TabsTrigger>
            <TabsTrigger value="received" className="gap-2">
              <Shield className="w-4 h-4" />
              Received
            </TabsTrigger>
            <TabsTrigger value="resolved" className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Resolved
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <DisputeCenter
                userAddress={address as any}
                filter="all"
                disputes={activeDisputes}
                onDisputeSelect={handleDisputeSelect}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="initiated">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <DisputeCenter
                userAddress={address as any}
                filter="initiated"
                disputes={activeDisputes}
                onDisputeSelect={handleDisputeSelect}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="received">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <DisputeCenter
                userAddress={address as any}
                filter="received"
                disputes={activeDisputes}
                onDisputeSelect={handleDisputeSelect}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="resolved">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <DisputeCenter
                userAddress={address as any}
                filter="resolved"
                disputes={activeDisputes}
                onDisputeSelect={handleDisputeSelect}
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DisputesPage;
