
import { 
  NavHomeIcon, NavDashboardIcon, NavBrainIcon, NavGalleryIcon, NavWalletIcon, 
  NavAgentIcon, NavAnalyticsIcon, NavSettingsIcon, NavMarketplaceIcon
} from "@/components/ui/icons";

// For the remaining icons we'll continue using lucide-react for now, but gradually replace them
import {
  Palette, BookOpen, Headphones, Infinity, UserRound, Users, Shield, Globe,
  Database, ShoppingCart, Eye, Building, Building2, Trees, ArrowRightLeft, Share2, Link, Tv,
  User, Music, Landmark, TrendingUp, Droplets, CreditCard, Calendar, UserCircle,
  Briefcase, LayoutDashboard, FileText, QrCode, UserPlus, Upload, FilePlus, FilePieChart,
  Home, Banknote, Zap, Receipt, BarChart3, MessageSquare, Radar, Sparkles, ScanLine, Rss, 
  Camera, Package, Truck, Search
} from "lucide-react";

export const navItems = [{
  name: "WZRD.tech",
  path: "/home",
  icon: NavBrainIcon,
  hasSubmenu: true,
  submenuItems: [
    {
      name: "WZRD.Studio",
      path: "https://studio.universal-ai.xyz",
      icon: Palette
    },
    {
      name: "KNWLG WRKR",
      path: "https://work.universal-ai.xyz",
      icon: BookOpen
    },
    {
      name: "IndustryResearch",
      path: "/wzrd/research",
      icon: NavBrainIcon
    },
    {
      name: "Generative Podcasts",
      path: "/wzrd/podcasts",
      icon: Headphones
    },
    {
      name: "Infinite Canvas",
      path: "/wzrd/infinite-library",
      icon: Infinity
    },
    {
      name: "Creative Assistants",
      path: "/wzrd/companions",
      icon: UserRound
    }
  ]
}, {
  name: "Content Library",
  path: "#",
  icon: Users,
  hasSubmenu: true,
  submenuItems: [
    {
      name: "Asset Library",
      path: "/gallery",
      icon: NavGalleryIcon
    },
    {
      name: "Content Manager",
      path: "/event-toolkit/content",
      icon: Music
    },
    {
      name: "IP Portal",
      path: "/rights",
      icon: Shield
    },
    {
      name: "Thread of Life",
      path: "/thread-of-life",
      icon: Trees
    },
    {
      name: "Bridge",
      path: "/bridge",
      icon: ArrowRightLeft
    },
    {
      name: "Marketplace Launch",
      path: "/marketplace-launch",
      icon: NavMarketplaceIcon
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: NavAnalyticsIcon
    },
  ]
}, {
  name: "Marketing & Distribution",
  path: "/marketing-distribution",
  icon: Share2,
  hasSubmenu: true,
  submenuItems: [
    {
      name: "Social Media WZRD",
      path: "/distribution/social-media",
      icon: Globe
    },
    {
      name: "On-Chain Distribution",
      path: "/distribution/on-chain",
      icon: Link
    },
    {
      name: "Media Channels",
      path: "/distribution/media-channels",
      icon: Tv
    },
    {
      name: "Independent Channels",
      path: "/distribution/independent",
      icon: User
    },
    {
      name: "Sync Licensing",
      path: "https://sync.universal-ai.xyz/",
      icon: Music
    }
  ]
}, {
  name: "Touring",
  path: "/touring",
  icon: Calendar,
  hasSubmenu: true,
  submenuItems: [
    { name: "Dashboard", path: "/event-toolkit/dashboard", icon: LayoutDashboard },
    { name: "Booky", path: "https://booky.ai", icon: Calendar },
    { name: "Gigs", path: "/event-toolkit/gigs", icon: Calendar },
    { name: "Invoices", path: "/event-toolkit/invoices", icon: FileText },
    { name: "Contacts", path: "/event-toolkit/contacts", icon: Users },
    { name: "QR Upload", path: "/event-toolkit/qr-upload", icon: QrCode },
  ]
}, {
  name: "Merchandise",
  path: "#",
  icon: ShoppingCart,
  hasSubmenu: true,
  submenuItems: [
    {
      name: "Design Studio",
      path: "/merchandise/design-studio",
      icon: Camera
    },
    {
      name: "Audience Data",
      path: "https://dub.sh/hyperelational",
      icon: Database
    },
    {
      name: "Sourcing",
      path: "/merchandise/sourcing",
      icon: Package
    },
    {
      name: "Order Fulfillment",
      path: "/merchandise/fulfillment",
      icon: Truck
    },
    {
      name: "Agentic SEO",
      path: "/merchandise/agentic-seo",
      icon: Search
    }
  ]
}, {
  name: "Agents",
  path: "/agents-integrations",
  icon: NavAgentIcon,
  hasSubmenu: true,
  submenuItems: [
    {
      name: "Create New Agent",
      path: "/create-agent",
      icon: NavAgentIcon
    },
    {
      name: "Agent Chat",
      path: "/agent-chat",
      icon: MessageSquare
    },
    {
      name: "My Agents",
      path: "#",
      icon: Database,
      hasSubmenu: true,
      submenuItems: [
        {
          name: "Booking Agent",
          path: "/collection/booking-agent",
          icon: Calendar
        },
        {
          name: "Invoice Agent",
          path: "/collection/invoice-agent",
          icon: CreditCard
        },
        {
          name: "Social Media Agent",
          path: "/collection/social-media",
          icon: Globe
        },
        {
          name: "Contract Agent",
          path: "/collection/contract-agent",
          icon: Shield
        }
      ]
    },
    {
      name: "Composer",
      path: "/composer",
      icon: Sparkles,
      hasSubmenu: true,
      submenuItems: [
        {
          name: "Home",
          path: "/composer",
          icon: Home
        },
        {
          name: "Chat",
          path: "/composer/chat",
          icon: MessageSquare
        },
        {
          name: "Agents",
          path: "/composer/agents",
          icon: Users
        },
        {
          name: "Scan",
          path: "/composer/scan",
          icon: ScanLine,
          isNew: true
        },
        {
          name: "Feed",
          path: "/composer/feed",
          icon: Rss
        }
      ]
    },
    {
      name: "Scan Agents",
      path: "/agents/scan",
      icon: Radar,
      isNew: true,
    },
    {
      name: "Integrations",
      path: "/integrations",
      icon: Zap
    },
    {
      name: "Marketplace",
      path: "/agent-marketplace",
      icon: ShoppingCart
    },
    {
      name: "Observability",
      path: "/observability",
      icon: Eye
    }
  ]
}, {
  name: "Finances",
  path: "#",
  icon: NavWalletIcon,
  hasSubmenu: true,
  submenuItems: [
    {
      name: "Royalty Statements",
      path: "/treasury?tab=statements",
      icon: Receipt
    },
    {
      name: "Forecasting",
      path: "/treasury?tab=forecasting",
      icon: TrendingUp
    },
    {
      name: "Split Sheets",
      path: "/treasury?tab=splits",
      icon: FilePieChart
    },
    {
      name: "Reports",
      path: "/treasury?tab=reports",
      icon: BarChart3
    },
    {
      name: "Multi-Chain Revenue",
      path: "/treasury?tab=multichain",
      icon: Link
    },
    {
      name: "RWA WZRD",
      path: "/treasury?tab=rwa-wzrd",
      icon: Building2
    },
    {
      name: "WZRD.trade",
      path: "#",
      icon: TrendingUp,
      isComingSoon: true
    },
    {
      name: "Agent Banking",
      path: "/treasury?tab=banking",
      icon: Landmark
    }
  ]
}, {
  name: "Profile",
  path: "/profile",
  icon: UserCircle
}];

export type NavItem = typeof navItems[0];
export type SubMenuItem = NavItem['submenuItems'][0];
export type NestedSubMenuItem = {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
};
