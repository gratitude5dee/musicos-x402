
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { WalletProvider } from "@/context/WalletContext";
import { OnboardingProvider } from "@/context/OnboardingContext";
import { AgentProvider } from "@/context/AgentContext";
import { SolanaProvider } from "@/components/providers/SolanaProvider";
import { EnhancedAuthProvider } from "@/context/EnhancedAuthContext";
import { ProtectedRoute } from "@/components/ui/ProtectedRoute";
import { EVMWalletProvider } from "@/context/EVMWalletContext";
import { StoryClientProvider } from "@/context/StoryClientContext";
import { IPKitProvider } from "@/providers/IPKitProvider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import ArtistHome from "./pages/ArtistHome";
import Gallery from "./pages/Gallery";
import AssetLibrary from "./pages/AssetLibrary";
import TreasureVault from "./pages/TreasureVault";
import Analytics from "./pages/Analytics";
import RightsManagement from "./pages/RightsManagement";
import RoyaltiesPage from "./pages/RoyaltiesPage";
import DisputesPage from "./pages/DisputesPage";
import IPVaultPage from "./pages/IPVaultPage";
import ThreadOfLife from "./pages/ThreadOfLife";
import Bridge from "./pages/Bridge";
import AgentMarketplace from "./pages/AgentMarketplace";
import CreateAgent from "./pages/CreateAgent";
import MarketplaceLaunch from "./pages/MarketplaceLaunch";
import AgentDetail from "./pages/marketplace/AgentDetail";
import Observability from "./pages/Observability";
import EnhancedObservability from "./pages/EnhancedObservability";
import Profile from "./pages/Profile";
import Projects from "./pages/Projects";
import SpellcraftContracts from "./pages/SpellcraftContracts";
import Touring from "./pages/Touring";
import Integrations from "./pages/Integrations";
import AgentsIntegrations from "./pages/AgentsIntegrations";
import MarketingDistribution from "./pages/MarketingDistribution";
import Landing from "./pages/Landing";
import FYILanding from "./pages/FYILanding";

// Event Toolkit Pages
import Dashboard from "./pages/event-toolkit/Dashboard";
import Gigs from "./pages/event-toolkit/Gigs";
import CreateGig from "./pages/event-toolkit/CreateGig";
import Invoices from "./pages/event-toolkit/Invoices";
import CreateInvoice from "./pages/event-toolkit/CreateInvoice";
import Contacts from "./pages/event-toolkit/Contacts";
import CreateContact from "./pages/event-toolkit/CreateContact";
import ContentManager from "./pages/event-toolkit/ContentManager";
import QrUploadManager from "./pages/event-toolkit/QrUploadManager";
import CreateQrCampaign from "./pages/event-toolkit/CreateQrCampaign";

// Agent Collection Pages
import BookingAgent from "./pages/agents/BookingAgent";
import BookyView from "./pages/agents/BookyView";
import ContractsView from "./pages/agents/ContractsView";
import PaymentsView from "./pages/agents/PaymentsView";
import InvoiceAgent from "./pages/agents/InvoiceAgent";
import SocialMediaAgent from "./pages/agents/SocialMediaAgent";
import ContractAgent from "./pages/agents/ContractAgent";
import AgentScanPage from "./pages/agents/scan/ScanPage";
import { AgentChat } from "./components/agents/AgentChat";

// Distribution Pages
import DistributionOverview from "./pages/distribution/DistributionOverview";
import SocialMediaWzrd from "./pages/distribution/SocialMediaWzrd";
import MediaChannels from "./pages/distribution/MediaChannels";
import IndependentChannels from "./pages/distribution/IndependentChannels";
import OnChainDistribution from "./pages/distribution/OnChainDistribution";
import SyncLicensing from "./pages/distribution/SyncLicensing";

// WZRD Pages
import WzrdStudio from "./pages/wzrd/WzrdStudio";
import WzrdLibrary from "./pages/wzrd/WzrdLibrary";
import WzrdResearch from "./pages/wzrd/WzrdResearch";
import WzrdPodcasts from "./pages/wzrd/WzrdPodcasts";
import WzrdInfiniteLibrary from "./pages/wzrd/WzrdInfiniteLibrary";
import WzrdCompanions from "./pages/wzrd/WzrdCompanions";

import NotFound from "./pages/NotFound";

