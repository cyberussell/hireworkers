"use client";

import { useEffect, useMemo, useState } from "react";
import { FIGURES } from "./figures";
import { PROPS } from "./props";
import { MARKS } from "./marks";
import { bandPlacements, type Placement } from "./placements";

const BAND_HEIGHT = 1400;
const FALLBACK_HEIGHT = 1600;

function IconIllustration({ placement }: { placement: Placement }) {
  const { kind, key, rotate, scale, opacity, seed } = placement;

  if (kind === "figure") {
    const fig = FIGURES[key]?.(seed);
    if (!fig) return null;
    return (
      <svg
        width={110}
        height={130}
        viewBox="-40 -62 80 124"
        style={{
          position: "absolute",
          left: `${placement.leftPct}%`,
          top: placement.topPx,
          transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${scale})`,
          opacity,
        }}
        aria-hidden
      >
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        >
          {fig.paths.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      </svg>
    );
  }

  if (kind === "prop") {
    const shape = PROPS[key]?.(seed);
    if (!shape) return null;
    return (
      <svg
        width={56}
        height={56}
        viewBox="-24 -24 48 48"
        style={{
          position: "absolute",
          left: `${placement.leftPct}%`,
          top: placement.topPx,
          transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${scale})`,
          opacity,
        }}
        aria-hidden
      >
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        >
          {shape.paths.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      </svg>
    );
  }

  const mark = MARKS[key]?.(seed);
  if (!mark) return null;
  return (
    <svg
      width={80}
      height={80}
      viewBox="-40 -40 80 80"
      style={{
        position: "absolute",
        left: `${placement.leftPct}%`,
        top: placement.topPx,
        transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${scale})`,
        opacity,
      }}
      aria-hidden
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={0.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      >
        {mark.paths?.map((d, i) => <path key={`s${i}`} d={d} />)}
        {mark.dashedPaths?.map((d, i) => (
          <path key={`d${i}`} d={d} strokeDasharray="3 4" />
        ))}
        {mark.texts?.map((t, i) => (
          <text
            key={`t${i}`}
            x={t.x}
            y={t.y}
            fontSize={7}
            fontStyle="italic"
            stroke="none"
            fill="currentColor"
            transform={`rotate(${t.rotate} ${t.x} ${t.y})`}
          >
            {t.content}
          </text>
        ))}
      </g>
    </svg>
  );
}

function Band({ bandIndex, top }: { bandIndex: number; top: number }) {
  const placements = useMemo(
    () => bandPlacements(bandIndex, BAND_HEIGHT),
    [bandIndex]
  );
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, height: BAND_HEIGHT }}>
      {placements.map((p, i) => (
        <IconIllustration key={i} placement={p} />
      ))}
    </div>
  );
}

/**
 * Site-wide graphite sketch background. Renders as a living library of small
 * independent SVG illustrations (not a tiled background image), scattered in
 * repeating-but-never-identical "bands" that stretch to match the actual
 * rendered height of the page, so the sketchbook feel continues no matter
 * how far the page scrolls.
 */
export function SketchBackground() {
  const [height, setHeight] = useState(FALLBACK_HEIGHT);

  useEffect(() => {
    const update = () =>
      setHeight(Math.max(document.documentElement.scrollHeight, window.innerHeight));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(document.body);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const bandCount = Math.max(1, Math.ceil(height / BAND_HEIGHT));

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden"
      style={{
        height,
        color: "var(--sketch-line)",
        opacity: "var(--sketch-opacity)",
      }}
    >
      {Array.from({ length: bandCount }, (_, i) => (
        <Band key={i} bandIndex={i} top={i * BAND_HEIGHT} />
      ))}
    </div>
  );
}
