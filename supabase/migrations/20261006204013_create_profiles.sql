create type public.user_role as enum (
  'ADMIN',
  'OPERATOR'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  full_name text not null,

  email text not null unique,

  role public.user_role not null default 'OPERATOR',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx
  on public.profiles(role);

alter table public.profiles
enable row level security;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();