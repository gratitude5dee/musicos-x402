import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useActiveAccount, useActiveWallet } from 'thirdweb/react';
import { Send, Bot, User, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { TransactionButton } from 'thirdweb/react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  action?: {
    type: 'sign_transaction' | 'sign_swap' | 'monitor_transaction';
    data: any;
  };
}

export const AIWalletChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingStep, setThinkingStep] = useState<string | null>(null);

  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setThinkingStep(null);

    try {
      const response = await fetch('/api/ai/chat', { // NOTE: This assumes /api/ai/chat is proxied or handled by Supabase functions
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          context: {
            from: account?.address,
            chain_ids: [8453, 84532], // Base mainnet and sepolia
            auto_execute_transactions: false,
          },
        }),
      });

      if (!response.ok) throw new Error('AI request failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let assistantContent = '';
      let pendingAction: Message['action'] | undefined;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;

          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);

            if (parsed.event === 'presence') {
              setThinkingStep(parsed.data || 'Thinking...');
            } else if (parsed.event === 'delta' && parsed.v) {
              assistantContent += parsed.v;
              // Update last assistant message
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return [...prev.slice(0, -1), { ...last, content: assistantContent }];
                }
                return [...prev, {
                  id: crypto.randomUUID(),
                  role: 'assistant',
                  content: assistantContent,
                  timestamp: new Date(),
                }];
              });
            } else if (parsed.event === 'action') {
              pendingAction = {
                type: parsed.type,
                data: parsed.data,
              };
            }
          } catch (e) {
            // Skip parse errors
          }
        }
      }

      // Add final message with action if present
      if (pendingAction) {
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant') {
            return [...prev.slice(0, -1), { ...last, action: pendingAction }];
          }
          return prev;
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setThinkingStep(null);
    }
  };

  const renderAction = (action: Message['action']) => {
    if (!action) return null;

    if (action.type === 'sign_transaction') {
      return (
        <Card className="mt-2 border-primary/50">
          <CardContent className="pt-4">
            <p className="text-sm font-medium mb-2">Transaction Ready</p>
            <TransactionButton
              transaction={() => action.data}
              onTransactionSent={(result) => {
                toast({
                  title: 'Transaction Sent',
                  description: `Hash: ${result.transactionHash.slice(0, 10)}...`,
                });
              }}
              onError={(error) => {
                toast({
                  title: 'Transaction Failed',
                  description: error.message,
                  variant: 'destructive',
                });
              }}
            >
              Execute Transaction
            </TransactionButton>
          </CardContent>
        </Card>
      );
    }

    if (action.type === 'sign_swap') {
      return (
        <Card className="mt-2 border-primary/50">
          <CardContent className="pt-4">
            <p className="text-sm font-medium mb-2">Swap Ready</p>
            <div className="text-xs text-muted-foreground mb-2">
              {action.data.from?.symbol} → {action.data.to?.symbol}
            </div>
            <Button onClick={() => executeSwap(action.data)}>
              Execute Swap
            </Button>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  const executeSwap = async (swapData: any) => {
    // Implement swap execution
    console.log('Executing swap:', swapData);
    toast({
        title: "Swap Executed",
        description: "Swap functionality simulated.",
    });
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Wallet Assistant
        </CardTitle>
        {account && (
          <p className="text-xs text-muted-foreground">
            Connected: {account.address.slice(0, 6)}...{account.address.slice(-4)}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Welcome to AI Wallet Assistant</p>
              <p className="text-sm mt-1">Ask me to check balances, swap tokens, or send transactions.</p>
              <div className="mt-4 space-y-1 text-xs">
                <p>Try: "What's my balance on Base?"</p>
                <p>Try: "Swap 0.01 ETH to USDC"</p>
                <p>Try: "Send 10 USDC to vitalik.eth"</p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 py-4 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.action && renderAction(message.action)}
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}

          {thinkingStep && (
            <div className="flex gap-3 py-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
              <div className="bg-muted/50 rounded-lg px-4 py-2">
                <p className="text-sm text-muted-foreground italic">{thinkingStep}</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </ScrollArea>

        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your wallet, balances, or transactions..."
              disabled={isLoading || !account}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim() || !account}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          {!account && (
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Connect your wallet to use AI assistant
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
