import DashboardLayout from "@/layouts/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { ScanDashboard } from "./components/ScanDashboard";

const isEnabled = import.meta.env.VITE_ENABLE_AGENT_SCAN !== "false";

const AgentScanPage = () => {
  if (!isEnabled) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-16">
          <Card className="bg-card/70 border border-dashed border-white/10 shadow-xl">
            <CardContent className="py-12 flex flex-col items-center justify-center gap-4 text-center">
              <ShieldAlert className="h-8 w-8 text-muted-foreground" />
              <div>
                <h2 className="text-xl font-semibold">Agent scan is disabled</h2>
                <p className="text-sm text-muted-foreground max-w-md">
                  Enable the scan feature by setting <code className="bg-muted/40 px-1 py-0.5 rounded">VITE_ENABLE_AGENT_SCAN=true</code> in your environment configuration.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return <ScanDashboard />;
};

export default AgentScanPage;
