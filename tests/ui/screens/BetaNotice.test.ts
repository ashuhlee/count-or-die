import { act } from "react";
import { afterEach, beforeEach, expect, describe, test, vi } from "vitest";

import { stubWebAnimations } from "../../helpers/dom.ts";
import { renderGame } from "../../helpers/game.tsx";
import { betaNoticeHidden } from "../../../src/renderer/utils/storage/betaNotice.ts";

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
  localStorage.clear();
  animations = stubWebAnimations();
  vi.spyOn(Math, "random").mockReturnValue(0);
  game = renderGame({ startOnMenu: true, betaNotice: true });
});

afterEach(() => {
  game.unmount();
  animations.restore();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("the beta notice", () => {
  test("opens first, and the menu comes in once it is closed", () => {
    expect(game.$("#beta-notice")).not.toBeNull();
    expect(game.$("#menu-screen").className).not.toContain("hue-in");

    // the menu drips in over the notice, which goes when that is done
    game.click("#beta-notice-btn");
    expect(game.$(".menu-reveal--dripping")).not.toBeNull();
    expect(game.$(".menu-flash")).not.toBeNull();
    expect(game.$("#beta-notice")).not.toBeNull();
    expect(game.$("#menu-screen").className).toContain("hue-in");

    game.wait(1000);
    expect(game.$("#beta-notice")).toBeNull();
    expect(game.$(".menu-reveal--dripping")).toBeNull();
    expect(game.$(".menu-flash")).toBeNull();
  });

  test("only offers to hide itself from the second time", () => {
    expect(game.$("#beta-notice-never-btn")).toBeNull();
    game.click("#beta-notice-btn");

    game.unmount();
    game = renderGame({ startOnMenu: true, betaNotice: true });
    expect(game.$("#beta-notice-never-btn")).not.toBeNull();
  });

  test("remembers a request not to show it again", () => {
    localStorage.setItem("betaNoticeSeen", "1");
    game.unmount();
    game = renderGame({ startOnMenu: true, betaNotice: true });

    game.click("#beta-notice-never-btn");
    expect(game.$(".menu-reveal--dripping")).not.toBeNull();
    expect(betaNoticeHidden()).toBe(true);

    game.wait(1000);
    expect(game.$("#beta-notice")).toBeNull();
  });

  test("is already open under the startup screen, so the menu never shows between them", () => {
    game.unmount();
    const startup = document.createElement("div");
    startup.id = "startup-screen";
    document.body.append(startup);

    game = renderGame({ startOnMenu: true, betaNotice: true });
    expect(game.$("#beta-notice")).not.toBeNull();

    startup.classList.add("hiding");
    act(() => {
      window.dispatchEvent(new Event("startup-done"));
    });
    game.wait(300);
    expect(game.$("#beta-notice")).not.toBeNull();
    expect(game.$("#menu-screen").className).not.toContain("hue-in");

    startup.remove();
  });
});
