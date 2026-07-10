-- HireWorkers — Phase 8 (self-declared ID + payment methods)
--
-- Adds a self-declared government ID (type + number — a claim, not proof;
-- does NOT set verified.identity, which is reserved for a future
-- human-verifier feature) and preferred payment methods. Run this in the
-- Supabase SQL editor before deploying code that depends on it.

alter table public.seeker_candidates
  add column if not exists government_id_type text;

alter table public.seeker_candidates
  add column if not exists government_id_number text;

alter table public.seeker_candidates
  add column if not exists payment_methods text[] not null default '{}';
