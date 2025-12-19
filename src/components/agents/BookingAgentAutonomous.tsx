import React, { useState, useEffect } from 'react';
import { Bot, DollarSign, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface AgentAction {
  id: string;
  type: 'search' | 'negotiate' | 'payment' | 'confirm';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  description: string;
  result?: any;
  transactionHash?: string;
}

interface BookingAgentAutonomousProps {
  agentId: string;
  objective: string;
  budget: number;
  onComplete: (bookingId: string) => void;
}

export const BookingAgentAutonomous: React.FC<BookingAgentAutonomousProps> = ({
  agentId,
  objective,
  budget,
  onComplete,
}) => {
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [currentAction, setCurrentAction] = useState<number>(0);
  const [agentWallet, setAgentWallet] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    initializeAgent();
  }, [agentId]);

  const initializeAgent = async () => {
    try {
      const response = await fetch('/api/agents/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          role: 'booking_agent',
        }),
      });

      const data = await response.json();
      setAgentWallet(data.smartWalletAddress);

      // Fetch balance
      const balanceResponse = await fetch(`/api/agents/balance?address=${data.smartWalletAddress}`);
      const balanceData = await balanceResponse.json();
      setWalletBalance(parseFloat(balanceData.balance || '0'));
    } catch (error) {
      console.error('Failed to initialize agent:', error);
    }
  };

  const runAgent = async () => {
    setIsRunning(true);

    const workflow: AgentAction[] = [
      { id: '1', type: 'search', status: 'pending', description: 'Searching for venues matching criteria...' },
      { id: '2', type: 'negotiate', status: 'pending', description: 'Analyzing and negotiating best options...' },
      { id: '3', type: 'payment', status: 'pending', description: 'Processing deposit payment via x402...' },
      { id: '4', type: 'confirm', status: 'pending', description: 'Confirming booking and generating contract...' },
    ];

    setActions(workflow);

    for (let i = 0; i < workflow.length; i++) {
      setCurrentAction(i);
      setActions(prev => prev.map((a, idx) =>
        idx === i ? { ...a, status: 'processing' } : a
      ));

      try {
        const result = await executeAgentAction(workflow[i].type);

        setActions(prev => prev.map((a, idx) =>
          idx === i ? { ...a, status: 'completed', result } : a
        ));

        // For payment actions, show transaction details
        if (workflow[i].type === 'payment' && result.transactionHash) {
          toast({
            title: 'Payment Processed',
            description: `Transaction: ${result.transactionHash.slice(0, 10)}...`,
          });
        }
      } catch (error: any) {
        setActions(prev => prev.map((a, idx) =>
          idx === i ? { ...a, status: 'failed', result: error.message } : a
        ));
        toast({
          title: 'Agent Action Failed',
          description: error.message,
          variant: 'destructive',
        });
        setIsRunning(false);
        return;
      }

      // Delay between actions for UX
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    setIsRunning(false);
    onComplete('booking-' + Date.now());
  };

  const executeAgentAction = async (actionType: string) => {
    const response = await fetch('/api/agents/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId,
        agentWallet,
        actionType,
        objective,
        budget,
      }),
    });

    if (!response.ok) {
      throw new Error('Agent action failed');
    }

    return response.json();
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Autonomous Booking Agent
          </span>
          <Badge variant={isRunning ? 'default' : 'secondary'}>
            {isRunning ? 'Running' : 'Idle'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Agent Wallet Info */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <p className="text-sm font-medium">Agent Wallet</p>
            <p className="text-xs text-muted-foreground font-mono">
              {agentWallet ? `${agentWallet.slice(0, 10)}...${agentWallet.slice(-8)}` : 'Initializing...'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              {walletBalance.toFixed(2)} USDC
            </p>
            <p className="text-xs text-muted-foreground">Budget: ${budget}</p>
          </div>
        </div>

        {/* Objective */}
        <div className="p-4 border rounded-lg">
          <p className="text-sm font-medium mb-1">Objective</p>
          <p className="text-sm text-muted-foreground">{objective}</p>
        </div>

        {/* Action Progress */}
        {actions.length > 0 && (
          <div className="space-y-3">
            <Progress value={(currentAction / actions.length) * 100} />

            {actions.map((action, idx) => (
              <div
                key={action.id}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  action.status === 'processing' ? 'bg-primary/5 border border-primary/20' :
                  action.status === 'completed' ? 'bg-green-50 dark:bg-green-900/10' :
                  action.status === 'failed' ? 'bg-red-50 dark:bg-red-900/10' :
                  'bg-muted/50'
                }`}
              >
                <div className="mt-0.5">
                  {action.status === 'processing' && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  )}
                  {action.status === 'completed' && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  {action.status === 'failed' && (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  {action.status === 'pending' && (
                    <div className="h-4 w-4 rounded-full border-2" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium capitalize">{action.type}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                  {action.result && action.type === 'payment' && (
                    <p className="text-xs font-mono mt-1 text-green-600">
                      TX: {action.result.transactionHash?.slice(0, 20)}...
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Start Button */}
        {!isRunning && actions.length === 0 && (
          <Button onClick={runAgent} className="w-full" size="lg">
            <Bot className="mr-2 h-4 w-4" />
            Start Autonomous Booking
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
