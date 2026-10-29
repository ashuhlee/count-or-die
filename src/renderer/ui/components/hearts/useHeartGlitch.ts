import { useEffect, useRef, type RefObject } from "react";
import { PowerGlitch, type GlitchResult } from "powerglitch";

const GLITCH_INTERVAL = 6000;
const STAGGER = 400;

// each heart glitches a little after the one before it, in this order
const ORDER = [4, 2, 1, 3];

// A brief glitch on a heart every few seconds. PowerGlitch wraps the image in
// extra elements itself, so it is set up once per heart and never remounted.
export function useHeartGlitch(
  ref: RefObject<HTMLImageElement | null>,
  heartNumber: number,
) {
  const glitch = useRef<GlitchResult | null>(null);

  useEffect(() => {
    const image = ref.current;
    if (!image) return;

    glitch.current ??= PowerGlitch.glitch(image, {
      playMode: "manual",
      timing: { duration: 2500, easing: "ease", iterations: 1 },
      glitchTimeSpan: { start: 0, end: 0.16 },
      shake: { velocity: 1 },
      slice: { count: 2, cssFilters: "brightness(1.05)", hueRotate: false },
    });
    const effect = glitch.current;

    let interval: ReturnType<typeof setInterval> | undefined;
    const first = setTimeout(
      () => {
        effect.startGlitch();
        interval = setInterval(effect.startGlitch, GLITCH_INTERVAL);
      },
      ORDER.indexOf(heartNumber) * STAGGER,
    );

    return () => {
      clearTimeout(first);
      clearInterval(interval);
      effect.stopGlitch();
    };
  }, [ref, heartNumber]);
}
