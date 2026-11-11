import { useEffect, type RefObject } from "react";

const BAR_WIDTH = 150;
const BAR_HEIGHT = 13;

const SPAWN_EVERY = 180;
const LIFETIME = 600;

const between = (min: number, max: number) => min + Math.random() * (max - min);

export function useProgressSparkles(
  fill: RefObject<HTMLElement | null>,
  area: RefObject<HTMLElement | null>,
  active: boolean,
) {
  useEffect(() => {
    if (!active) return;

    const timer = setInterval(() => {
      const bar = fill.current?.getBoundingClientRect();
      const box = area.current?.getBoundingClientRect();
      if (!bar || !box || !area.current || bar.width < 1 || box.width === 0) {
        return;
      }

      const end = ((bar.right - box.left) / box.width) * BAR_WIDTH;

      const size = Math.round(between(9, 14));
      const dot = document.createElement("span");
      dot.className = "pg-sparkle";

      dot.style.setProperty("--size", `${size}px`);
      dot.style.setProperty("--rot", `${between(0, 90)}deg`);
      dot.style.setProperty("--x", `${end - size / 2}px`);
      dot.style.setProperty(
        "--y",
        `${between(-size / 4, BAR_HEIGHT - (size * 3) / 4)}px`,
      );
      dot.style.setProperty("--dx", `${between(10, 30)}px`);
      dot.style.setProperty("--dy", `${between(-3.5, 3.5)}px`);

      area.current.appendChild(dot);

      setTimeout(() => dot.remove(), LIFETIME + 100);
    }, SPAWN_EVERY);

    return () => clearInterval(timer);
  }, [fill, area, active]);
}
