import { hashString, mulberry32 } from "./utils";
import { FIGURE_KEYS } from "./figures";
import { PROP_KEYS } from "./props";
import { MARK_KEYS } from "./marks";

export type Placement = {
  kind: "figure" | "prop" | "mark";
  key: string;
  leftPct: number;
  topPx: number;
  rotate: number;
  scale: number;
  opacity: number;
  seed: number;
};

const pick = <T,>(arr: T[], rand: () => number) =>
  arr[Math.floor(rand() * arr.length)];

/**
 * Deterministically composes one band's worth of scattered icons: a couple
 * of sparse clusters (one large worker + a few small tools/marks near it)
 * plus a handful of lone props/marks filling the remaining empty space.
 * Roughly 10-15% visual coverage per band — mostly negative space.
 */
export function bandPlacements(bandIndex: number, bandHeight: number): Placement[] {
  const rand = mulberry32(hashString(`sketch-band-${bandIndex}`));
  const rf = (min: number, max: number) => min + rand() * (max - min);
  const placements: Placement[] = [];
  let seedCounter = bandIndex * 1000;

  const clusterCount = 2 + Math.floor(rand() * 2); // 2-3
  const anchors: { left: number; top: number }[] = [];

  for (let c = 0; c < clusterCount; c++) {
    const left = rf(10, 90);
    const top = rf(90, Math.max(120, bandHeight - 140));
    anchors.push({ left, top });

    placements.push({
      kind: "figure",
      key: pick(FIGURE_KEYS, rand),
      leftPct: left,
      topPx: top,
      rotate: rf(-7, 7),
      scale: rf(0.9, 1.55),
      opacity: rf(0.8, 1.3),
      seed: seedCounter++,
    });

    const propCount = 1 + Math.floor(rand() * 3); // 1-3
    for (let i = 0; i < propCount; i++) {
      placements.push({
        kind: "prop",
        key: pick(PROP_KEYS, rand),
        leftPct: Math.min(97, Math.max(3, left + rf(-16, 16))),
        topPx: top + rf(-90, 110),
        rotate: rf(-30, 30),
        scale: rf(0.4, 0.75),
        opacity: rf(0.7, 1.15),
        seed: seedCounter++,
      });
    }

    const markCount = Math.floor(rand() * 3); // 0-2
    for (let i = 0; i < markCount; i++) {
      placements.push({
        kind: "mark",
        key: pick(MARK_KEYS, rand),
        leftPct: Math.min(97, Math.max(3, left + rf(-22, 22))),
        topPx: top + rf(-120, 140),
        rotate: rf(-15, 15),
        scale: rf(0.55, 1),
        opacity: rf(0.45, 0.8),
        seed: seedCounter++,
      });
    }
  }

  // lone scattered elements drifting through the empty gaps
  const soloCount = 3 + Math.floor(rand() * 3); // 3-5
  for (let i = 0; i < soloCount; i++) {
    const isMark = rand() < 0.35;
    placements.push({
      kind: isMark ? "mark" : "prop",
      key: isMark ? pick(MARK_KEYS, rand) : pick(PROP_KEYS, rand),
      leftPct: rf(4, 96),
      topPx: rf(20, bandHeight - 30),
      rotate: rf(-25, 25),
      scale: rf(0.35, 0.7),
      opacity: rf(0.4, 0.75),
      seed: seedCounter++,
    });
  }

  return placements;
}