// Composer Pages
import ComposerHome from "./pages/composer/ComposerHome";
import ComposerChat from "./pages/composer/ComposerChat";
import ComposerAgents from "./pages/composer/ComposerAgents";
import ComposerScan from "./pages/composer/ComposerScan";
import ComposerFeed from "./pages/composer/ComposerFeed";
import ComposerWorkflows from "./pages/composer/ComposerWorkflows";
import ComposerPlayground from "./pages/composer/ComposerPlayground";
import ComposerAnalytics from "./pages/composer/ComposerAnalytics";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SolanaProvider>
            <EVMWalletProvider>
              <StoryClientProvider chain="testnet">
                <IPKitProvider chain="testnet">
                  <EnhancedAuthProvider>
                    <WalletProvider>
                      <OnboardingProvider>
                        <AgentProvider>
                          <TooltipProvider>
                            <Toaster />
                            <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<FYILanding />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/sign-in" element={<Index />} />
                      <Route path="/landing" element={<Landing />} />

                      {/* Protected routes */}
                      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                      <Route path="/home" element={<ProtectedRoute><ArtistHome /></ProtectedRoute>} />
                      <Route path="/gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
                      <Route path="/library" element={<ProtectedRoute><AssetLibrary /></ProtectedRoute>} />
                      <Route path="/treasury" element={<ProtectedRoute><TreasureVault /></ProtectedRoute>} />
                      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                      <Route path="/rights" element={<ProtectedRoute><RightsManagement /></ProtectedRoute>} />
                      <Route path="/royalties" element={<ProtectedRoute><RoyaltiesPage /></ProtectedRoute>} />
                      <Route path="/disputes" element={<ProtectedRoute><DisputesPage /></ProtectedRoute>} />
                      <Route path="/vault" element={<ProtectedRoute><IPVaultPage /></ProtectedRoute>} />
                      <Route path="/disputes/raise" element={<ProtectedRoute><DisputesPage /></ProtectedRoute>} />
                      <Route path="/disputes/:disputeId" element={<ProtectedRoute><DisputesPage /></ProtectedRoute>} />
                      <Route path="/thread-of-life" element={<ProtectedRoute><ThreadOfLife /></ProtectedRoute>} />
                      <Route path="/bridge" element={<ProtectedRoute><Bridge /></ProtectedRoute>} />
                      <Route path="/agent-marketplace" element={<ProtectedRoute><AgentMarketplace /></ProtectedRoute>} />
                      <Route path="/marketplace/agents/:agentId" element={<ProtectedRoute><AgentDetail /></ProtectedRoute>} />
                      <Route path="/create-agent" element={<ProtectedRoute><CreateAgent /></ProtectedRoute>} />
                      <Route path="/agent-chat" element={<ProtectedRoute><AgentChat /></ProtectedRoute>} />
                      <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
                      <Route path="/agents-integrations" element={<ProtectedRoute><AgentsIntegrations /></ProtectedRoute>} />
                      <Route path="/marketing-distribution" element={<ProtectedRoute><MarketingDistribution /></ProtectedRoute>} />
                      <Route path="/marketplace-launch" element={<ProtectedRoute><MarketplaceLaunch /></ProtectedRoute>} />
                      <Route path="/observability" element={<ProtectedRoute><Observability /></ProtectedRoute>} />
                      <Route path="/observatory" element={<ProtectedRoute><EnhancedObservability /></ProtectedRoute>} />
                      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                      <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
                      <Route path="/spellcraft-contracts" element={<ProtectedRoute><SpellcraftContracts /></ProtectedRoute>} />
                      <Route path="/touring" element={<ProtectedRoute><Touring /></ProtectedRoute>} />

                      {/* Event Toolkit Routes - Protected */}
                      <Route path="/event-toolkit/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                      <Route path="/event-toolkit/gigs" element={<ProtectedRoute><Gigs /></ProtectedRoute>} />
                      <Route path="/event-toolkit/gigs/create" element={<ProtectedRoute><CreateGig /></ProtectedRoute>} />
                      <Route path="/event-toolkit/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
                      <Route path="/event-toolkit/invoices/create" element={<ProtectedRoute><CreateInvoice /></ProtectedRoute>} />
                      <Route path="/event-toolkit/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
                      <Route path="/event-toolkit/contacts/create" element={<ProtectedRoute><CreateContact /></ProtectedRoute>} />
                      <Route path="/event-toolkit/content" element={<ProtectedRoute><ContentManager /></ProtectedRoute>} />
                      <Route path="/event-toolkit/qr-upload" element={<ProtectedRoute><QrUploadManager /></ProtectedRoute>} />
                      <Route path="/event-toolkit/qr-upload/create" element={<ProtectedRoute><CreateQrCampaign /></ProtectedRoute>} />

                      {/* Agent Collection Routes - Protected */}
                      <Route path="/collection/booking-agent" element={<Navigate to="/collection/booking-agent/gigs" replace />} />
                      <Route path="/collection/booking-agent/gigs" element={<ProtectedRoute><BookingAgent /></ProtectedRoute>} />
                      <Route path="/collection/booking-agent/booky" element={<ProtectedRoute><BookyView /></ProtectedRoute>} />
                      <Route path="/collection/booking-agent/contracts" element={<ProtectedRoute><ContractsView /></ProtectedRoute>} />
                      <Route path="/collection/booking-agent/payments" element={<ProtectedRoute><PaymentsView /></ProtectedRoute>} />
                      <Route path="/collection/invoice-agent" element={<ProtectedRoute><InvoiceAgent /></ProtectedRoute>} />
                      <Route path="/collection/social-media" element={<ProtectedRoute><SocialMediaAgent /></ProtectedRoute>} />
                      <Route path="/collection/contract-agent" element={<ProtectedRoute><ContractAgent /></ProtectedRoute>} />
                      <Route path="/agents/scan" element={<ProtectedRoute><AgentScanPage /></ProtectedRoute>} />

                      {/* Distribution Routes - Protected */}
                      <Route path="/distribution" element={<ProtectedRoute><DistributionOverview /></ProtectedRoute>} />
                      <Route path="/distribution/social-media" element={<ProtectedRoute><SocialMediaWzrd /></ProtectedRoute>} />
                      <Route path="/distribution/media-channels" element={<ProtectedRoute><MediaChannels /></ProtectedRoute>} />
                      <Route path="/distribution/independent" element={<ProtectedRoute><IndependentChannels /></ProtectedRoute>} />
                      <Route path="/distribution/on-chain" element={<ProtectedRoute><OnChainDistribution /></ProtectedRoute>} />
                      <Route path="/distribution/sync-licensing" element={<ProtectedRoute><SyncLicensing /></ProtectedRoute>} />

                      {/* WZRD Routes - Protected */}
                      <Route path="/wzrd/studio" element={<ProtectedRoute><WzrdStudio /></ProtectedRoute>} />
                      <Route path="/wzrd/library" element={<ProtectedRoute><WzrdLibrary /></ProtectedRoute>} />
                      <Route path="/wzrd/research" element={<ProtectedRoute><WzrdResearch /></ProtectedRoute>} />
                      <Route path="/wzrd/podcasts" element={<ProtectedRoute><WzrdPodcasts /></ProtectedRoute>} />
                      <Route path="/wzrd/infinite-library" element={<ProtectedRoute><WzrdInfiniteLibrary /></ProtectedRoute>} />
                      <Route path="/wzrd/companions" element={<ProtectedRoute><WzrdCompanions /></ProtectedRoute>} />

                      {/* Composer Routes - Protected */}
                      <Route path="/composer" element={<ProtectedRoute><ComposerHome /></ProtectedRoute>} />
                      <Route path="/composer/chat" element={<ProtectedRoute><ComposerChat /></ProtectedRoute>} />
                      <Route path="/composer/agents" element={<ProtectedRoute><ComposerAgents /></ProtectedRoute>} />
                      <Route path="/composer/workflows" element={<ProtectedRoute><ComposerWorkflows /></ProtectedRoute>} />
                      <Route path="/composer/playground" element={<ProtectedRoute><ComposerPlayground /></ProtectedRoute>} />
                      <Route path="/composer/analytics" element={<ProtectedRoute><ComposerAnalytics /></ProtectedRoute>} />
                      <Route path="/composer/scan" element={<ProtectedRoute><ComposerScan /></ProtectedRoute>} />
                      <Route path="/composer/feed" element={<ProtectedRoute><ComposerFeed /></ProtectedRoute>} />

                      <Route path="*" element={<NotFound />} />
                      </Routes>
                            </TooltipProvider>
                          </AgentProvider>
                        </OnboardingProvider>
                      </WalletProvider>
                    </EnhancedAuthProvider>
                  </IPKitProvider>
                </StoryClientProvider>
              </EVMWalletProvider>
          </SolanaProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
