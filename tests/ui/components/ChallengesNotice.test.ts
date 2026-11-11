import { afterEach, beforeEach, expect, describe, test, vi } from "vitest";
import { act, createElement } from "react";

import { renderInto } from "../../helpers/dom.ts";

import MenuBar from "../../../src/renderer/ui/components/hud/menu-bar/MenuBar.tsx";
import { playSound } from "../../../src/renderer/utils/app/sounds.ts";

vi.mock("../../../src/renderer/utils/app/sounds.ts", async (original) => ({
  ...(await original<
    typeof import("../../../src/renderer/utils/app/sounds.ts")
  >()),
  playSound: vi.fn(),
  pauseSound: vi.fn(),
}));

describe("the daily challenges notification", () => {
  let container: HTMLDivElement;
  let unmount: () => void;
  const onOpen = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    onOpen.mockClear();
    vi.mocked(playSound).mockClear();
    ({ container, unmount } = renderInto(
      createElement(MenuBar, {
        entrance: "play",
        challenges: { done: 1, total: 3, onOpen },
      }),
    ));
  });
  afterEach(() => unmount());

  test("opens the challenges and plays the button click", () => {
    const notice = container.querySelector("#challenges-notice");
    act(() => {
      notice.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(playSound).toHaveBeenCalledWith("buttonClick");
  });
});
