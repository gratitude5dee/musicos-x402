# x402 Performance Optimization Guide

## Database Optimization

### Indexes
```sql
-- Agent queries
CREATE INDEX CONCURRENTLY idx_agents_user_id_status 
  ON public.agents(user_id, status) 
  WHERE status = 'active';

CREATE INDEX CONCURRENTLY idx_agents_type_public 
  ON public.agents(type, is_public) 
  WHERE is_public = TRUE;

-- Activity queries (hot path)
CREATE INDEX CONCURRENTLY idx_activity_agent_created 
  ON public.agent_activity_log(agent_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_activity_correlation 
  ON public.agent_activity_log(correlation_id) 
  INCLUDE (tool_name, tool_status, latency_ms);

-- Treasury queries
CREATE INDEX CONCURRENTLY idx_treasury_user_status 
  ON public.treasury_transactions(user_id, status, created_at DESC);

-- Vector search optimization
CREATE INDEX idx_memory_embedding_hnsw 
  ON public.agent_memory_chunks 
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
```

### Query Optimization
```sql
-- Materialized view for dashboard metrics
CREATE MATERIALIZED VIEW agent_metrics_summary AS
SELECT 
  agent_id,
  COUNT(*) FILTER (WHERE activity_type = 'tool_call') as total_calls,
  AVG(latency_ms) FILTER (WHERE tool_status = 'success') as avg_latency_ms,
  COUNT(*) FILTER (WHERE tool_status = 'success') * 100.0 / 
    NULLIF(COUNT(*) FILTER (WHERE activity_type = 'tool_call'), 0) as success_rate,
  SUM(cost_usd) as total_cost_usd,
  MAX(created_at) as last_activity_at
FROM agent_activity_log
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY agent_id;

CREATE UNIQUE INDEX ON agent_metrics_summary(agent_id);

-- Refresh every 5 minutes
CREATE OR REPLACE FUNCTION refresh_agent_metrics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY agent_metrics_summary;
END;
$$ LANGUAGE plpgsql;

-- Schedule with pg_cron
SELECT cron.schedule(
  'refresh-agent-metrics',
  '*/5 * * * *',
  $$ SELECT refresh_agent_metrics(); $$
);
```

### Connection Pooling
```typescript
// supabase/config.ts
export const supabasePoolConfig = {
  max: 20, // Max connections
  min: 5,  // Min idle connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
}
```

## API Optimization

### Response Caching (Redis/Upstash)
```typescript
// mcp/utils/cache.ts
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

export async function cachedQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 300
): Promise<T> {
  // Check cache
  const cached = await redis.get(key)
  if (cached) {
    return JSON.parse(cached)
  }

  // Fetch and cache
  const data = await fetcher()
  await redis.setex(key, ttlSeconds, JSON.stringify(data))
  return data
}

// Usage in tool
const balances = await cachedQuery(
  `balances:${userId}`,
  () => fetchBalancesFromBlockchain(userId),
  60 // Cache for 1 minute
)
```

### Request Batching
```typescript
// Frontend: Batch multiple agent queries
import { useMutation } from '@tanstack/react-query'

const batchInvokeAgents = async (requests: Array<{
  agentId: string
  input: string
}>) => {
  const results = await Promise.allSettled(
    requests.map(req => invokeAgent(req.agentId, req.input))
  )
  return results
}
```

### Query Deduplication
```typescript
// TanStack Query automatically deduplicates
const { data } = useQuery({
  queryKey: ['agent', agentId],
  queryFn: () => fetchAgent(agentId),
  staleTime: 30000, // 30s
  gcTime: 300000,   // 5min
})
```

## Frontend Optimization

### Code Splitting
```typescript
// Lazy load heavy components
const AgentMarketplace = lazy(() => import('@/pages/AgentMarketplace'))
const AgentActivityMonitor = lazy(() => import('@/components/agents/AgentActivityMonitor'))

// Preload on hover
<Link
  to="/marketplace"
  onMouseEnter={() => import('@/pages/AgentMarketplace')}
>
  Marketplace
</Link>
```

