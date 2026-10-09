create table public.work_order_comments (
  id uuid primary key default gen_random_uuid(),

  work_order_id uuid not null
    references public.work_orders(id)
    on delete cascade,

  author_id uuid not null
    references public.profiles(id),

  content text not null,

  created_at timestamptz not null default now(),

  constraint work_order_comments_content_length_check
    check (
      char_length(btrim(content)) between 1 and 1000
    )
);

create index work_order_comments_work_order_created_at_idx
  on public.work_order_comments(
    work_order_id,
    created_at,
    id
  );

alter table public.work_order_comments
enable row level security;