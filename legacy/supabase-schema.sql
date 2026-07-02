create extension if not exists pgcrypto;

create table if not exists public.ai_intake_sessions (
  id uuid primary key default gen_random_uuid(),
  user_type text not null default 'job_provider',
  raw_prompt text not null,
  extracted_data jsonb not null default '{}'::jsonb,
  missing_fields text[] not null default '{}',
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_posts (
  id uuid primary key default gen_random_uuid(),
  intake_session_id uuid references public.ai_intake_sessions(id) on delete set null,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null,
  company_name text not null,
  contact_email text not null,
  description text not null,
  required_skills text[] not null default '{}',
  work_setup text not null,
  location text,
  schedule_type text not null,
  pay_type text not null default 'hourly',
  pay_min numeric,
  pay_max numeric,
  currency text not null default 'PHP',
  status text not null default 'draft',
  is_legitimate boolean,
  spam_score int default 0,
  validation_status text default 'pending',
  rejection_reason text,
  ai_validation_notes jsonb,
  published_at timestamptz
);

create table if not exists public.job_seeker_profiles (
  id uuid primary key default gen_random_uuid(),
  raw_prompt text,
  name text,
  location text default 'Philippines',
  skills text[] not null default '{}',
  experience_level text,
  preferred_work_setup text,
  preferred_schedule text,
  expected_pay_min numeric,
  expected_pay_max numeric,
  currency text not null default 'PHP',
  cyberussell_recommendations jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_matches (
  id uuid primary key default gen_random_uuid(),
  job_post_id uuid not null references public.job_posts(id) on delete cascade,
  job_seeker_profile_id uuid not null references public.job_seeker_profiles(id) on delete cascade,
  match_score numeric not null default 0,
  reasons text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.ai_intake_sessions enable row level security;
alter table public.job_posts enable row level security;
alter table public.job_seeker_profiles enable row level security;
alter table public.job_matches enable row level security;

drop policy if exists "Anyone can create intake sessions" on public.ai_intake_sessions;
create policy "Anyone can create intake sessions"
on public.ai_intake_sessions
for insert
to anon
with check (true);

drop policy if exists "Anyone can create draft job posts" on public.job_posts;
create policy "Anyone can create draft job posts"
on public.job_posts
for insert
to anon
with check (true);

drop policy if exists "Anyone can read published job posts" on public.job_posts;
create policy "Anyone can read published job posts"
on public.job_posts
for select
to anon
using (status = 'published' and is_legitimate = true);

drop policy if exists "Anyone can create seeker profiles" on public.job_seeker_profiles;
create policy "Anyone can create seeker profiles"
on public.job_seeker_profiles
for insert
to anon
with check (true);
