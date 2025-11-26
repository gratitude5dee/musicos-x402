import { useState } from "react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NetworkProvider } from "@/context/NetworkContext";
import { NetworkSwitcher } from "@/components/rights/NetworkSwitcher";
import { WalletStatusPanel } from "@/components/rights/WalletStatusPanel";
import { StoryWalletConnect } from "@/components/wallet/StoryWalletConnect";
import { AssetHeaderStrip } from "@/components/rights/AssetHeaderStrip";
import { IPLineagePanel } from "@/components/rights/IPLineagePanel";
import { LicensingAtAGlance } from "@/components/rights/LicensingAtAGlance";
import { NetworkStatusCard } from "@/components/rights/NetworkStatusCard";
import RightsJourney from "@/components/rights/RightsJourney";
import CollaboratorEcosystem from "@/components/rights/CollaboratorEcosystem";
import RevenueJourney from "@/components/rights/RevenueJourney";
import IPAgreementVisualizer from "@/components/rights/IPAgreementVisualizer";
import RightsTransferWizard from "@/components/rights/RightsTransferWizard";
import StoryPortal from "@/components/rights/StoryPortal";
import { Shield } from "lucide-react";
import { IPRegistrationWizard } from "@/components/rights/IPRegistrationWizard";
import { AgreementsTab } from "@/components/rights/AgreementsTab";
import { LicensingTab } from "@/components/rights/LicensingTab";
import { SettingsTab } from "@/components/rights/SettingsTab";
import { motion } from "framer-motion";

const RightsManagement = () => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isStoryPortalOpen, setIsStoryPortalOpen] = useState(false);
  const [isRegistrationWizardOpen, setIsRegistrationWizardOpen] = useState(false);

  return (
    <NetworkProvider>
      <DashboardLayout>
        {/* Top App Bar */}
        <div className="border-b border-white/10 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-medium text-[hsl(var(--text-primary))]">UniversalAI / <span className="text-[hsl(var(--text-secondary))]">IP Portal</span></h1>
            </div>
            <div className="flex items-center gap-3">
              <NetworkSwitcher />
              <StoryWalletConnect />
              <WalletStatusPanel />
              <Button
                className="bg-primary hover:bg-primary/80"
                onClick={() => setIsRegistrationWizardOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Asset
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="glass-card mb-6 w-fit">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="agreements">Agreements</TabsTrigger>
              <TabsTrigger value="licensing">Licensing</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AssetHeaderStrip />
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                >
                  <IPLineagePanel />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <CollaboratorEcosystem />
                </motion.div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div
                  className="lg:col-span-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <div className="glass-card border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-[hsl(var(--text-primary))] flex items-center gap-2 mb-4">
                      <Shield className="w-5 h-5 text-[hsl(var(--accent-purple))]" />
                      IP Rights Timeline
                    </h3>
                    <RightsJourney />
                  </div>
                </motion.div>
                <NetworkStatusCard />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LicensingAtAGlance />
                <RevenueJourney />
              </div>

              <IPAgreementVisualizer />
            </TabsContent>

            <TabsContent value="agreements">
              <AgreementsTab />
            </TabsContent>

            <TabsContent value="licensing">
              <LicensingTab />
            </TabsContent>

            <TabsContent value="analytics">
              <div className="glass-card border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4 text-[hsl(var(--text-primary))]">Analytics & Insights</h2>
                <p className="text-[hsl(var(--text-secondary))]">Comprehensive analytics dashboard coming soon...</p>
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <SettingsTab />
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>

      {isStoryPortalOpen && <StoryPortal isOpen={isStoryPortalOpen} onClose={() => setIsStoryPortalOpen(false)} />}
      <IPRegistrationWizard isOpen={isRegistrationWizardOpen} onClose={() => setIsRegistrationWizardOpen(false)} />
    </NetworkProvider>
  );
};

export default RightsManagement;
