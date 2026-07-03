// Sketchbook scaffolding marks — the construction geometry an industrial
// designer leaves in a notebook: guide circles, tick crosses, measurement
// arrows with tiny handwritten numbers, perspective fans, correction
// scribbles. These are scattered independently of the figures/props to sell
// the "unfinished concept page" feel rather than a set of finished icons.
import { jitterPoints, mulberry32, smoothPath, straight } from "./utils";

export type Mark = {
  paths: string[];
  dashedPaths?: string[];
  texts?: { x: number; y: number; content: string; rotate: number }[];
};
export type MarkBuilder = (seed: number) => Mark;

export const MARKS: Record<string, MarkBuilder> = {
  guideCircle: (seed) => {
    const rand = mulberry32(seed);
    const r = 14 + rand() * 10;
    return {
      paths: [`M ${r},0 A ${r} ${r} 0 1 1 ${-r},0 A ${r} ${r} 0 1 1 ${r},0`],
      dashedPaths: [
        straight([
          [-r - 6, 0],
          [r + 6, 0],
        ]),
        straight([
          [0, -r - 6],
          [0, r + 6],
        ]),
      ],
    };
  },

  crossTick: () => ({
    paths: [
      straight([
        [-6, 0],
        [6, 0],
      ]),
      straight([
        [0, -6],
        [0, 6],
      ]),
    ],
  }),

  measurementArrow: (seed) => {
    const rand = mulberry32(seed);
    const len = 30 + rand() * 20;
    const label = [`${Math.round(8 + rand() * 40)}"`, `${Math.round(10 + rand() * 60)}cm`][
      Math.floor(rand() * 2)
    ];
    return {
      paths: [
        straight([
          [-len / 2, 0],
          [len / 2, 0],
        ]),
        straight([
          [-len / 2, 0],
          [-len / 2 + 5, -3],
        ]),
        straight([
          [-len / 2, 0],
          [-len / 2 + 5, 3],
        ]),
        straight([
          [len / 2, 0],
          [len / 2 - 5, -3],
        ]),
        straight([
          [len / 2, 0],
          [len / 2 - 5, 3],
        ]),
      ],
      texts: [{ x: 0, y: -6, content: label, rotate: (rand() - 0.5) * 6 }],
    };
  },

  perspectiveFan: (seed) => {
    const rand = mulberry32(seed);
    const paths: string[] = [];
    const count = 4;
    for (let i = 0; i < count; i++) {
      const a = (-20 + i * 14 + (rand() - 0.5) * 6) * (Math.PI / 180);
      const len = 26 + rand() * 14;
      paths.push(
        straight([
          [0, 0],
          [Math.cos(a) * len, Math.sin(a) * len],
        ])
      );
    }
    return { paths };
  },

  eraseScribble: (seed) => {
    const rand = mulberry32(seed);
    const pts: [number, number][] = [];
    let x = -12;
    for (let i = 0; i < 6; i++) {
      pts.push([x, (rand() - 0.5) * 6]);
      x += 5;
    }
    return { paths: [smoothPath(jitterPoints(pts, seed, 0.8))] };
  },

  dashedGuideline: (seed) => {
    const rand = mulberry32(seed);
    const len = 60 + rand() * 60;
    return { paths: [], dashedPaths: [straight([[-len / 2, 0], [len / 2, 0]])] };
  },
};

export const MARK_KEYS = Object.keys(MARKS);
