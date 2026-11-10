import { inject } from "@vercel/analytics";

import { shouldTrack } from "./analytics.ts";
import { viewportScale } from "./scale.ts";

const frame = document.getElementById("game") as HTMLIFrameElement;

function fit() {
  const { innerWidth: width, innerHeight: height } = window;
  const scale = viewportScale(width, height);

  frame.style.width = `${width / scale}px`;
  frame.style.height = `${height / scale}px`;
  frame.style.transform = `scale(${scale})`;
}

fit();

window.addEventListener("resize", fit);
new ResizeObserver(fit).observe(document.documentElement);
document.addEventListener("fullscreenchange", () => {
  fit();
  requestAnimationFrame(fit);
  setTimeout(fit, 250);
});

frame.addEventListener("load", () => frame.contentWindow?.focus());

if (shouldTrack(window.location.hostname)) inject();
