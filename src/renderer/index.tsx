import "animate.css/animate.min.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import gameOverGif from "@assets/ui/deco/game_over.gif";

import App from "./App.tsx";
import { checkHardwareAcceleration } from "./utils/app/hardwareAcceleration.ts";
import { afterPaint, hideStartupScreen, preload } from "./utils/app/startup.ts";

const pictures = import.meta.glob(
  [
    "@assets/**/*.{png,gif,svg}",
    "!@assets/favicon/**",
    "!@assets/ui/deco/game_over.gif",
  ],
  {
    eager: true,
    import: "default",
    query: "?url",
  },
) as Record<string, string>;

const LATER = [gameOverGif];
const LATER_DELAY = 1000;
const fetched: HTMLImageElement[] = [];

function fetchLater(): void {
  setTimeout(() => {
    for (const url of LATER) {
      const image = new Image();
      image.src = url;
      fetched.push(image);
    }
  }, LATER_DELAY);
}

async function alertHardwareAcceleration(): Promise<void> {
  if (checkHardwareAcceleration()) return;

  if (window.electron) {
    await window.electron.showGpuWarning();
  } else {
    alert(
      "Graphic hardware acceleration is disabled. The game requires it for proper performance!",
    );
  }
}

async function start(): Promise<void> {
  await alertHardwareAcceleration();
  await preload(Object.values(pictures));
  createRoot(document.getElementById("main")).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  await afterPaint();
  await hideStartupScreen();
  fetchLater();
}

document.addEventListener("DOMContentLoaded", () => {
  void start();
});
