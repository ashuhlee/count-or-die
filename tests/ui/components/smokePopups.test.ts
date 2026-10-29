import {
  afterEach,
  beforeEach,
  expect,
  describe,
  test,
  vi,
} from "vite-plus/test";
import {
  act,
  createElement,
  type ComponentType,
  type ReactElement,
} from "react";

import { renderInto } from "../../helpers/dom.ts";

import SmokePopups from "../../../src/renderer/scripts/ui/components/smoke/SmokePopups.tsx";
import {
  showSmoke,
  smokeStore,
} from "../../../src/renderer/scripts/ui/components/smoke/smokeStore.ts";

describe("SmokePopups", () => {
  let container: HTMLDivElement;
  let unmount: () => void;
  const mount = (component: ReactElement | ComponentType) =>
    ({ container, unmount } = renderInto(component));
  beforeEach(() => {
    vi.useFakeTimers();
    smokeStore.reset();
    mount(createElement(SmokePopups));
  });

  afterEach(() => {
    unmount();
    vi.useRealTimers();
  });

  const popup = (id: string) =>
    container.querySelector<HTMLImageElement>(`#${id}`);

  test("renders both popups hidden", () => {
    expect(popup("popupElement")).not.toBeNull();
    expect(popup("powerUpUsedElement")).not.toBeNull();
    expect(popup("popupElement").style.display).toBe("");
  });

  test("shows a 70px smoke puff at the position, then hides after 3s", () => {
    act(() => showSmoke("popupElement", 120, 340));

    const el = popup("popupElement");
    expect(el.style.display).toBe("block");
    expect(el.style.left).toBe("120px");
    expect(el.style.top).toBe("340px");
    expect(el.style.width).toBe("70px");
    expect(el.style.height).toBe("70px");
    expect(el.getAttribute("src")).toContain("smoke");
    expect(popup("powerUpUsedElement").style.display).toBe("");

    act(() => vi.advanceTimersByTime(2999));
    expect(el.style.display).toBe("block");
    act(() => vi.advanceTimersByTime(1));
    expect(el.style.display).toBe("");
  });

  test("a new puff restarts the gif and the 3s", () => {
    act(() => showSmoke("popupElement", 1, 1));
    const firstSrc = popup("popupElement").getAttribute("src");

    act(() => vi.advanceTimersByTime(2000));
    vi.setSystemTime(Date.now() + 2000);
    act(() => showSmoke("popupElement", 5, 6));

    expect(popup("popupElement").getAttribute("src")).not.toBe(firstSrc);
    expect(popup("popupElement").style.left).toBe("5px");

    // the first puff's timer would have fired here
    act(() => vi.advanceTimersByTime(1500));
    expect(popup("popupElement").style.display).toBe("block");
    act(() => vi.advanceTimersByTime(1500));
    expect(popup("popupElement").style.display).toBe("");
  });
});
