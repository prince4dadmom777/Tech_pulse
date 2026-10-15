-- FlowPilot AI Core Schema Migration

create extension if not exists pgcrypto;

-- Enums
do $$ begin
  create type public.workflow_status as enum (
    'draft',
    'planned',
    'awaiting_approval',
    'running',
    'paused',
    'completed',
    'failed',
    'cancelled',
    'needs_attention'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.task_status as enum (
    'pending',
    'ready',
    'running',
    'awaiting_approval',
    'completed',
    'failed',
    'blocked',
    'cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.approval_status as enum (
    'pending',
    'approved',
    'rejected',
    'cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.agent_type as enum (
    'orchestrator',
    'business_analyst',
    'planner',
    'operations',
    'customer_communication',
    'quality_risk'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.execution_mode as enum (
    'demo',
    'ai'
  );
exception when duplicate_object then null; end $$;

-- 1. Workspaces
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Workspace Members
create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member'
    check (role in ('owner', 'admin', 'member', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

-- 3. Workflows
create table if not exists public.workflows (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete restrict,
  title text not null check (char_length(title) between 3 and 120),
  objective text not null check (char_length(objective) between 20 and 5000),
  category text not null default 'general',
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high', 'critical')),
  status public.workflow_status not null default 'draft',
  execution_mode public.execution_mode not null default 'demo',
  approval_policy text not null default 'risk_based'
    check (approval_policy in ('required', 'risk_based', 'manual_only')),
  plan jsonb,
  final_report jsonb,
  error_summary text,
  deadline timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Agents
create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  agent_type public.agent_type not null unique,
  name text not null,
  description text not null,
  enabled boolean not null default true,
  configuration jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Workflow Tasks
create table if not exists public.workflow_tasks (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete restrict,
  title text not null,
  description text not null,
  status public.task_status not null default 'pending',
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high', 'critical')),
  input_data jsonb not null default '{}'::jsonb,
  output_data jsonb,
  tool_names text[] not null default '{}',
  completion_criteria jsonb not null default '{}'::jsonb,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  max_attempts integer not null default 3 check (max_attempts between 1 and 10),
  idempotency_key text,
  started_at timestamptz,
  completed_at timestamptz,
  error_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workflow_id, idempotency_key)
);

-- 6. Task Dependencies
create table if not exists public.task_dependencies (
  task_id uuid not null references public.workflow_tasks(id) on delete cascade,
  depends_on_task_id uuid not null references public.workflow_tasks(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (task_id, depends_on_task_id),
  check (task_id <> depends_on_task_id)
);

-- 7. Agent Executions
create table if not exists public.agent_executions (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  task_id uuid references public.workflow_tasks(id) on delete set null,
  agent_id uuid not null references public.agents(id) on delete restrict,
  status text not null check (
    status in ('queued', 'running', 'completed', 'failed', 'cancelled')
  ),
  input_summary text,
  output_data jsonb,
  error_summary text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- 8. Business Customers
create table if not exists public.business_customers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 9. Suppliers
create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  email text,
  status text not null default 'active'
    check (status in ('active', 'inactive', 'delayed')),
  lead_time_days integer check (lead_time_days >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 10. Inventory Items
create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  sku text not null,
  name text not null,
  quantity integer not null default 0 check (quantity >= 0),
  reorder_threshold integer not null default 5 check (reorder_threshold >= 0),
  supplier_id uuid references public.suppliers(id) on delete set null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (workspace_id, sku)
);

-- 11. Business Orders
create table if not exists public.business_orders (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  customer_id uuid references public.business_customers(id) on delete set null,
  order_number text not null,
  status text not null default 'pending'
    check (status in (
      'pending', 'processing', 'delayed',
      'shipped', 'delivered', 'cancelled'
    )),
  expected_delivery timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, order_number)
);

-- 12. Order Items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.business_orders(id) on delete cascade,
  inventory_item_id uuid not null references public.inventory_items(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (order_id, inventory_item_id)
);

-- 13. Internal Tasks
create table if not exists public.internal_tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  workflow_id uuid references public.workflows(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'open'
    check (status in ('open', 'in_progress', 'completed', 'cancelled')),
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high', 'critical')),
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 14. Approval Requests
create table if not exists public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  task_id uuid references public.workflow_tasks(id) on delete set null,
  requested_by uuid references auth.users(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  action_type text not null,
  action_payload jsonb not null,
  action_hash text not null,
  reason text not null,
  risk_level text not null default 'medium'
    check (risk_level in ('low', 'medium', 'high', 'critical')),
  status public.approval_status not null default 'pending',
  review_comment text,
  reviewed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- 15. Tool Executions
create table if not exists public.tool_executions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  task_id uuid references public.workflow_tasks(id) on delete set null,
  tool_name text not null,
  input_summary jsonb,
  output_summary jsonb,
  status text not null check (
    status in ('pending', 'running', 'succeeded', 'failed', 'denied')
  ),
  idempotency_key text,
  error_summary text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (workspace_id, idempotency_key)
);

-- 16. Activity Logs
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  workflow_id uuid references public.workflows(id) on delete set null,
  task_id uuid references public.workflow_tasks(id) on delete set null,
  actor_type text not null,
  actor_id text,
  action text not null,
  outcome text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 17. Workflow Templates
create table if not exists public.workflow_templates (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  name text not null,
  description text not null default '',
  category text not null default 'general',
  definition jsonb not null,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 18. Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  workflow_id uuid references public.workflows(id) on delete cascade,
  title text not null,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_workflows_workspace_created on public.workflows(workspace_id, created_at desc);
create index if not exists idx_workflows_workspace_status on public.workflows(workspace_id, status);
create index if not exists idx_tasks_workflow_status on public.workflow_tasks(workflow_id, status);
create index if not exists idx_approvals_workspace_status on public.approval_requests(workspace_id, status);
create index if not exists idx_orders_workspace_status on public.business_orders(workspace_id, status);
create index if not exists idx_inventory_workspace_sku on public.inventory_items(workspace_id, sku);
create index if not exists idx_activity_workspace_created on public.activity_logs(workspace_id, created_at desc);
create index if not exists idx_agent_executions_workflow on public.agent_executions(workflow_id, created_at desc);

-- Automatic updated_at Trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger update_workspaces_modtime
  before update on public.workspaces
  for each row execute function public.handle_updated_at();

create or replace trigger update_workflows_modtime
  before update on public.workflows
  for each row execute function public.handle_updated_at();

create or replace trigger update_workflow_tasks_modtime
  before update on public.workflow_tasks
  for each row execute function public.handle_updated_at();

create or replace trigger update_business_customers_modtime
  before update on public.business_customers
  for each row execute function public.handle_updated_at();

create or replace trigger update_suppliers_modtime
  before update on public.suppliers
  for each row execute function public.handle_updated_at();

create or replace trigger update_inventory_items_modtime
  before update on public.inventory_items
  for each row execute function public.handle_updated_at();

create or replace trigger update_business_orders_modtime
  before update on public.business_orders
  for each row execute function public.handle_updated_at();

create or replace trigger update_internal_tasks_modtime
  before update on public.internal_tasks
  for each row execute function public.handle_updated_at();

create or replace trigger update_workflow_templates_modtime
  before update on public.workflow_templates
  for each row execute function public.handle_updated_at();

-- RLS & Access Policies
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workflows enable row level security;
alter table public.agents enable row level security;
alter table public.workflow_tasks enable row level security;
alter table public.task_dependencies enable row level security;
alter table public.agent_executions enable row level security;
alter table public.business_customers enable row level security;
alter table public.suppliers enable row level security;
alter table public.inventory_items enable row level security;
alter table public.business_orders enable row level security;
alter table public.order_items enable row level security;
alter table public.internal_tasks enable row level security;
alter table public.approval_requests enable row level security;
alter table public.tool_executions enable row level security;
alter table public.activity_logs enable row level security;
alter table public.workflow_templates enable row level security;
alter table public.notifications enable row level security;

-- Helper functions
create or replace function public.is_workspace_member(ws_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.workspace_members
    where workspace_id = ws_id and user_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

create or replace function public.get_workspace_role(ws_id uuid)
returns text as $$
declare
  r text;
begin
  select role into r from public.workspace_members
  where workspace_id = ws_id and user_id = auth.uid();
  return r;
end;
$$ language plpgsql security definer;

-- Workspace Policies
create policy "Workspace members can view workspace"
  on public.workspaces for select
  using (public.is_workspace_member(id) or created_by = auth.uid());

create policy "Workspace owners can update workspace"
  on public.workspaces for update
  using (created_by = auth.uid() or public.get_workspace_role(id) in ('owner', 'admin'));

-- Generic workspace-owned policies
create policy "Members view workflows" on public.workflows for select using (public.is_workspace_member(workspace_id));
create policy "Members create workflows" on public.workflows for insert with check (public.is_workspace_member(workspace_id));
create policy "Members update workflows" on public.workflows for update using (public.is_workspace_member(workspace_id));

create policy "All authenticated can view agents" on public.agents for select using (auth.role() = 'authenticated');

create policy "Members view workflow tasks" on public.workflow_tasks for select
  using (exists (select 1 from public.workflows w where w.id = workflow_id and public.is_workspace_member(w.workspace_id)));
create policy "Members insert workflow tasks" on public.workflow_tasks for insert
  with check (exists (select 1 from public.workflows w where w.id = workflow_id and public.is_workspace_member(w.workspace_id)));
create policy "Members update workflow tasks" on public.workflow_tasks for update
  using (exists (select 1 from public.workflows w where w.id = workflow_id and public.is_workspace_member(w.workspace_id)));

create policy "Members view customers" on public.business_customers for select using (public.is_workspace_member(workspace_id));
create policy "Members modify customers" on public.business_customers for all using (public.is_workspace_member(workspace_id));

create policy "Members view suppliers" on public.suppliers for select using (public.is_workspace_member(workspace_id));
create policy "Members modify suppliers" on public.suppliers for all using (public.is_workspace_member(workspace_id));

create policy "Members view inventory" on public.inventory_items for select using (public.is_workspace_member(workspace_id));
create policy "Members modify inventory" on public.inventory_items for all using (public.is_workspace_member(workspace_id));

create policy "Members view orders" on public.business_orders for select using (public.is_workspace_member(workspace_id));
create policy "Members modify orders" on public.business_orders for all using (public.is_workspace_member(workspace_id));

create policy "Members view approvals" on public.approval_requests for select using (public.is_workspace_member(workspace_id));
create policy "Members update approvals" on public.approval_requests for update using (public.is_workspace_member(workspace_id));

create policy "Members view internal tasks" on public.internal_tasks for select using (public.is_workspace_member(workspace_id));
create policy "Members modify internal tasks" on public.internal_tasks for all using (public.is_workspace_member(workspace_id));

create policy "Members view activity logs" on public.activity_logs for select using (public.is_workspace_member(workspace_id));
create policy "Members insert activity logs" on public.activity_logs for insert with check (public.is_workspace_member(workspace_id));

create policy "Members view templates" on public.workflow_templates for select using (is_public or public.is_workspace_member(workspace_id));
create policy "Members view notifications" on public.notifications for select using (user_id = auth.uid() or public.is_workspace_member(workspace_id));
