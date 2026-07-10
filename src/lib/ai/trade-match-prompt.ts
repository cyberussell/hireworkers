import { z } from "zod";
import type { CandidateCategory } from "@/types/candidate";

export const TradeMatchResultSchema = z.object({
  matchedSlug: z
    .string()
    .nullable()
    .describe(
      "The slug of the existing trade this person's work matches closely enough to share the same assessment and growth content, or null if none of the existing trades are a close enough match"
    ),
});

export type TradeMatchResult = z.infer<typeof TradeMatchResultSchema>;

export function buildTradeMatchPrompt({
  professionalTitle,
  category,
  knownTrades,
}: {
  professionalTitle: string;
  category: CandidateCategory;
  knownTrades: { slug: string; displayName: string; category: string }[];
}) {
  const tradeList = knownTrades
    .map((trade) => `- ${trade.slug}: "${trade.displayName}" (category: ${trade.category})`)
    .join("\n");

  return `You're matching a Filipino worker's self-described job title to a fixed list of known trades on a hiring platform, so people doing the same real work share the same skills assessment and growth suggestions instead of each getting separately generated content.

Their stated title: "${professionalTitle}" (category: ${category})

Known trades:
${tradeList.length > 0 ? tradeList : "(none yet)"}

Pick the slug of the known trade that matches what this person actually does — same core work, even if worded differently (e.g. "Kusinero" matches "cook", "Grab driver" matches "delivery_driver", "Aircon repair" does NOT match "electrician" — different skill sets). Only match if you're confident someone doing this work would find the matched trade's assessment and growth suggestions genuinely relevant to them. If nothing fits well, or the list is empty, return null rather than forcing a loose match.`;
}
