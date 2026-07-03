// Seeded RNG + Catmull-Rom spline helpers shared by the sketch background icon
// library. Everything here is deterministic given a numeric seed so server
// and client render identical markup (no hydration mismatches).

export type Point = [number, number];

export function mulberry32(seed: number) {
  let a = seed | 0;
  return function rand() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const round = (n: number) => Math.round(n * 100) / 100;

/** Jitter every point deterministically to fake an imperfect hand-drawn line. */
export function jitterPoints(points: Point[], seed: number, amt = 1): Point[] {
  const rand = mulberry32(seed);
  return points.map(([x, y]) => [
    x + (rand() * 2 - 1) * amt,
    y + (rand() * 2 - 1) * amt,
  ]);
}

/** Catmull-Rom -> cubic bezier, producing one smooth continuous path through all points. */
export function smoothPath(points: Point[], closed = false): string {
  if (points.length < 2) return "";
  const pts = closed
    ? [points[points.length - 1], ...points, points[0], points[1]]
    : points;
  const start = closed ? 1 : 0;
  const end = closed ? pts.length - 2 : pts.length - 1;
  let d = `M ${round(pts[start][0])},${round(pts[start][1])}`;
  for (let i = start; i < end; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1] || p1;
    const p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${round(c1x)},${round(c1y)} ${round(c2x)},${round(c2y)} ${round(
      p2[0]
    )},${round(p2[1])}`;
  }
  if (closed) d += " Z";
  return d;
}

/** A small irregular closed loop standing in for a "head" — a loose pencil scribble, not a circle. */
export function headLoop(cx: number, cy: number, r: number, seed: number): Point[] {
  const rand = mulberry32(seed);
  const n = 7;
  const pts: Point[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (0.85 + rand() * 0.3);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 1.08]);
  }
  return pts;
}

export function straight(points: Point[]): string {
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"}${round(p[0])},${round(p[1])}`)
    .join(" ");
}
