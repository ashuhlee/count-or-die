import { StrictMode } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";

// Called once the vanilla containers have rendered their placeholders. Renders
// synchronously so the DOM is ready before app.ts looks elements up.
export function mountReact(): void {
  const container = document.getElementById("react-root");
  if (!container) return;

  flushSync(() => {
    createRoot(container).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  });
}
