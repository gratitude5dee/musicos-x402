'use client'

import { useEffect, useRef, useState, KeyboardEvent } from 'react'
import { useAgent } from '@/context/AgentContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Loader2,
  Send,
  Bot,
  User,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  role: 'user' | 'agent' | 'system'
  content: string
  timestamp: Date
  status?: 'sending' | 'sent' | 'processing' | 'completed' | 'error' | 'approval_required'
  correlationId?: string
  executionResults?: any[]
  approvalRequestId?: string
}

const generateId = () =>
  globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)

export function AgentChat() {
  const { activeAgent, invokeAgent } = useAgent()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || !activeAgent || isProcessing) return

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      status: 'sent',
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsProcessing(true)

    const processingMessage: Message = {
      id: generateId(),
      role: 'agent',
      content: 'Processing your request...',
      timestamp: new Date(),
      status: 'processing',
    }

    setMessages((prev) => [...prev, processingMessage])

    try {
      const result = await invokeAgent(activeAgent.id, userMessage.content)

      setMessages((prev) => prev.filter((message) => message.id !== processingMessage.id))

      if (result.status === 'approval_required') {
        const approvalMessage: Message = {
          id: generateId(),
          role: 'system',
          content: result.message || 'This action requires your approval.',
          timestamp: new Date(),
          status: 'approval_required',
          correlationId: result.correlationId,
          approvalRequestId: result.approvalRequestId,
          executionResults: result.plan,
        }

        setMessages((prev) => [...prev, approvalMessage])
        toast.info('Action requires approval', {
          description: 'Review the plan before proceeding',
        })
      } else if (result.status === 'completed') {
        const agentMessage: Message = {
          id: generateId(),
          role: 'agent',
          content: result.response || 'Task completed successfully',
          timestamp: new Date(),
          status: 'completed',
          correlationId: result.correlationId,
          executionResults: result.executionResults,
        }

        setMessages((prev) => [...prev, agentMessage])
        toast.success('Task completed', {
          description: 'Agent successfully executed your request',
        })
      } else {
        throw new Error(result.error || 'Unknown error')
      }
    } catch (error: any) {
      console.error('Agent invocation error:', error)

      setMessages((prev) => prev.filter((message) => message.id !== processingMessage.id))

      const errorMessage: Message = {
        id: generateId(),
        role: 'agent',
        content: `Error: ${error?.message || 'Failed to process your request'}`,
        timestamp: new Date(),
        status: 'error',
      }

      setMessages((prev) => [...prev, errorMessage])
      toast.error('Agent error', {
        description: error?.message || 'Failed to process request',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  if (!activeAgent) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center">
          <Bot className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Select an agent to start chatting</p>
        </CardContent>
      </Card>
    )
  }

  const toolList = activeAgent.tools_enabled?.length
    ? activeAgent.tools_enabled.join(', ')
    : 'None'

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={activeAgent.avatar_url ?? undefined} />
              <AvatarFallback>
                <Bot className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{activeAgent.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{activeAgent.description}</p>
            </div>
          </div>
          <Badge
            variant={activeAgent.status === 'active' ? 'default' : 'secondary'}
            className="capitalize"
          >
            {activeAgent.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          <AnimatePresence initial={false}>
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center h-full"
              >
                <div className="text-center text-muted-foreground">
                  <Bot className="w-12 h-12 mx-auto mb-2" />
                  <p>Start a conversation with {activeAgent.name}</p>
                  <p className="text-xs mt-2">Available tools: {toolList}</p>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>

        <div className="p-4 border-t border-border/50">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`Message ${activeAgent.name}...`}
              disabled={isProcessing}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!input.trim() || isProcessing} size="icon">
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Press Enter to send, Shift+Enter for new line</p>
        </div>
      </CardContent>
    </Card>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <Avatar className="h-8 w-8">
        {isUser ? (
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        ) : (
          <AvatarFallback>
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        )}
      </Avatar>

      <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
        <div
          className={`inline-block max-w-[80%] rounded-lg px-4 py-2 ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : isSystem
              ? 'bg-yellow-500/10 border border-yellow-500/20'
              : 'bg-muted'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>

          {message.status && (
            <div className="flex items-center gap-1 mt-2 text-xs opacity-70">
              {message.status === 'processing' && (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Processing...</span>
                </>
              )}
              {message.status === 'completed' && (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Completed</span>
                </>
              )}
              {message.status === 'error' && (
                <>
                  <AlertCircle className="h-3 w-3" />
                  <span>Error</span>
                </>
              )}
              {message.status === 'approval_required' && (
                <>
                  <Clock className="h-3 w-3" />
                  <span>Awaiting approval</span>
                </>
              )}
            </div>
          )}

          {message.executionResults && message.executionResults.length > 0 && (
            <details className="mt-2 text-xs">
              <summary className="cursor-pointer opacity-70 hover:opacity-100">
                View execution details ({message.executionResults.length} steps)
              </summary>
              <div className="mt-2 space-y-1">
                {message.executionResults.map((result, index) => (
                  <div key={index} className="bg-background/50 rounded px-2 py-1 font-mono">
                    <div className="flex items-center justify-between">
                      <span>{result.tool || result.description}</span>
                      <Badge
                        variant={result.status === 'success' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {result.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-1">
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>
    </motion.div>
  )
}
