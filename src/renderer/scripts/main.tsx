import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./ui/App.tsx";
import checkHardwareAcceleration from "./utils/hardwareAcceleration.ts";

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

  createRoot(document.getElementById("main")).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

document.addEventListener("DOMContentLoaded", () => {
  void start();
});
