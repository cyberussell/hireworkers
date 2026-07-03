// Continuous-line worker figures. Each body part is its own short, smooth
// (non-retracing) Catmull-Rom curve — a scribbled head loop, a single
// flowing torso contour, two arm curves, two leg curves — so the gesture
// reads as a flowing hand-drawn sketch rather than a straight-line stick
// figure. Tools are drawn as crisp, mostly-straight shapes (a technical-
// drawing contrast to the loose figure gesture) so the profession stays
// identifiable at a glance.
import { headLoop, jitterPoints, smoothPath, straight, type Point } from "./utils";

export type Figure = { paths: string[] };
export type FigureBuilder = (seed: number) => Figure;

function head(seed: number, cx = 0, cy = -46, r = 8): string {
  return smoothPath(jitterPoints(headLoop(cx, cy, r, seed), seed, 0.4), true);
}

function curve(seed: number, pts: Point[], salt = 0): string {
  return smoothPath(jitterPoints(pts, seed + salt, 0.35));
}

// default relaxed torso/limb rig, overridden per-profession as needed
const TORSO: Point[] = [
  [-11, -36],
  [-9, -18],
  [-8, -2],
  [8, -2],
  [9, -18],
  [11, -36],
];

function legs(hipDrop = 0, spread = 9, footY = 38): Point[][] {
  return [
    [
      [-8, -2 + hipDrop],
      [-10 - spread * 0.1, 16],
      [-11, footY],
    ],
    [
      [8, -2 + hipDrop],
      [10 + spread * 0.1, 16],
      [11, footY],
    ],
  ];
}

