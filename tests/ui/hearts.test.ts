import {
  afterEach,
  beforeEach,
  expect,
  describe,
  test,
  vi,
} from "vite-plus/test";
import { act } from "react";

import Hearts from "../../src/renderer/scripts/ui/hearts/Hearts.tsx";
import {
  heartStore,
  removeHeart,
  replenishHearts,
  resetHearts,
} from "../../src/renderer/scripts/ui/hearts/heartStore.ts";
import { fireAnimationEnd, renderInto } from "../helpers/dom.ts";

describe("Hearts", () => {
  let container: HTMLDivElement;
  let unmount: () => void;

  beforeEach(() => {
    vi.useFakeTimers();
    ({ container, unmount } = renderInto(Hearts));
  });

  afterEach(() => {
    unmount();
    heartStore.reset();
    vi.useRealTimers();
  });

  const heart = (n: number) => container.querySelector(`#boost-${n}`);
  const noBoosts = () =>
    container.querySelector<HTMLElement>("#no-boosts").style.display;

  test("renders four visible hearts and hides the no-boosts text", () => {
    for (let n = 1; n <= 4; n++) {
      expect(heart(n)).not.toBeNull();
      expect(heart(n).classList.contains("heart-use")).toBe(false);
    }
    expect(noBoosts()).toBe("none");
  });

  test("removeHeart() hides the matching heart", () => {
    act(() => removeHeart(3));

    expect(heart(4).classList.contains("heart-use")).toBe(true);
    expect(heart(3).classList.contains("heart-use")).toBe(false);
    expect(noBoosts()).toBe("none");
  });

  test("using the last boost shows the no-boosts text", () => {
    act(() => removeHeart(0));

    expect(heart(1).classList.contains("heart-use")).toBe(true);
    expect(noBoosts()).toBe("grid");
  });

  test("resetHearts() brings everything back", () => {
    act(() => {
      removeHeart(1);
      removeHeart(0);
    });
    act(() => resetHearts());

    expect(container.querySelectorAll(".heart-use").length).toBe(0);
    expect(noBoosts()).toBe("none");
  });

  test("replenishHearts() restores used hearts, staggered", () => {
    act(() => {
      removeHeart(2);
      removeHeart(1);
      removeHeart(0);
    });

    act(() => replenishHearts(3, "replenish_boosts"));
    act(() => vi.advanceTimersByTime(0));
    expect(heart(1).classList.contains("heart-restore")).toBe(true);
    expect(heart(2).classList.contains("heart-use")).toBe(true);
    expect((heart(1) as HTMLElement).style.animationDelay).toBe("0s");
    expect(noBoosts()).toBe("none");

    act(() => vi.advanceTimersByTime(300));
    expect(heart(2).classList.contains("heart-restore")).toBe(true);
    expect(heart(3).classList.contains("heart-restore")).toBe(true);
    expect(container.querySelectorAll(".heart-use").length).toBe(0);
  });

  test("heart-restore is removed once its own animation ends", () => {
    act(() => removeHeart(0));
    act(() => replenishHearts(1, "extra_boost"));
    act(() => vi.advanceTimersByTime(0));
    expect(heart(1).classList.contains("heart-restore")).toBe(true);

    fireAnimationEnd(heart(1));

    expect(heart(1).classList.contains("heart-restore")).toBe(false);
    expect((heart(1) as HTMLElement).style.animationDelay).toBe("");
  });
});
