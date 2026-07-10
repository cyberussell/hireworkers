import {
  supabaseSelect,
  supabaseUpdateOne,
  supabaseUpsertOne,
} from "@/lib/supabase-admin";
import type { AssessmentGenerationResult } from "@/lib/ai/assessment-prompt";
import type { GrowthSuggestions } from "@/lib/ai/growth-prompt";
import type { CandidateCategory } from "@/types/candidate";

export interface TradeCatalogRow {
  slug: string;
  display_name: string;
  category: string;
  assessment: AssessmentGenerationResult;
  growth: GrowthSuggestions;
}

export interface MissingTradeRequestRow {
  id: string;
  professional_title: string;
  category: string;
  candidate_id: string | null;
  status: string;
  request_count: number;
  created_at: string;
}

export async function fetchTradeCatalogList(): Promise<
  { slug: string; displayName: string; category: string }[]
> {
  const rows = await supabaseSelect<{
    slug: string;
    display_name: string;
    category: string;
  }>("trade_catalog", "select=slug,display_name,category");
  return rows.map((row) => ({
    slug: row.slug,
    displayName: row.display_name,
    category: row.category,
  }));
}

export async function fetchTradeCatalogBySlug(
  slug: string
): Promise<TradeCatalogRow | null> {
  const rows = await supabaseSelect<TradeCatalogRow>(
    "trade_catalog",
    `select=*&slug=eq.${encodeURIComponent(slug)}`
  );
  return rows[0] ?? null;
}

export async function upsertTradeCatalogEntry(entry: {
  slug: string;
  displayName: string;
  category: CandidateCategory;
  assessment: AssessmentGenerationResult;
  growth: GrowthSuggestions;
}): Promise<void> {
  await supabaseUpsertOne(
    "trade_catalog",
    {
      slug: entry.slug,
      display_name: entry.displayName,
      category: entry.category,
      assessment: entry.assessment,
      growth: entry.growth,
      updated_at: new Date().toISOString(),
    },
    "slug"
  );
}

// Dedupes on (normalized professional_title, category) among pending
// requests — bumps request_count instead of creating a duplicate row so
// Mission Control can see how many people are waiting on the same gap.
export async function queueMissingTradeRequest({
  professionalTitle,
  category,
  candidateId,
}: {
  professionalTitle: string;
  category: CandidateCategory;
  candidateId: string;
}): Promise<void> {
  const normalized = professionalTitle.trim().toLowerCase();
  const existing = await supabaseSelect<MissingTradeRequestRow>(
    "missing_trade_requests",
    `select=*&status=eq.pending&category=eq.${category}`
  );
  const match = existing.find(
    (row) => row.professional_title.trim().toLowerCase() === normalized
  );

  if (match) {
    await supabaseUpdateOne(
      "missing_trade_requests",
      `id=eq.${match.id}`,
      { request_count: match.request_count + 1 }
    );
    return;
  }

  const { supabaseInsertOne } = await import("@/lib/supabase-admin");
  await supabaseInsertOne("missing_trade_requests", {
    professional_title: professionalTitle,
    category,
    candidate_id: candidateId,
    status: "pending",
    request_count: 1,
  });
}

export async function fetchPendingMissingTradeRequests(): Promise<
  MissingTradeRequestRow[]
> {
  return supabaseSelect<MissingTradeRequestRow>(
    "missing_trade_requests",
    "select=*&status=eq.pending&order=request_count.desc"
  );
}

export async function resolveMissingTradeRequests(
  ids: string[],
  slug: string
): Promise<void> {
  const rows = await supabaseSelect<MissingTradeRequestRow>(
    "missing_trade_requests",
    `select=candidate_id&id=in.(${ids.join(",")})`
  );

  await Promise.all(
    ids.map((id) =>
      supabaseUpdateOne("missing_trade_requests", `id=eq.${id}`, {
        status: "fulfilled",
      })
    )
  );

  const candidateIds = Array.from(
    new Set(rows.map((row) => row.candidate_id).filter(Boolean))
  ) as string[];

  await Promise.all(
    candidateIds.map((candidateId) =>
      supabaseUpdateOne("seeker_candidates", `id=eq.${candidateId}`, {
        trade_slug: slug,
      })
    )
  );
}

export async function dismissMissingTradeRequest(id: string): Promise<void> {
  await supabaseUpdateOne("missing_trade_requests", `id=eq.${id}`, {
    status: "dismissed",
  });
}