export const FIGURES: Record<string, FigureBuilder> = {
  carpenter: (seed) => ({
    paths: [
      head(seed),
      curve(seed, TORSO, 1),
      curve(seed, [[-11, -34], [-22, -24], [-32, -10]], 2), // arm to ruler
      curve(seed, [[11, -34], [18, -22], [14, -6]], 3),
      ...legs().map((l, i) => curve(seed, l, 4 + i)),
      // long ruler with tick marks
      straight([[-32, -10], [-4, -30]]),
      straight([[-24, -13], [-21, -17]]),
      straight([[-16, -20], [-13, -24]]),
      // saw at hip
      straight([[13, -4], [24, 6]]),
      straight([[13, -4], [17, 2], [21, -2], [24, 6]]),
    ],
  }),

  electrician: (seed) => ({
    paths: [
      head(seed),
      curve(seed, TORSO, 1),
      curve(seed, [[-11, -34], [-20, -22], [-24, -8]], 2),
      curve(seed, [[11, -34], [20, -26], [28, -20]], 3),
      ...legs().map((l, i) => curve(seed, l, 4 + i)),
      // wall panel
      straight([[24, -34], [40, -34], [40, -10], [24, -10], [24, -34]]),
      // lightning bolt inside panel
      straight([[34, -30], [28, -20], [33, -20], [29, -12]]),
    ],
  }),

  plumber: (seed) => ({
    paths: [
      head(seed, 0, -44),
      curve(seed, TORSO.map(([x, y]) => [x, y + 4] as Point), 1),
      curve(seed, [[-11, -30], [-22, -16], [-28, 0]], 2),
      curve(seed, [[11, -30], [18, -14], [14, 4]], 3),
      ...legs(4, 9, 40).map((l, i) => curve(seed, l, 4 + i)),
      // pipe
      straight([[-34, 4], [-8, 4]]),
      straight([[-8, 4], [-8, -6]]),
      // pipe wrench
      straight([[14, 4], [26, -6]]),
      straight([[20, -14], [30, -10], [26, -2], [20, -6]]),
    ],
  }),

  mechanic: (seed) => ({
    paths: [
      head(seed),
      curve(seed, TORSO, 1),
      curve(seed, [[-11, -34], [-22, -22], [-30, -8]], 2),
      curve(seed, [[11, -34], [18, -20], [14, -4]], 3),
      ...legs().map((l, i) => curve(seed, l, 4 + i)),
      // wrench
      straight([[-30, -8], [-20, -18]]),
      straight([[-34, -4], [-30, -8], [-25, -11]]),
      // wheel
      `M 26,4 m -9,0 a 9,9 0 1 0 18,0 a 9,9 0 1 0 -18,0`,
      straight([[26, -3], [26, 11]]),
      straight([[19, 4], [33, 4]]),
    ],
  }),

  painter: (seed) => ({
    paths: [
      head(seed),
      curve(seed, TORSO, 1),
      curve(seed, [[-11, -34], [-20, -22], [-24, -8]], 2),
      curve(seed, [[11, -34], [20, -30], [26, -40]], 3),
      ...legs().map((l, i) => curve(seed, l, 4 + i)),
      // roller
      straight([[26, -40], [34, -50]]),
      straight([[28, -54], [40, -54], [40, -46], [28, -46], [28, -54]]),
      // drips
      straight([[30, -44], [30, -40]]),
      straight([[35, -44], [35, -41]]),
    ],
  }),

  gardener: (seed) => ({
    paths: [
      head(seed, 0, -40),
      curve(seed, TORSO.map(([x, y]) => [x, y + 6] as Point), 1),
      curve(seed, [[-11, -28], [-20, -16], [-26, -2]], 2),
      curve(seed, [[11, -28], [16, -18], [12, -6]], 3),
      // kneeling stance
      curve(seed, [[-8, 4], [-12, 20], [-20, 26]], 4),
      curve(seed, [[8, 4], [10, 22], [10, 34]], 5),
      // small potted plant
      straight([[-30, 8], [-20, 8], [-22, 16], [-28, 16], [-30, 8]]),
      curve(seed, [[-25, 8], [-25, -4], [-30, -10]], 6),
      curve(seed, [[-25, -2], [-20, -8]], 7),
    ],
  }),

  caregiver: (seed) => ({
    paths: [
      head(seed),
      curve(seed, TORSO, 1),
      curve(seed, [[-11, -34], [-16, -22], [-10, -12]], 2),
      curve(seed, [[11, -34], [16, -22], [10, -12]], 3),
      ...legs().map((l, i) => curve(seed, l, 4 + i)),
      // joined open hands
      curve(seed, [[-10, -12], [0, -8], [10, -12]], 6),
      // small heart above
      `M 0,-20 C -6,-27 -14,-20 0,-10 C 14,-20 6,-27 0,-20 Z`,
    ],
  }),

  chef: (seed) => ({
    paths: [
      head(seed, 0, -44),
      // toque puff
      `M -9,-50 C -13,-62 -3,-66 0,-58 C 3,-66 13,-62 9,-50 Z`,
      curve(seed, TORSO.map(([x, y]) => [x, y + 2] as Point), 1),
      curve(seed, [[-11, -32], [-20, -20], [-24, -8]], 2),
      curve(seed, [[11, -32], [18, -22], [22, -12]], 3),
      ...legs().map((l, i) => curve(seed, l, 4 + i)),
      // whisk
      straight([[22, -12], [30, -2]]),
      curve(seed, [[27, -6], [32, -2], [27, 2], [23, -2]], 8),
    ],
  }),

  baker: (seed) => ({
    paths: [
      head(seed, 0, -44),
      straight([[-8, -52], [8, -52], [8, -48], [-8, -48], [-8, -52]]),
      curve(seed, TORSO.map(([x, y]) => [x, y + 2] as Point), 1),
      curve(seed, [[-11, -30], [-20, -22], [-26, -20]], 2),
      curve(seed, [[11, -30], [20, -22], [26, -20]], 3),
      ...legs().map((l, i) => curve(seed, l, 4 + i)),
      // rolling pin
      straight([[-26, -20], [26, -20]]),
      straight([[-30, -20], [-26, -20]]),
      straight([[30, -20], [26, -20]]),
    ],
  }),

  barista: (seed) => ({
    paths: [
      head(seed),
      curve(seed, TORSO, 1),
      curve(seed, [[-11, -32], [-18, -20], [-22, -8]], 2),
      curve(seed, [[11, -32], [18, -22], [24, -14]], 3),
      ...legs().map((l, i) => curve(seed, l, 4 + i)),
      // cup + saucer
      straight([[18, -14], [30, -14], [28, -2], [20, -2], [18, -14]]),
      straight([[16, -2], [32, -2]]),
      // steam
      curve(seed, [[21, -18], [19, -24], [23, -28]], 9),
      curve(seed, [[26, -18], [24, -24], [28, -28]], 10),
    ],
  }),

  developer: (seed) => ({
    paths: [
      head(seed),
      curve(seed, TORSO, 1),
      curve(seed, [[-11, -30], [-16, -18], [-12, -8]], 2),
      curve(seed, [[11, -30], [16, -18], [12, -8]], 3),
      ...legs(0, 9, 34).map((l, i) => curve(seed, l, 4 + i)),
      // laptop
      straight([[-16, -8], [16, -8], [14, 2], [-14, 2], [-16, -8]]),
      straight([[-6, -3], [-2, -6], [-6, -9]]),
      straight([[6, -3], [2, -6], [6, -9]]),
    ],
  }),

  designer: (seed) => ({
    paths: [
      head(seed),
      curve(seed, TORSO, 1),
      curve(seed, [[-11, -30], [-14, -18], [-8, -8]], 2),
      curve(seed, [[11, -30], [20, -20], [26, -28]], 3),
      ...legs(0, 9, 34).map((l, i) => curve(seed, l, 4 + i)),
      // tablet
      straight([[-16, -6], [8, -6], [8, 4], [-16, 4], [-16, -6]]),
      // pen
      straight([[26, -28], [32, -34]]),
      straight([[31, -35], [34, -32], [32, -34]]),
    ],
  }),

  virtualAssistant: (seed) => ({
    paths: [
      head(seed),
      // headset arc
      curve(seed, [[-8, -52], [0, -58], [8, -52]], 11),
      straight([[8, -52], [10, -42]]),
      `M 10,-38 m -3,0 a 3,3 0 1 0 6,0 a 3,3 0 1 0 -6,0`,
      curve(seed, TORSO, 1),
      curve(seed, [[-11, -30], [-16, -18], [-12, -8]], 2),
      curve(seed, [[11, -30], [16, -18], [12, -8]], 3),
      ...legs(0, 9, 34).map((l, i) => curve(seed, l, 4 + i)),
      straight([[-16, -8], [16, -8], [14, 2], [-14, 2], [-16, -8]]),
    ],
  }),

  customerSupport: (seed) => ({
    paths: [
      head(seed),
      curve(seed, [[-8, -52], [0, -58], [8, -52]], 11),
      straight([[-8, -52], [-10, -42]]),
      `M -10,-38 m -3,0 a 3,3 0 1 0 6,0 a 3,3 0 1 0 -6,0`,
      curve(seed, TORSO, 1),
      curve(seed, [[-11, -30], [-16, -20], [-14, -12]], 2),
      curve(seed, [[11, -30], [18, -22], [24, -18]], 3),
      ...legs().map((l, i) => curve(seed, l, 4 + i)),
      // speech bubble
      straight([[24, -32], [38, -32], [38, -20], [28, -20], [24, -14], [26, -20], [24, -32]]),
    ],
  }),

  warehouseWorker: (seed) => ({
    paths: [
      head(seed, 0, -48),
      curve(seed, TORSO.map(([x, y]) => [x, y - 2] as Point), 1),
      curve(seed, [[-11, -36], [-20, -32], [-22, -42]], 2),
      curve(seed, [[11, -36], [20, -32], [22, -42]], 3),
      ...legs().map((l, i) => curve(seed, l, 4 + i)),
      // box
      straight([[-22, -44], [22, -44], [22, -24], [-22, -24], [-22, -44]]),
      straight([[-22, -44], [-8, -50], [8, -50], [22, -44]]),
      straight([[0, -44], [0, -50]]),
    ],
  }),

  welder: (seed) => ({
    paths: [
      head(seed, 0, -44, 9),
      // welding visor
      straight([[-9, -48], [9, -48], [7, -40], [-7, -40], [-9, -48]]),
      curve(seed, TORSO.map(([x, y]) => [x, y + 4] as Point), 1),
      curve(seed, [[-11, -30], [-20, -20], [-28, -24]], 2),
      curve(seed, [[11, -30], [18, -16], [14, 0]], 3),
      ...legs(4).map((l, i) => curve(seed, l, 4 + i)),
      // spark burst
      straight([[-30, -30], [-36, -36]]),
      straight([[-32, -22], [-40, -22]]),
      straight([[-28, -16], [-34, -12]]),
    ],
  }),

  mason: (seed) => ({
    paths: [
      head(seed),
      curve(seed, TORSO, 1),
      curve(seed, [[-11, -34], [-20, -22], [-26, -10]], 2),
      curve(seed, [[11, -34], [16, -20], [12, -6]], 3),
      ...legs().map((l, i) => curve(seed, l, 4 + i)),
      // trowel
      straight([[-26, -10], [-32, -2], [-24, -6], [-26, -10]]),
      // brick courses
      straight([[14, -10], [30, -10], [30, -4], [14, -4], [14, -10]]),
      straight([[14, -4], [30, -4], [30, 2], [14, 2], [14, -4]]),
      straight([[22, -10], [22, -4]]),
      straight([[22, -4], [22, 2]]),
    ],
  }),

  hvac: (seed) => ({
    paths: [
      head(seed),
      curve(seed, TORSO, 1),
      curve(seed, [[-11, -32], [-18, -20], [-22, -8]], 2),
      curve(seed, [[11, -32], [18, -24], [26, -20]], 3),
      ...legs().map((l, i) => curve(seed, l, 4 + i)),
      // fan housing
      `M 30,-20 m -10,0 a 10,10 0 1 0 20,0 a 10,10 0 1 0 -20,0`,
      curve(seed, [[30, -20], [34, -25], [30, -28]], 12),
      curve(seed, [[30, -20], [25, -25], [22, -20]], 13),
      curve(seed, [[30, -20], [26, -15], [30, -12]], 14),
    ],
  }),

  deliveryRider: (seed) => ({
    paths: [
      head(seed, -6, -30, 7),
      curve(seed, [[-6, -22], [4, -10], [12, 4]], 1), // leaning torso
      curve(seed, [[4, -10], [-4, -16], [-12, -8]], 2), // arm to handlebar
      curve(seed, [[4, -10], [14, -16], [22, -12]], 3), // arm back to seat
      // frame triangle
      straight([[-16, 20], [4, -10], [16, 20]]),
      straight([[-16, 20], [16, 20]]),
      // wheels
      `M -16,20 m -8,0 a 8,8 0 1 0 16,0 a 8,8 0 1 0 -16,0`,
      `M 16,20 m -8,0 a 8,8 0 1 0 16,0 a 8,8 0 1 0 -16,0`,
      // rear box
      straight([[16, -4], [28, -4], [28, 8], [16, 8], [16, -4]]),
    ],
  }),

  tailor: (seed) => ({
    paths: [
      head(seed),
      curve(seed, TORSO, 1),
      curve(seed, [[-11, -32], [-18, -20], [-24, -10]], 2),
      curve(seed, [[11, -32], [16, -22], [20, -12]], 3),
      ...legs().map((l, i) => curve(seed, l, 4 + i)),
      // scissors
      straight([[-24, -10], [-32, -2]]),
      straight([[-24, -10], [-32, -16]]),
      `M -33,0 m -2.5,0 a 2.5,2.5 0 1 0 5,0 a 2.5,2.5 0 1 0 -5,0`,
      `M -33,-18 m -2.5,0 a 2.5,2.5 0 1 0 5,0 a 2.5,2.5 0 1 0 -5,0`,
      // measuring tape spool
      `M 24,-8 m -6,0 a 6,6 0 1 0 12,0 a 6,6 0 1 0 -12,0`,
    ],
  }),
};

export const FIGURE_KEYS = Object.keys(FIGURES);
