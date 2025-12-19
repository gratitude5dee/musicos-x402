import { AIWalletChat } from "@/components/wallet/AIWalletChat";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function WalletDashboardChat() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
           <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>
      <AIWalletChat />
    </div>
  );
}
