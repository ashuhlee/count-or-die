// runs before every test file (see test.setupFiles in vite.config.ts)
// (vi.mock only gets hoisted above the imports when `vi` comes from "vitest")
import { vi } from "vitest";

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

(globalThis as { __APP_VERSION__?: string }).__APP_VERSION__ = "0.0.0-test";

window.HTMLMediaElement.prototype.play = () => Promise.resolve();
window.HTMLMediaElement.prototype.pause = () => {};

vi.mock("canvas-confetti", () => ({
  default: Object.assign(vi.fn(), { shapeFromPath: vi.fn() }),
}));

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
        instant,
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
        instant?: boolean;
        colors?: Record<string, string>;
        delay?: number;
        duration?: number;
        onDone?: () => void;
      }) => {
        const latestOnDone = useRef(onDone);
        useEffect(() => {
          latestOnDone.current = onDone;
        });
        useEffect(() => {
          if (!active || mode === "out") return;
          if ((globalThis as { __meltStuck?: boolean }).__meltStuck) return;
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
          "data-melt-instant": String(instant ?? false),
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
