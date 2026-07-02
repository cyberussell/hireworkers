-- PayJobs.work 2.0 schema — Phase 2 (real persistence)
--
-- Deliberately new table names (posted_jobs, seeker_candidates), not the old
-- job_posts/job_seeker_profiles from the pre-2.0 site — that schema has
-- drifted from its own SQL file and is orphaned (nothing in the current app
-- references it). Keeping these separate avoids silently mixing old and new
-- data models in the same project.
--
-- RLS is enabled but NO policies are created for anon/authenticated roles —
-- every read/write goes through our own Next.js API routes using the
-- service_role key (server-side only), which bypasses RLS entirely. This
-- keeps the same security posture as the /maincontrol admin panel: nothing
-- with write access to these tables is ever exposed to the browser.

create extension if not exists pgcrypto;

create table if not exists public.posted_jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null,
  responsibilities text[] not null default '{}',
  required_skills text[] not null default '{}',
  preferred_skills text[] not null default '{}',
  work_setup text not null,
  schedule_type text not null,
  salary_min numeric,
  salary_max numeric,
  salary_currency text not null default 'PHP',
  salary_period text not null default 'month',
  interview_questions text[] not null default '{}',
  assessment_recommendations text[] not null default '{}',
  company_name text not null,
  contact_details text not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.seeker_candidates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  professional_title text not null,
  category text not null,
  avatar_seed text not null,
  professional_summary text not null,
  location text not null,
  years_experience numeric not null default 0,
  skills text[] not null default '{}',
  ai_skills_tags text[] not null default '{}',
  languages jsonb not null default '[]',
  verified jsonb not null default '{"identity": false, "email": false, "phone": false}',
  portfolio jsonb not null default '[]',
  work_history jsonb not null default '[]',
  certifications jsonb not null default '[]',
  assessments jsonb not null default '{"skillAssessments": []}',
  availability text not null,
  hours_per_week text not null,
  last_active date not null default current_date,
  response_rate numeric not null default 0,
  response_time_hours numeric not null default 0,
  "references" jsonb not null default '[]',
  featured boolean not null default false,
  contact_details text not null,
  created_at timestamptz not null default now()
);

create index if not exists posted_jobs_created_at_idx on public.posted_jobs (created_at desc);
create index if not exists seeker_candidates_created_at_idx on public.seeker_candidates (created_at desc);

alter table public.posted_jobs enable row level security;
alter table public.seeker_candidates enable row level security;
