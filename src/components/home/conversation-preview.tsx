"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send } from "lucide-react";
import { AiAvatar } from "@/components/shared/ai-avatar";
import { cn } from "@/lib/utils";

type Message = { role: "ai" | "user"; text: string };

// Ordinary Filipino work — no developers, no office jobs. Each scenario is a
// short, natural exchange in Tagalog; the AI asking, the person answering
// plainly, the way they actually would.
const SCENARIOS: Message[][] = [
  [
    { role: "ai", text: "Ano ang alam mong gawin?" },
    { role: "user", text: "Karpintero po ako." },
    { role: "ai", text: "Anong klaseng trabaho ang madalas mong ginagawa?" },
    { role: "user", text: "Bubong, kisame, saka paggawa ng kabinet." },
  ],
  [
    { role: "ai", text: "Ano ang alam mong gawin?" },
    { role: "user", text: "Nagde-deliver po ako gamit ang motor." },
    { role: "ai", text: "Ilang taon mo na itong ginagawa?" },
    { role: "user", text: "Mga 4 years na po, Grab at Lalamove." },
  ],
  [
    { role: "ai", text: "Ano ang trabaho mo ngayon?" },
    { role: "user", text: "Magsasaka po, may palayan kami." },
    { role: "ai", text: "Anong mga gawain mo dito?" },
    { role: "user", text: "Pagtatanim, pag-aararo, tapos pag-ani." },
  ],
  [
    { role: "ai", text: "Ano ang alam mong gawin?" },
    { role: "user", text: "Mangingisda po ako sa dagat." },
    { role: "ai", text: "Anong klaseng pangingisda ang ginagawa mo?" },
    { role: "user", text: "Bangka, lambat, minsan pukot din." },
  ],
  [
    { role: "ai", text: "Ano ang alam mong gawin?" },
    { role: "user", text: "Welder po ako." },
    { role: "ai", text: "Anong klaseng welding ang kaya mo?" },
    { role: "user", text: "Arc welding at gas welding, gawa rin ako ng gate at grills." },
  ],
  [
    { role: "ai", text: "Ano ang alam mong gawin?" },
    { role: "user", text: "Mekaniko po ako ng motor." },
    { role: "ai", text: "Anong mga sira ang kaya mong ayusin?" },
    { role: "user", text: "Engine, carburetor, minsan electrical din." },
  ],
  [
    { role: "ai", text: "Ano ang trabaho mo?" },
    { role: "user", text: "Electrician po ako." },
    { role: "ai", text: "Anong klaseng trabaho ang madalas mong ginagawa?" },
    { role: "user", text: "Wiring ng bahay, pag-ayos ng breaker, pag-install ng ilaw." },
  ],
  [
    { role: "ai", text: "Ano ang alam mong gawin?" },
    { role: "user", text: "Tubero po ako." },
    { role: "ai", text: "Anong klaseng gawain ang kaya mo?" },
    { role: "user", text: "Pag-ayos ng tulo, pag-install ng gripo at CR." },
  ],
  [
    { role: "ai", text: "Ano ang alam mong gawin?" },
    { role: "user", text: "Nagluluto po ako, dati akong cook sa karinderya." },
    { role: "ai", text: "Anong klaseng lutuin ang specialty mo?" },
    { role: "user", text: "Adobo, sinigang, saka mga grilled dishes." },
  ],
  [
    { role: "ai", text: "Ano ang trabaho mo?" },
    { role: "user", text: "Caregiver po ako ng matanda." },
    { role: "ai", text: "Anong klaseng alaga ang binibigay mo?" },
    { role: "user", text: "Pagpapainom ng gamot, paligo, saka companionship." },
  ],
  [
    { role: "ai", text: "Ano ang trabaho mo?" },
    { role: "user", text: "Katulong po ako sa bahay." },
    { role: "ai", text: "Anong mga gawain mo?" },
    { role: "user", text: "Pag-linis, paglaba, saka pagluluto minsan." },
  ],
  [
    { role: "ai", text: "Ano ang alam mong gawin?" },
    { role: "user", text: "Nagpapagupit po ako, taga-salon." },
    { role: "ai", text: "Anong klaseng serbisyo ang alam mo?" },
    { role: "user", text: "Haircut, hair color, saka rebond." },
  ],
  [
    { role: "ai", text: "Ano ang trabaho mo?" },
    { role: "user", text: "May sari-sari store po ako." },
    { role: "ai", text: "Ilang taon mo na itong pinapatakbo?" },
    { role: "user", text: "Mga 10 years na, ako rin nagbabantay." },
  ],
  [
    { role: "ai", text: "Ano ang trabaho mo?" },
    { role: "user", text: "Tricycle driver po ako." },
    { role: "ai", text: "Ilang taon ka na dito?" },
    { role: "user", text: "Mga 12 years na, sarili kong tricycle." },
  ],
  [
    { role: "ai", text: "Ano ang alam mong gawin?" },
    { role: "user", text: "Construction worker po ako." },
    { role: "ai", text: "Anong klaseng trabaho ang madalas mong ginagawa?" },
    { role: "user", text: "Pagpapasa ng semento, pagtayo ng pader, minsan tiling din." },
  ],
  [
    { role: "ai", text: "Ano ang alam mong gawin?" },
    { role: "user", text: "Nagbebenta po ako online." },
    { role: "ai", text: "Anong platform ang ginagamit mo?" },
    { role: "user", text: "Facebook Marketplace at Shopee, damit ang tinda ko." },
  ],
];

