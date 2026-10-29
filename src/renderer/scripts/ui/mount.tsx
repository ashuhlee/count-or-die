import { StrictMode } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";

// Renders the whole page into #main. Synchronous, so app.ts can find the
// elements it attaches listeners to right after this returns.
export function mountApp(): void {
  const container = document.getElementById("main");
  if (!container) return;

  flushSync(() => {
    createRoot(container).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  });
}
