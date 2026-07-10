import { supabaseSelect } from "@/lib/supabase-admin";

export interface SkillProfileStat {
  slug: string;
  displayName: string;
  category: string;
  profileCount: number;
}

export interface MissionControlStats {
  totalSkills: number;
  totalProfiles: number;
  unmatchedProfiles: number;
  skills: SkillProfileStat[];
}

// Every trade_catalog row carries an assessment (upserted together in
// upsertTradeCatalogEntry), so the catalog list IS the list of skills that
// have an assessment — there's no separate "has assessment" flag to check.
export async function fetchMissionControlStats(): Promise<MissionControlStats> {
  const [trades, candidates] = await Promise.all([
    supabaseSelect<{ slug: string; display_name: string; category: string }>(
      "trade_catalog",
      "select=slug,display_name,category&order=display_name.asc"
    ),
    supabaseSelect<{ id: string; trade_slug: string | null }>(
      "seeker_candidates",
      "select=id,trade_slug"
    ),
  ]);

  const countBySlug = new Map<string, number>();
  let unmatchedProfiles = 0;
  for (const candidate of candidates) {
    if (candidate.trade_slug) {
      countBySlug.set(
        candidate.trade_slug,
        (countBySlug.get(candidate.trade_slug) ?? 0) + 1
      );
    } else {
      unmatchedProfiles += 1;
    }
  }

  const skills = trades.map((trade) => ({
    slug: trade.slug,
    displayName: trade.display_name,
    category: trade.category,
    profileCount: countBySlug.get(trade.slug) ?? 0,
  }));

  return {
    totalSkills: trades.length,
    totalProfiles: candidates.length,
    unmatchedProfiles,
    skills,
  };
}
