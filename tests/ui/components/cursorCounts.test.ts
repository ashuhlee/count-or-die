import { afterEach, beforeEach, expect, describe, test } from "vite-plus/test";
import { act, type ComponentType, type ReactElement } from "react";

import { renderInto } from "../../helpers/dom.ts";

import CursorCounts from "../../../src/renderer/scripts/ui/components/cursor-counts/CursorCounts.tsx";
import {
  cursorStore,
  displayCursorCount,
} from "../../../src/renderer/scripts/ui/components/cursor-counts/cursorStore.ts";

describe("CursorCounts", () => {
  let container: HTMLDivElement;
  let unmount: () => void;
  const mount = (component: ReactElement | ComponentType) =>
    ({ container, unmount } = renderInto(component));
  let finish: Array<() => void>;

  beforeEach(() => {
    finish = [];
    // jsdom has no Web Animations API
    Element.prototype.animate = (() => ({
      addEventListener: (_: string, cb: () => void) => finish.push(cb),
      removeEventListener: () => {},
      cancel: () => {},
    })) as unknown as typeof Element.prototype.animate;
    mount(CursorCounts);
  });
  afterEach(() => {
    unmount();
    cursorStore.getSnapshot().forEach((c) => cursorStore.remove(c.id));
    delete (Element.prototype as { animate?: unknown }).animate;
  });

  const spans = () => container.querySelectorAll<HTMLElement>(".count-cursor");
  const click = { clientX: 40, clientY: 60 } as MouseEvent;

  test("renders +N at the pointer and removes it when the animation ends", () => {
    act(() => displayCursorCount(5, click, false));

    expect(spans().length).toBe(1);
    expect(spans()[0].textContent).toBe("+5");
    expect(spans()[0].style.left).toBe("40px");
    expect(spans()[0].style.top).toBe("60px");

    act(() => finish[0]());
    expect(spans().length).toBe(0);
  });

  test("boosted counts cycle through colors, plain ones stay white", () => {
    act(() => {
      displayCursorCount(1, click, true);
      displayCursorCount(2, click, true);
      displayCursorCount(3, click, false);
    });

    const [a, b, c] = Array.from(spans()).map((s) => s.style.color);
    expect(a).not.toBe(b);
    expect(c).toBe("rgb(255, 255, 255)");
  });
});
