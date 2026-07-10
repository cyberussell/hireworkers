-- HireWorkers — Phase 4 (address matching + profile views)
--
-- Adds an address field (for AI-based location matching against employers)
-- and a profile_views counter (shown on the seeker dashboard as "people who
-- have seen your profile"). Run this in the Supabase SQL editor before
-- deploying code that depends on it.

alter table public.seeker_candidates
  add column if not exists address text;

alter table public.seeker_candidates
  add column if not exists profile_views integer not null default 0;
