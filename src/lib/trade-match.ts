import { generateObject } from "ai";
import { getAnthropicModel, isAnthropicConfigured } from "@/lib/ai/anthropic";
import {
  TradeMatchResultSchema,
  buildTradeMatchPrompt,
} from "@/lib/ai/trade-match-prompt";
import {
  fetchTradeCatalogList,
  queueMissingTradeRequest,
} from "@/lib/db/trade-catalog-db";
import { supabaseUpdateOne } from "@/lib/supabase-admin";
import type { CandidateCategory } from "@/types/candidate";

// Runs once per profile create/edit — not per dashboard view — so a
// candidate's assessments and growth suggestions come from a shared
// trade_catalog lookup instead of a fresh AI call every time they log in.
// Fails open: if AI is unavailable or the call errors, the candidate is
// just left unmatched (trade_slug stays null) rather than blocking the
// save, same as the existing profile-plausibility check.
export async function matchOrQueueTrade({
  candidateId,
  professionalTitle,
  category,
}: {
  candidateId: string;
  professionalTitle: string;
  category: CandidateCategory;
}): Promise<void> {
  if (!isAnthropicConfigured()) return;

  try {
    const knownTrades = await fetchTradeCatalogList();

    const { object } = await generateObject({
      model: getAnthropicModel(),
      schema: TradeMatchResultSchema,
      prompt: buildTradeMatchPrompt({ professionalTitle, category, knownTrades }),
    });

    const matchedSlug = object.matchedSlug
      ? knownTrades.find((trade) => trade.slug === object.matchedSlug)?.slug
      : null;

    if (matchedSlug) {
      await supabaseUpdateOne("seeker_candidates", `id=eq.${candidateId}`, {
        trade_slug: matchedSlug,
      });
      return;
    }

    await queueMissingTradeRequest({ professionalTitle, category, candidateId });
  } catch (error) {
    console.error("trade matching failed", error);
  }
}
