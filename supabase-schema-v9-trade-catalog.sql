-- HireWorkers — Phase 9 (trade catalog: DB-backed assessments & growth)
--
-- Replaces live per-visit Anthropic calls for skill assessments and "Learn
-- & Grow" suggestions with a shared catalog keyed by trade, matched once
-- per profile save (not per dashboard view) via lib/trade-match.ts. When a
-- candidate's professionalTitle can't be confidently matched to an
-- existing trade, a row lands in missing_trade_requests for Mission
-- Control (/mission-control) to fulfill.

create table if not exists public.trade_catalog (
  slug text primary key,
  display_name text not null,
  category text not null,
  -- { scenario: { title, prompt }, checklist: { title, items } } — same
  -- shape as AssessmentGenerationResultSchema.
  assessment jsonb not null,
  -- { suggestions: [{ skill, reason, whereToLearn }] } — same shape as
  -- GrowthSuggestionsSchema.
  growth jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.trade_catalog enable row level security;

create table if not exists public.missing_trade_requests (
  id uuid primary key default gen_random_uuid(),
  professional_title text not null,
  category text not null,
  candidate_id uuid references public.seeker_candidates(id),
  status text not null default 'pending',
  -- How many profile saves have hit this same gap — lets Mission Control
  -- prioritize by demand instead of first-come-first-served.
  request_count int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.missing_trade_requests enable row level security;

alter table public.seeker_candidates
  add column if not exists trade_slug text references public.trade_catalog(slug);
