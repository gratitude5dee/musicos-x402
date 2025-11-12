-- Agent Scan dashboard support for Lovable Stack
-- Provides aggregated agent activity metrics and analytics views

-- Table for storing manual scan audit trail
create table if not exists public.agent_scan_events (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  scanned_at timestamptz not null default now(),
  resource_count integer default 0,
  transaction_count integer default 0,
  metadata jsonb default '{}'::jsonb
);

create index if not exists agent_scan_events_agent_id_idx
  on public.agent_scan_events(agent_id);
create index if not exists agent_scan_events_user_id_idx
  on public.agent_scan_events(user_id);
create index if not exists agent_scan_events_scanned_at_idx
  on public.agent_scan_events(scanned_at desc);

-- Helper function returning aggregated scan summaries with pagination support
create or replace function public.get_agent_scan_summaries(
  p_facilitator text default null,
  p_network text default null,
  p_resource_type text default null,
  p_time_range text default '30d',
  p_limit integer default 50,
  p_offset integer default 0
)
returns table (
  agent_id uuid,
  agent_name text,
  agent_type text,
  agent_status text,
  user_id uuid,
  created_at timestamptz,
  last_active_at timestamptz,
  activity_count bigint,
  success_rate numeric,
  avg_latency numeric,
  avg_tokens numeric,
  transaction_count bigint,
  transaction_volume numeric,
  resource_count bigint,
  metadata jsonb,
  total_count bigint
)
language sql
stable
as $$
with boundary as (
  select case p_time_range
    when '24h' then now() - interval '24 hours'
    when '7d' then now() - interval '7 days'
    when '30d' then now() - interval '30 days'
    else now() - interval '365 days'
  end as start_time
),
activity as (
  select
    agent_id,
    count(*) as activity_count,
    count(*) filter (where tool_status = 'success')::numeric / nullif(count(*), 0) as success_rate,
    avg(latency_ms) as avg_latency,
    avg(tokens_used) as avg_tokens,
    count(distinct coalesce(tool_name, 'unlabeled')) as resource_count
  from public.agent_activity_log al
  join boundary b on true
  where p_time_range = 'all' or al.created_at >= b.start_time
  group by agent_id
),
transactions as (
  select
    agent_id,
    count(*) as transaction_count,
    coalesce(sum(amount_sol), 0) as transaction_volume
  from public.treasury_transactions tt
  join boundary b on true
  where agent_id is not null
    and (p_time_range = 'all' or tt.created_at >= b.start_time)
  group by agent_id
)
select
  a.id,
  a.name,
  a.type,
  a.status,
  a.user_id,
  a.created_at,
  a.last_active_at,
  coalesce(act.activity_count, 0)::bigint,
  coalesce(act.success_rate, 0)::numeric,
  coalesce(act.avg_latency, 0)::numeric,
  coalesce(act.avg_tokens, 0)::numeric,
  coalesce(tx.transaction_count, 0)::bigint,
  coalesce(tx.transaction_volume, 0)::numeric,
  coalesce(act.resource_count, 0)::bigint,
  a.metadata,
  count(*) over ()
from public.agents a
left join activity act on act.agent_id = a.id
left join transactions tx on tx.agent_id = a.id
where (p_facilitator is null or a.metadata ->> 'facilitatorId' = p_facilitator)
  and (p_network is null or a.metadata ->> 'networkId' = p_network)
  and (p_resource_type is null or a.metadata ->> 'primaryResourceType' = p_resource_type)
order by
  case
    when p_time_range = '24h' then coalesce(act.activity_count, 0)
    when p_time_range = '7d' then coalesce(act.activity_count, 0)
    when p_time_range = '30d' then coalesce(act.activity_count, 0)
    else coalesce(tx.transaction_volume, 0)
  end desc,
  coalesce(a.last_active_at, a.created_at) desc
limit p_limit
offset p_offset;
$$;

-- Function returning analytics payload for a single agent
create or replace function public.get_agent_scan_analytics(
  p_agent_id uuid,
  p_time_range text default '30d'
)
returns jsonb
language sql
stable
as $$
with boundary as (
  select case p_time_range
    when '24h' then now() - interval '24 hours'
    when '7d' then now() - interval '7 days'
    when '30d' then now() - interval '30 days'
    else now() - interval '365 days'
  end as start_time
),
activity as (
  select
    date_trunc('day', al.created_at) as period,
    count(*) as activity_count,
    count(*) filter (where tool_status = 'success') as success_count,
    count(*) filter (where tool_status = 'failure') as failure_count,
    avg(latency_ms) as avg_latency,
    avg(tokens_used) as avg_tokens
  from public.agent_activity_log al
  join boundary b on true
  where al.agent_id = p_agent_id
    and (p_time_range = 'all' or al.created_at >= b.start_time)
  group by 1
),
transactions as (
  select
    date_trunc('day', tt.created_at) as period,
    count(*) as transaction_count,
    coalesce(sum(amount_sol), 0) as transaction_volume
  from public.treasury_transactions tt
  join boundary b on true
  where tt.agent_id = p_agent_id
    and (p_time_range = 'all' or tt.created_at >= b.start_time)
  group by 1
),
timeseries as (
  select
    coalesce(act.period, tx.period) as period,
    coalesce(act.activity_count, 0) as activity_count,
    coalesce(act.success_count, 0) as success_count,
    coalesce(act.failure_count, 0) as failure_count,
    coalesce(act.avg_latency, 0) as avg_latency,
    coalesce(act.avg_tokens, 0) as avg_tokens,
    coalesce(tx.transaction_count, 0) as transaction_count,
    coalesce(tx.transaction_volume, 0) as transaction_volume
  from activity act
  full outer join transactions tx on tx.period = act.period
  order by period
),
tools as (
  select
    coalesce(tool_name, 'unlabeled') as tool_name,
    count(*) as usage_count
  from public.agent_activity_log al
  join boundary b on true
  where al.agent_id = p_agent_id
    and (p_time_range = 'all' or al.created_at >= b.start_time)
    and tool_name is not null
  group by 1
  order by usage_count desc
  limit 12
)
select jsonb_build_object(
  'timeseries', coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'period', to_char(period, 'YYYY-MM-DD'),
        'activityCount', activity_count,
        'successCount', success_count,
        'failureCount', failure_count,
        'avgLatencyMs', coalesce(round(avg_latency::numeric, 2), 0),
        'avgTokens', coalesce(round(avg_tokens::numeric, 2), 0),
        'transactionCount', transaction_count,
        'transactionVolume', transaction_volume
      )
      order by period
    )
    from timeseries
  ), '[]'::jsonb),
  'topTools', coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'tool', tool_name,
        'count', usage_count
      )
      order by usage_count desc
    )
    from tools
  ), '[]'::jsonb),
  'totals', (
    select jsonb_build_object(
      'activity', coalesce(sum(activity_count), 0),
      'success', coalesce(sum(success_count), 0),
      'transactions', coalesce(sum(transaction_count), 0),
      'transactionVolume', coalesce(sum(transaction_volume), 0)
    )
    from timeseries
  ),
  'successRate', coalesce((
    select case when coalesce(sum(activity_count), 0) = 0 then 0
      else coalesce(sum(success_count), 0)::numeric / nullif(sum(activity_count), 0)
    end
    from timeseries
  ), 0)
);
$$;
