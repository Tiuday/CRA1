-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Repurposing jobs table
create table public.repurpose_jobs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  original_content text not null,
  created_at timestamptz default now(),
  status text default 'pending' check (status in ('pending','running','done','error'))
);

-- Outputs table (one row per platform per job)
create table public.repurpose_outputs (
  id uuid default uuid_generate_v4() primary key,
  job_id uuid references public.repurpose_jobs(id) on delete cascade,
  platform text not null,
  content text not null,
  created_at timestamptz default now()
);

-- Row Level Security
alter table public.repurpose_jobs enable row level security;
alter table public.repurpose_outputs enable row level security;

create policy "Users see own jobs" on public.repurpose_jobs
  for all using (auth.uid() = user_id);

create policy "Users see own outputs" on public.repurpose_outputs
  for all using (
    job_id in (select id from public.repurpose_jobs where user_id = auth.uid())
  );
