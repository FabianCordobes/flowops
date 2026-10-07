create type public.work_order_status as enum (
  'NEW',
  'ASSIGNED',
  'IN_PROGRESS',
  'IN_REVIEW',
  'COMPLETED'
);

create type public.work_order_priority as enum (
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT'
);

create table public.work_orders (
  id uuid primary key default gen_random_uuid(),

  title text not null,
  description text,

  status public.work_order_status not null default 'NEW',
  priority public.work_order_priority not null default 'MEDIUM',

  created_by uuid not null
    references public.profiles(id),

  assigned_to uuid
    references public.profiles(id),

  due_date timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint work_orders_assigned_status_check
    check (
      status = 'NEW'
      or assigned_to is not null
    )
);

create index work_orders_status_idx
  on public.work_orders(status);

create index work_orders_priority_idx
  on public.work_orders(priority);

create index work_orders_created_by_idx
  on public.work_orders(created_by);

create index work_orders_assigned_to_idx
  on public.work_orders(assigned_to);

create index work_orders_due_date_idx
  on public.work_orders(due_date);

alter table public.work_orders
enable row level security;

create trigger work_orders_set_updated_at
before update on public.work_orders
for each row
execute function public.set_updated_at();

create table public.work_order_status_history (
  id uuid primary key default gen_random_uuid(),

  work_order_id uuid not null
    references public.work_orders(id)
    on delete cascade,

  from_status public.work_order_status,

  to_status public.work_order_status not null,

  changed_by uuid not null
    references public.profiles(id),

  reason text,

  created_at timestamptz not null default now()
);

create index work_order_status_history_work_order_idx
  on public.work_order_status_history(work_order_id);

create index work_order_status_history_created_at_idx
  on public.work_order_status_history(created_at);

alter table public.work_order_status_history
enable row level security;