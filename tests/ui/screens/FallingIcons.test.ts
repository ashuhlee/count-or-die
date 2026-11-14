import { act } from "react";
import { afterEach, beforeEach, expect, describe, test, vi } from "vitest";

import { fireAnimationEnd, stubWebAnimations } from "../../helpers/dom.ts";
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
  test("fall down the sides, one after the other, and not the middle", () => {
    const sides = icons().map((icon) =>
      icon.className.includes("falling-icon--left") ? "left" : "right",
    );
    expect(sides).toContain("left");
    expect(sides).toContain("right");
    // each is placed by how far across its side it is, so never past it
    for (const icon of icons()) {
      const along = parseFloat(icon.style.getPropertyValue("--along"));
      expect(along).toBeGreaterThanOrEqual(0);
      expect(along).toBeLessThanOrEqual(1);
      expect(icon.style.left).toBe("");
    }
  });

  test("can be dragged, and fall on from where they are let go", () => {
    const count = icons().length;
    expect(count).toBeGreaterThan(0);
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
    expect(icons()).toHaveLength(count);
  });

  test("never start together, even if they all finish at once", () => {
    // as when the tab was hidden while they fell: all of them end together
    const before = icons();
    for (const icon of before) fireAnimationEnd(icon, "falling-icon-fall");

    // each one is a new one, not the one that ended
    for (const icon of icons()) expect(before).not.toContain(icon);

    const delays = icons()
      .map((icon) => parseFloat(icon.style.getPropertyValue("--delay")))
      .sort((a, b) => a - b);
    expect(delays).toHaveLength(3);
    for (let i = 1; i < delays.length; i++) {
      expect(delays[i] - delays[i - 1]).toBeGreaterThanOrEqual(5 / 3 - 0.001);
    }
  });

  test("wait for the menu, and then start from above the screen", () => {
    // none of them is already on its way down
    for (const icon of icons()) {
      expect(
        parseFloat(icon.style.getPropertyValue("--delay")),
      ).toBeGreaterThan(0);
    }

    // and none moves while the startup screen is still up
    game.unmount();
    const startup = document.createElement("div");
    startup.id = "startup-screen";
    document.body.append(startup);
    game = renderGame({ startOnMenu: true });
    expect(document.querySelector(".falling-icons--waiting")).not.toBeNull();

    startup.classList.add("hiding");
    act(() => {
      window.dispatchEvent(new Event("startup-done"));
    });
    game.wait(300);
    expect(document.querySelector(".falling-icons--waiting")).toBeNull();

    startup.remove();
  });
});
