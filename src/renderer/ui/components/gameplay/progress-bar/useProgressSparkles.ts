import { useEffect, type RefObject } from "react";
import { rem } from "../../../../utils/app/scale.ts";

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

      dot.style.setProperty("--size", rem(size));
      dot.style.setProperty("--rot", `${between(0, 90)}deg`);
      dot.style.setProperty("--x", rem(end - size / 2));
      dot.style.setProperty(
        "--y",
        rem(between(-size / 4, BAR_HEIGHT - (size * 3) / 4)),
      );
      dot.style.setProperty("--dx", rem(between(10, 30)));
      dot.style.setProperty("--dy", rem(between(-3.5, 3.5)));

      area.current.appendChild(dot);

      setTimeout(() => dot.remove(), LIFETIME + 100);
    }, SPAWN_EVERY);

    return () => clearInterval(timer);
  }, [fill, area, active]);
}
