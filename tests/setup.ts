// runs before every test file (see test.setupFiles in vite.config.ts)
// (vi.mock only gets hoisted above the imports when `vi` comes from "vitest")
import { vi } from "vitest";

// tells React that updates in tests are wrapped in act()
(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

// the real value is injected by Vite's `define` at build time
(globalThis as { __APP_VERSION__?: string }).__APP_VERSION__ = "0.0.0-test";

// jsdom cannot play or pause media
window.HTMLMediaElement.prototype.play = () => Promise.resolve();
window.HTMLMediaElement.prototype.pause = () => {};

// both libraries draw on a real canvas / rearrange the page themselves, which
// jsdom cannot do; the game only needs to be able to call them
vi.mock("powerglitch", () => ({
  PowerGlitch: {
    glitch: () => ({ containers: [], startGlitch() {}, stopGlitch() {} }),
  },
}));
vi.mock("canvas-confetti", () => ({ default: vi.fn() }));

// the game over background needs WebGL, which jsdom does not have
vi.mock("../src/renderer/ui/components/balatro/Balatro.tsx", async () => {
  const { createElement } = await import("react");
  return { default: () => createElement("div", { "data-balatro": "" }) };
});
