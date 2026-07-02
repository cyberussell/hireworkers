-- PayJobs.work — Phase 3 (social login)
--
-- Adds an owner reference to posted_jobs and seeker_candidates so posts can
-- eventually be tied to "my posts" / edit / delete features. Nullable
-- because rows created before this migration (test data) have no owner, and
-- because our API still writes via the service_role key (RLS bypassed) —
-- this column is bookkeeping for now, not yet enforced by RLS policies.

alter table public.posted_jobs
  add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table public.seeker_candidates
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists posted_jobs_user_id_idx on public.posted_jobs (user_id);
create index if not exists seeker_candidates_user_id_idx on public.seeker_candidates (user_id);
