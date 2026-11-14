import { afterEach, beforeEach, expect, describe, test, vi } from "vitest";
import { act, createElement } from "react";

import { renderInto } from "../../helpers/dom.ts";

import ChallengeNotice from "../../../src/renderer/ui/screens/game-over/ChallengeNotice.tsx";
import {
  COLLAPSE_EXIT,
  EXIT,
  SHOWN_FOR,
} from "../../../src/renderer/ui/overlays/game-notification/useTimedNotification.ts";

describe("a challenge notification on the game over screen", () => {
  let container: HTMLDivElement;
  let unmount: () => void;

  const notice = () => container.querySelector<HTMLElement>("#challenge-0");
  const wait = (ms: number) => act(() => vi.advanceTimersByTime(ms));

  beforeEach(() => {
    vi.useFakeTimers();
    ({ container, unmount } = renderInto(
      createElement(ChallengeNotice, {
        text: "count to 30",
        border: "grey",
        visible: true,
        delay: 0,
        id: "challenge-0",
      }),
    ));
  });
  afterEach(() => {
    unmount();
    vi.useRealTimers();
  });

  test("slides out, and then closes the gap it leaves", () => {
    wait(SHOWN_FOR - 1);
    expect(notice().className).not.toContain("slide-out-left");

    wait(1);
    expect(notice().className).toContain("slide-out-left");
    expect(notice().className).toContain("game-notification--collapse");
    expect(notice().style.getPropertyValue("--collapse-from")).toMatch(/px$/);
  });

  test("stays until the gap is closed, so the ones below do not jump", () => {
    wait(SHOWN_FOR + EXIT);
    expect(notice()).not.toBeNull();

    wait(COLLAPSE_EXIT - EXIT);
    expect(notice()).toBeNull();
  });
});
