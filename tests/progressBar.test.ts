import {
  afterEach,
  beforeEach,
  expect,
  describe,
  test,
  vi,
} from "vite-plus/test";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";

import ProgressBar from "../src/renderer/scripts/react/ProgressBar.tsx";
import {
  barColors,
  progressBar,
} from "../src/renderer/scripts/react/progressBarStore.ts";

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

describe("ProgressBar", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => root.render(createElement(ProgressBar)));
    act(() => progressBar.reset(20));
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.useRealTimers();
  });

  const bar = () => container.querySelector<HTMLElement>("#progress-bar");

  // advance the fake clock to a point in the 20s countdown, then tick once
  function tickAt(seconds: number, highScore = false) {
    vi.setSystemTime(seconds * 1000);
    act(() => progressBar.tick(highScore));
  }

  test("renders the stripes, the bar and the background in order", () => {
    expect(Array.from(container.children).map((el) => el.className)).toEqual([
      "pg-lines",
      "progress-bar",
      "progress-bg",
    ]);
  });

  test("starts full, in the primary color, running the countdown", () => {
    expect(bar().style.animation).toContain(
      "progress-anim 20s linear infinite",
    );
    expect(bar().style.width).toBe("140px");
    expect(bar().style.background).toBe("rgb(180, 166, 255)");
  });

  test("changes color as time runs down", () => {
    tickAt(8); // 60% left
    expect(bar().style.background).toBe("rgb(180, 166, 255)");

    tickAt(12); // 40% left
    expect(bar().style.background).toBe("rgb(255, 177, 153)");
    expect(bar().style.animation).not.toContain("blink");

    tickAt(15); // 25% left
    expect(bar().style.background).toBe("rgb(247, 98, 139)");
    expect(bar().style.animation).toContain("blink 0.8s");

    tickAt(18); // 10% left
    expect(bar().style.animation).toContain("blink 0.5s");
  });

  test("uses the rainbow gradient for a high score while healthy", () => {
    tickAt(2, true);
    expect(bar().style.background).toBe(barColors.highScore);
  });

  test("announces when time runs out", () => {
    const onExpired = vi.fn();
    document.addEventListener("progressBarExp", onExpired);

    tickAt(19.9);
    expect(onExpired).not.toHaveBeenCalled();

    tickAt(19.99);
    expect(onExpired).toHaveBeenCalledTimes(1);

    document.removeEventListener("progressBarExp", onExpired);
  });

  test("stop() freezes the bar, reset() restarts it as a fresh element", () => {
    const before = bar();

    act(() => progressBar.stop());
    expect(bar().style.animation).toBe("none");

    tickAt(5);
    act(() => progressBar.reset(10));
    expect(bar()).not.toBe(before);
    expect(bar().style.animation).toContain(
      "progress-anim 10s linear infinite",
    );
    expect(bar().style.background).toBe("rgb(180, 166, 255)");
  });

  test("a restart goes back to the primary color", () => {
    tickAt(16);
    expect(bar().style.background).toBe("rgb(247, 98, 139)");

    act(() => progressBar.reset(20));
    expect(bar().style.background).toBe("rgb(180, 166, 255)");
    expect(bar().style.animation).not.toContain("blink");
  });
});
