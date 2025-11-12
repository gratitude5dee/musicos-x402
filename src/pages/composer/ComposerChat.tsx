import ComposerLayout from "@/layouts/composer-layout";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { AgentChat } from "@/components/agents/AgentChat";

export default function ComposerChat() {
  return (
    <ComposerLayout>
      <div className="max-w-6xl mx-auto">
        <AgentChat />
      </div>
    </ComposerLayout>
  );
}
