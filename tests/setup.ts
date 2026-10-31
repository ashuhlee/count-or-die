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

// the shaders need WebGL, which jsdom does not have
vi.mock("../src/renderer/ui/shaders/crt-shader/CRTShader.tsx", () => ({
  default: () => null,
}));
vi.mock(
  "../src/renderer/ui/shaders/melt-in-shader/MeltInShader.tsx",
  async () => {
    const { createElement, useEffect, useRef } = await import("react");
    return {
      default: ({
        ref,
        src,
        alt,
        className,
        active,
        mode,
        colors,
        delay,
        duration,
        onDone,
      }: {
        ref?: React.Ref<HTMLImageElement>;
        src: string;
        alt: string;
        className?: string;
        active: boolean;
        mode?: string;
        colors?: Record<string, string>;
        delay?: number;
        duration?: number;
        onDone?: () => void;
      }) => {
        // the melt takes as long as it was asked to, then says it is done
        const latestOnDone = useRef(onDone);
        useEffect(() => {
          latestOnDone.current = onDone;
        });
        useEffect(() => {
          if (!active || mode === "out") return;
          const timer = setTimeout(
            () => latestOnDone.current?.(),
            (delay ?? 0) + (duration ?? 1600),
          );
          return () => clearTimeout(timer);
        }, [active, mode, delay, duration]);

        return createElement("img", {
          ref,
          src,
          alt,
          className,
          "data-melt-active": String(active),
          "data-melt-mode": mode ?? "in",
          "data-melt-colors": JSON.stringify(colors ?? {}),
        });
      },
    };
  },
);
vi.mock(
  "../src/renderer/ui/shaders/pixel-swirl-shader/PixelSwirlShader.tsx",
  async () => {
    const { createElement } = await import("react");
    return {
      default: ({ paused, hue }: { paused?: boolean; hue?: number }) =>
        createElement("div", {
          "data-pixel-swirl-shader": "",
          "data-paused": String(paused ?? false),
          "data-hue": String(hue ?? 0),
        }),
    };
  },
);
