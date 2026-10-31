import "animate.css/animate.min.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import { checkHardwareAcceleration } from "./utils/hardwareAcceleration.ts";
import { afterPaint, hideStartupScreen, preload } from "./utils/startup.ts";

// every picture, so the first screen never waits on one
const pictures = import.meta.glob("@assets/**/*.{png,gif,svg}", {
  eager: true,
  import: "default",
  query: "?url",
}) as Record<string, string>;

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
}

document.addEventListener("DOMContentLoaded", () => {
  void start();
});