const MESSAGE_STEP = 550;
const HOLD_DURATION = 2600;
const FADE_DURATION = 400;

function pickNextIndex(current: number) {
  if (SCENARIOS.length <= 1) return 0;
  let next = current;
  while (next === current) {
    next = Math.floor(Math.random() * SCENARIOS.length);
  }
  return next;
}

export function ConversationPreview() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);
  const hasPickedInitial = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    function schedule(fn: () => void, delay: number) {
      timeouts.push(
        setTimeout(() => {
          if (!cancelled) fn();
        }, delay)
      );
    }

    // Randomize which scenario opens on this page load — deferred to a
    // scheduled callback (rather than during render) so the server-rendered
    // markup and first client render still match before this kicks in.
    if (!hasPickedInitial.current) {
      hasPickedInitial.current = true;
      schedule(() => {
        setScenarioIndex(Math.floor(Math.random() * SCENARIOS.length));
      }, 0);
      return () => {
        cancelled = true;
        timeouts.forEach(clearTimeout);
      };
    }

    const script = SCENARIOS[scenarioIndex];
    let t = MESSAGE_STEP;
    script.forEach((_, i) => {
      schedule(() => setVisibleCount(i + 1), t);
      t += MESSAGE_STEP;
    });
    t += HOLD_DURATION;
    schedule(() => {
      setVisibleCount(0);
      schedule(() => {
        setScenarioIndex((current) => pickNextIndex(current));
      }, FADE_DURATION);
    }, t);

    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, [scenarioIndex]);

  const messages = SCENARIOS[scenarioIndex];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
        <AiAvatar className="size-6" />
        <span className="text-xs font-semibold">AI Profile Assistant</span>
      </div>

      <div className="flex flex-1 flex-col justify-end overflow-hidden px-4 py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={scenarioIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: FADE_DURATION / 1000 }}
            className="flex flex-col justify-end gap-2"
          >
            {messages.slice(0, visibleCount).map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2 text-[13px] leading-snug text-left",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  {message.text}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="border-t border-border/60 px-4 py-3">
        <div className="flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          <span className="flex-1 truncate">Isulat ang sagot mo…</span>
          <Send className="size-3.5 shrink-0" />
        </div>
      </div>
    </div>
  );
}
