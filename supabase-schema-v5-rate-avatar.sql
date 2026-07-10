-- HireWorkers — Phase 5 (rate + avatar)
--
-- Adds pay-rate fields (day rate, or contract/project-based) collected
-- during onboarding, and an avatar_url defaulting to the person's Google/
-- Facebook profile photo at signup. Run this in the Supabase SQL editor
-- before deploying code that depends on it.

alter table public.seeker_candidates
  add column if not exists rate_type text not null default 'not_specified';

alter table public.seeker_candidates
  add column if not exists daily_rate numeric;

alter table public.seeker_candidates
  add column if not exists avatar_url text;
