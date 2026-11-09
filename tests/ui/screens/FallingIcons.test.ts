import { act } from "react";
import { afterEach, beforeEach, expect, describe, test, vi } from "vitest";

import { stubWebAnimations } from "../../helpers/dom.ts";
import { renderGame } from "../../helpers/game.tsx";

vi.mock("../../../src/renderer/utils/app/sounds.ts", async (original) => ({
  ...(await original<
    typeof import("../../../src/renderer/utils/app/sounds.ts")
  >()),
  playSound: vi.fn(),
  pauseSound: vi.fn(),
}));

let game: ReturnType<typeof renderGame>;
let animations: ReturnType<typeof stubWebAnimations>;

beforeEach(() => {
  vi.useFakeTimers();
  animations = stubWebAnimations();
  game = renderGame({ startOnMenu: true });
});

afterEach(() => {
  game.unmount();
  animations.restore();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const icons = () => [
  ...document.querySelectorAll<HTMLElement>(".falling-icon"),
];

const pointer = (target: Element, type: string, x: number, y: number) =>
  act(() => {
    target.dispatchEvent(
      new MouseEvent(type, { bubbles: true, clientX: x, clientY: y }),
    );
  });

describe("the falling icons", () => {
  test("can be dragged, and fall on from where they are let go", () => {
    expect(icons()).toHaveLength(4);
    const icon = icons()[0];
    const start = icon.style.getPropertyValue("--start-x");

    pointer(icon, "pointerdown", 100, 100);
    expect(icon.className).toContain("falling-icon--held");

    pointer(icon, "pointermove", 140, 160);
    expect(icon.style.transform).toBe("translate(40px, 60px)");

    pointer(icon, "pointerup", 140, 160);
    // a new one in its place, which starts where the old one was let go
    const dropped = icons()[0];
    expect(dropped).not.toBe(icon);
    expect(dropped.className).not.toContain("falling-icon--held");
    expect(dropped.style.getPropertyValue("--start-x")).toBe("40px");
    expect(dropped.style.getPropertyValue("--start-x")).not.toBe(start);
    expect(dropped.style.getPropertyValue("--delay")).toBe("0s");
    expect(icons()).toHaveLength(4);
  });
});
