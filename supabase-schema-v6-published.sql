-- HireWorkers — Phase 6 (save privately vs. publish)
--
-- Profiles are now saved privately by default when the AI interview
-- finishes; the person explicitly chooses to publish before employers can
-- find them. Run this in the Supabase SQL editor before deploying code
-- that depends on it.

alter table public.seeker_candidates
  add column if not exists published boolean not null default false;

-- Existing rows were created back when everything auto-published — treat
-- them as already public so nobody's live profile disappears.
update public.seeker_candidates set published = true where published is not true;
