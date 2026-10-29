import { StrictMode } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";

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