### Virtual Scrolling
```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

function ActivityLogList({ logs }: { logs: ActivityLog[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: logs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  })

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((item) => (
          <div
            key={item.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${item.size}px`,
              transform: `translateY(${item.start}px)`,
            }}
          >
            <ActivityLogItem log={logs[item.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Image Optimization
```typescript
// Use Next.js Image component
import Image from 'next/image'

<Image
  src={agent.avatar_url}
  alt={agent.name}
  width={48}
  height={48}
  loading="lazy"
  placeholder="blur"
/>
```

## MCP Server Optimization

### HTTP/2 Connection Pooling
```typescript
import http2 from 'http2'

const client = http2.connect(process.env.OPENAI_API_URL!)

// Reuse connection for multiple requests
async function callOpenAI(messages: any[]) {
  const req = client.request({
    ':method': 'POST',
    ':path': '/v1/chat/completions',
    'authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'content-type': 'application/json',
  })

  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', chunk => data += chunk)
    req.on('end', () => resolve(JSON.parse(data)))
    req.on('error', reject)
    req.write(JSON.stringify({ model: 'gpt-4o', messages }))
    req.end()
  })
}
```

### Parallel Tool Execution
```typescript
// Execute independent tools in parallel
const parallelSteps = plan.steps.filter(step => step.canRunInParallel)
const results = await Promise.allSettled(
  parallelSteps.map(step => executeTool(step))
)
```

### Memory Optimization
```typescript
// Limit conversation buffer size
const MAX_CONVERSATION_TOKENS = 4000

function truncateConversationHistory(messages: Message[]) {
  let totalTokens = 0
  const truncated = []

  for (let i = messages.length - 1; i >= 0; i--) {
    const msgTokens = estimateTokens(messages[i].content)
    if (totalTokens + msgTokens > MAX_CONVERSATION_TOKENS) break
    truncated.unshift(messages[i])
    totalTokens += msgTokens
  }

  return truncated
}
```

## Monitoring

### Performance Metrics
```typescript
// OpenTelemetry instrumentation
import { trace, metrics } from '@opentelemetry/api'

const tracer = trace.getTracer('mcp-server')
const meter = metrics.getMeter('mcp-server')

const toolCallDuration = meter.createHistogram('tool_call_duration', {
  description: 'Tool call latency in milliseconds',
  unit: 'ms',
})

const toolCallCounter = meter.createCounter('tool_calls_total', {
  description: 'Total number of tool calls',
})

// Instrument tool calls
async function executeTool(tool: string, input: any) {
  const span = tracer.startSpan(`tool:${tool}`)
  const start = Date.now()

  try {
    const result = await invokeToolImpl(tool, input)
    toolCallCounter.add(1, { tool, status: 'success' })
    return result
  } catch (error) {
    toolCallCounter.add(1, { tool, status: 'failure' })
    throw error
  } finally {
    const duration = Date.now() - start
    toolCallDuration.record(duration, { tool })
    span.end()
  }
}
```

### SLA Targets
| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| MCP tool latency (p95) | < 3s | > 5s |
| Database query time (p95) | < 500ms | > 1s |
| Agent invocation end-to-end (p95) | < 8s | > 15s |
| Wallet transfer confirmation | < 30s | > 60s |
| Dashboard page load | < 2s | > 4s |
| Memory usage (MCP server) | < 2GB | > 3GB |
| CPU usage (sustained) | < 70% | > 85% |

## Cost Optimization

### OpenAI API Usage
```typescript
// Use cheaper models for simple tasks
const modelRouting = {
  planning: 'gpt-4o-mini',      // $0.15/1M tokens
  execution: 'gpt-4o-mini',     // $0.15/1M tokens
  complex_reasoning: 'gpt-4o',  // $2.50/1M tokens
  synthesis: 'gpt-4o-mini',     // $0.15/1M tokens
}

// Estimate cost before execution
function estimateCost(model: string, inputTokens: number, outputTokens: number) {
  const pricing = {
    'gpt-4o-mini': { input: 0.15, output: 0.60 },
    'gpt-4o': { input: 2.50, output: 10.00 },
  }
  const p = pricing[model]
  return (inputTokens * p.input + outputTokens * p.output) / 1_000_000
}
```

### Crossmint Optimization
- Batch wallet operations where possible
- Use webhooks instead of polling
- Cache wallet balances (30s TTL)

### Supabase Optimization
- Use connection pooling (PgBouncer)
- Enable statement timeout (30s)
- Regular VACUUM ANALYZE
- Archive old data (> 90 days) to cold storage
