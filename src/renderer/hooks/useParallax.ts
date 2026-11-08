import { useEffect } from "react";

const SMOOTHING = 0.1;
const LONGEST_FRAME = 0.1;
const SETTLED = 0.001;

type Scope = "parallax" | "modal-parallax";

const mouse = { x: 0, y: 0 };

const normalized = (event: PointerEvent) => ({
  x: (event.clientX / window.innerWidth - 0.5) * 2,
  y: (event.clientY / window.innerHeight - 0.5) * 2,
});

if (typeof window !== "undefined") {
  window.addEventListener("pointermove", (event) => {
    Object.assign(mouse, normalized(event));
  });
}

export function useParallax(active = true, scope: Scope = "parallax"): void {
  useEffect(() => {
    if (!active) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const page = document.documentElement;
    const nameX = `--${scope}-x`;
    const nameY = `--${scope}-y`;
    const kept = (name: string) =>
      scope === "parallax" ? parseFloat(page.style.getPropertyValue(name)) : 0;

    let x = kept(nameX) || 0;
    let y = kept(nameY) || 0;
    // the first smoothing step, between the mouse and the layers
    let midX = x;
    let midY = y;
    let targetX = mouse.x;
    let targetY = mouse.y;
    let frame = 0;
    let lastTime = 0;

    const step = (time: number) => {
      const seconds = Math.min(
        (time - (lastTime || time)) / 1000,
        LONGEST_FRAME,
      );
      lastTime = time;
      const share = 1 - Math.exp(-seconds / SMOOTHING);

      midX += (targetX - midX) * share;
      midY += (targetY - midY) * share;
      x += (midX - x) * share;
      y += (midY - y) * share;
      page.style.setProperty(nameX, x.toFixed(4));
      page.style.setProperty(nameY, y.toFixed(4));

      const settled =
        Math.abs(targetX - x) < SETTLED &&
        Math.abs(targetY - y) < SETTLED &&
        Math.abs(midX - x) < SETTLED &&
        Math.abs(midY - y) < SETTLED;
      if (settled) lastTime = 0;
      frame = settled ? 0 : requestAnimationFrame(step);
    };

    const onMove = (event: PointerEvent) => {
      ({ x: targetX, y: targetY } = normalized(event));
      if (!frame) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
      if (scope !== "parallax") {
        page.style.removeProperty(nameX);
        page.style.removeProperty(nameY);
      }
    };
  }, [active, scope]);
}
