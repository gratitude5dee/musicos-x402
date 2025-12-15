import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ConnectButton, useActiveAccount, useActiveWalletChain, TransactionButton } from "thirdweb/react";
import { client } from "@/providers/ThirdwebProvider";
import { prepareTransaction, defineChain } from "thirdweb";
import { motion, AnimatePresence } from "framer-motion";
import { stream } from "fetch-event-stream";
import { 
  Wallet, 
  ArrowLeft,
  Send,
  Bot,
  User,
  AlertCircle,
  Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: ActionEvent[];
  images?: ImageEvent[];
  status?: 'sending' | 'sent' | 'error';
}

interface ActionEvent {
  type: 'sign_transaction' | 'sign_swap' | 'monitor_transaction';
  data: any;
  request_id: string;
  session_id: string;
}

interface ImageEvent {
  url: string;
  width: number;
  height: number;
}

export default function WalletDashboardChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [thinkingMessage, setThinkingMessage] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasAutoSentRef = useRef(false);

  const account = useActiveAccount();
  const activeChain = useActiveWalletChain();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle prefilled prompt from URL
  useEffect(() => {
    const promptFromUrl = searchParams.get('prompt');
    if (promptFromUrl && !hasAutoSentRef.current && messages.length === 0 && !isLoading) {
      setInput(promptFromUrl);
      hasAutoSentRef.current = true;
      // Auto-send after a short delay
      setTimeout(() => {
        handleSubmitWithPrompt(promptFromUrl);
      }, 500);
    }
  }, [searchParams, messages.length, isLoading]);

  const prepareTransactionFromAction = (actionData: any) => {
    return prepareTransaction({
      client,
      chain: defineChain(actionData.chain_id),
      to: actionData.to,
      value: BigInt(actionData.value || '0'),
      data: actionData.data,
    });
  };

  const handleTransactionSuccess = (receipt: any) => {
    console.log('Transaction confirmed:', receipt);
  };

  const handleTransactionError = (error: any) => {
    console.error('Transaction failed:', error);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && lastMessage.content && isThinking) {
      setIsThinking(false);
      setThinkingMessage(null);
    }
  }, [messages, isThinking]);

  const handleSubmitWithPrompt = async (promptText: string) => {
    if (!promptText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: promptText.trim(),
      timestamp: new Date(),
      status: 'sent',
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      status: 'sending',
      actions: [],
      images: [],
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      const events = await stream('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: promptText }],
          context: {
            session_id: sessionId,
            from: account?.address,
            chain_ids: activeChain?.id ? [activeChain.id] : undefined,
          },
        }),
      });

      for await (const event of events) {
        if (!event.data) continue;

        try {
          const parsedEventData = JSON.parse(event.data);
          
          if (event.event === 'delta' || event.event === 'action' || event.event === 'image') {
            setIsThinking(false);
            setThinkingMessage(null);
          }
          
          switch (event.event) {
            case 'init':
              if (parsedEventData.session_id) setSessionId(parsedEventData.session_id);
              break;
            case 'presence':
              if (parsedEventData.data && typeof parsedEventData.data === 'string') {
                setThinkingMessage(parsedEventData.data);
                setIsThinking(true);
              }
              break;
            case 'delta':
              setIsThinking(false);
              setThinkingMessage(null);
              if (parsedEventData.v) {
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: msg.content + parsedEventData.v }
                      : msg
                  )
                );
              }
              break;
            case 'action':
              setIsThinking(false);
              setThinkingMessage(null);
              const actionData: ActionEvent = {
                type: parsedEventData.type,
                data: parsedEventData.data,
                request_id: parsedEventData.request_id,
                session_id: parsedEventData.session_id,
              };
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, actions: [...(msg.actions || []), actionData] }
                    : msg
                )
              );
              break;
            case 'image':
              setIsThinking(false);
              setThinkingMessage(null);
              const imageData: ImageEvent = {
                url: parsedEventData.url,
                width: parsedEventData.width,
                height: parsedEventData.height,
              };
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, images: [...(msg.images || []), imageData] }
                    : msg
                )
              );
              break;
            case 'error':
              setIsThinking(false);
              setThinkingMessage(null);
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: msg.content + '\n\n❌ Error: ' + (parsedEventData.data || 'An error occurred'), status: 'error' }
                    : msg
                )
              );
              break;
            case 'done':
              setIsThinking(false);
              setThinkingMessage(null);
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, status: 'sent' }
                    : msg
                )
              );
              break;
          }
        } catch (parseError) {
          console.warn('Failed to parse event data:', event.data, parseError);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsThinking(false);
      setThinkingMessage(null);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: 'Sorry, I encountered an error. Please try again.', status: 'error' }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmitWithPrompt(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/wallet-dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">AI Assistant</span>
            </div>
          </div>
          <ConnectButton 
            client={client}
            theme="dark"
            connectButton={{
              style: { fontSize: "14px", padding: "8px 16px" }
            }}
          />
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                AI Wallet Assistant
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Ask me about your wallet, send transactions, swap tokens, or deploy contracts.
              </p>
            </div>
          )}

          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                
                <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : message.status === 'error'
                    ? 'bg-destructive/10 text-destructive border border-destructive/20'
                    : 'bg-muted text-foreground'
                }`}>
                  {message.content && (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                  
                  {/* Images */}
                  {message.images && message.images.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.images.map((image, index) => (
                        <img
                          key={index}
                          src={image.url}
                          alt="AI generated"
                          className="rounded-lg max-w-full h-auto"
                          style={{ maxWidth: Math.min(image.width, 400) }}
                        />
                      ))}
                    </div>
                  )}
                  
                  {/* Actions */}
                  {message.actions && message.actions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.actions.map((action, index) => (
                        <div key={index} className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">
                              {action.type === 'sign_transaction' && 'Transaction Ready'}
                              {action.type === 'sign_swap' && 'Swap Ready'}
                              {action.type === 'monitor_transaction' && 'Monitoring'}
                            </span>
                          </div>
                          
                          {(action.type === 'sign_transaction' || action.type === 'sign_swap') && (
                            <TransactionButton
                              transaction={() => prepareTransactionFromAction(
                                action.type === 'sign_swap' ? action.data.transaction : action.data
                              )}
                              onTransactionConfirmed={handleTransactionSuccess}
                              onError={handleTransactionError}
                              className="mt-2 px-3 py-1 bg-primary text-primary-foreground text-xs rounded hover:bg-primary/90 transition-colors"
                            >
                              {action.type === 'sign_swap' ? 'Confirm Swap' : 'Confirm Transaction'}
                            </TransactionButton>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Thinking indicator */}
          {isThinking && thinkingMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                  <span className="text-sm text-muted-foreground italic">{thinkingMessage}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Loading indicator */}
          {isLoading && !isThinking && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-muted rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border/50 bg-background/80 backdrop-blur-sm p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your wallet, send transactions, swap tokens..."
            className="flex-1 px-4 py-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder:text-muted-foreground"
            rows={1}
            style={{ minHeight: '48px', maxHeight: '120px' }}
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-12 w-12"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
