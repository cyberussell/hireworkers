// Small standalone tool/object sketches that fill the negative space around
// worker figures. Simple, mostly single-path line icons.
import { jitterPoints, smoothPath, straight } from "./utils";

export type PropShape = { paths: string[]; dashed?: boolean[] };
export type PropBuilder = (seed: number) => PropShape;

export const PROPS: Record<string, PropBuilder> = {
  wrench: (seed) => ({
    paths: [
      smoothPath(
        jitterPoints(
          [
            [-16, 10],
            [-6, 0],
            [6, -12],
            [14, -20],
          ],
          seed,
          0.5
        )
      ),
      straight([
        [-22, 16],
        [-16, 10],
        [-10, 16],
      ]),
    ],
  }),

  hammer: (seed) => ({
    paths: [
      smoothPath(
        jitterPoints(
          [
            [-2, 18],
            [6, -8],
          ],
          seed,
          0.4
        )
      ),
      straight([
        [-2, -18],
        [14, -14],
        [10, -2],
        [-6, -6],
        [-2, -18],
      ]),
    ],
  }),

  screwdriver: (seed) => ({
    paths: [
      straight([
        [-12, 14],
        [10, -10],
      ]),
      straight([
        [8, -18],
        [16, -8],
        [10, -10],
      ]),
    ],
  }),

  measuringTape: (seed) => ({
    paths: [
      smoothPath(
        jitterPoints(
          [
            [0, -12],
            [10, -8],
            [12, 2],
            [4, 10],
            [-8, 8],
            [-12, -2],
            [-4, -11],
            [0, -12],
          ],
          seed,
          0.5
        ),
        true
      ),
      straight([
        [8, 8],
        [18, 18],
        [18, 24],
      ]),
    ],
  }),

  toolbox: (seed) => ({
    paths: [
      straight([
        [-16, -4],
        [16, -4],
        [16, 12],
        [-16, 12],
        [-16, -4],
      ]),
      straight([
        [-6, -4],
        [-6, -10],
        [6, -10],
        [6, -4],
      ]),
    ],
  }),

  laptop: (seed) => ({
    paths: [
      straight([
        [-14, -10],
        [14, -10],
        [14, 4],
        [-14, 4],
        [-14, -10],
      ]),
      straight([
        [-18, 8],
        [18, 8],
        [14, 4],
        [-14, 4],
        [-18, 8],
      ]),
    ],
  }),

  keyboard: (seed) => ({
    paths: [
      straight([
        [-18, -6],
        [18, -6],
        [18, 8],
        [-18, 8],
        [-18, -6],
      ]),
    ],
  }),

  gear: (seed) => {
    const paths: string[] = [];
    const teeth = 8;
    const rOuter = 12;
    const rInner = 7;
    let d = "";
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2;
      const x1 = Math.cos(a) * rInner;
      const y1 = Math.sin(a) * rInner;
      const x2 = Math.cos(a) * rOuter;
      const y2 = Math.sin(a) * rOuter;
      d += `M${x1.toFixed(1)},${y1.toFixed(1)} L${x2.toFixed(1)},${y2.toFixed(
        1
      )} `;
    }
    paths.push(d.trim());
    paths.push(`M ${rInner},0 A ${rInner} ${rInner} 0 1 1 ${-rInner},0 A ${rInner} ${rInner} 0 1 1 ${rInner},0`);
    return { paths };
  },

  clipboard: (seed) => ({
    paths: [
      straight([
        [-12, -16],
        [12, -16],
        [12, 16],
        [-12, 16],
        [-12, -16],
      ]),
      straight([
        [-5, -18],
        [5, -18],
        [5, -14],
        [-5, -14],
        [-5, -18],
      ]),
      straight([
        [-7, -6],
        [7, -6],
      ]),
      straight([
        [-7, 0],
        [7, 0],
      ]),
      straight([
        [-7, 6],
        [3, 6],
      ]),
    ],
  }),

  packageBox: (seed) => ({
    paths: [
      straight([
        [-14, -8],
        [14, -8],
        [14, 14],
        [-14, 14],
        [-14, -8],
      ]),
      straight([
        [-14, -8],
        [0, -16],
        [14, -8],
      ]),
      straight([
        [0, -16],
        [0, 14],
      ]),
    ],
  }),

  paintRoller: (seed) => ({
    paths: [
      straight([
        [-2, 18],
        [6, -2],
        [16, -14],
      ]),
      straight([
        [-8, -20],
        [14, -12],
        [10, -2],
        [-12, -10],
        [-8, -20],
      ]),
    ],
  }),

  ruler: (seed) => ({
    paths: [
      straight([
        [-20, 6],
        [20, -6],
      ]),
      straight([
        [-20, 12],
        [20, 0],
      ]),
      straight([
        [-10, 9.5],
        [-10, 5.5],
      ]),
      straight([
        [0, 7],
        [0, 3],
      ]),
      straight([
        [10, 4.5],
        [10, 0.5],
      ]),
    ],
  }),

  leaf: (seed) => ({
    paths: [
      smoothPath(
        jitterPoints(
          [
            [0, 14],
            [-10, 0],
            [0, -14],
            [10, 0],
            [0, 14],
          ],
          seed,
          0.6
        ),
        true
      ),
      straight([
        [0, 12],
        [0, -12],
      ]),
    ],
  }),

  safetyHelmet: (seed) => ({
    paths: [
      straight([
        [-14, 2],
        [14, 2],
      ]),
      smoothPath(
        jitterPoints(
          [
            [-13, 2],
            [-11, -10],
            [11, -10],
            [13, 2],
          ],
          seed,
          0.4
        )
      ),
    ],
  }),

  constructionCone: (seed) => ({
    paths: [
      straight([
        [-4, -18],
        [4, -18],
        [12, 10],
        [-12, 10],
        [-4, -18],
      ]),
      straight([
        [-8, -2],
        [8, -2],
      ]),
      straight([
        [-16, 10],
        [16, 10],
        [16, 14],
        [-16, 14],
        [-16, 10],
      ]),
    ],
  }),

  wheelbarrow: (seed) => ({
    paths: [
      smoothPath(
        jitterPoints(
          [
            [-16, 4],
            [-12, -8],
            [12, -8],
            [16, 4],
          ],
          seed,
          0.4
        )
      ),
      straight([
        [-16, 4],
        [-24, 10],
      ]),
      straight([
        [16, 4],
        [24, 10],
      ]),
      straight([
        [-2, 12],
        [4, 12],
        [4, 18],
        [-2, 18],
        [-2, 12],
      ]),
    ],
  }),

  headset: (seed) => ({
    paths: [
      smoothPath(
        jitterPoints(
          [
            [-12, 2],
            [-10, -10],
            [0, -14],
            [10, -10],
            [12, 2],
          ],
          seed,
          0.4
        )
      ),
      straight([
        [12, 2],
        [13, 8],
      ]),
    ],
  }),

  camera: (seed) => ({
    paths: [
      straight([
        [-12, -6],
        [12, -6],
        [12, 8],
        [-12, 8],
        [-12, -6],
      ]),
      straight([
        [-4, -10],
        [4, -10],
        [6, -6],
        [-6, -6],
        [-4, -10],
      ]),
    ],
  }),
};

export const PROP_KEYS = Object.keys(PROPS);
