import { act } from "react";
import { afterEach, beforeEach, expect, describe, test, vi } from "vitest";

import { stubWebAnimations } from "../../helpers/dom.ts";
import { MATH_FACTS } from "../../../src/renderer/game/mathFacts.ts";
import { renderGame } from "../../helpers/game.tsx";
import { handleMenuAction } from "../../../src/renderer/utils/app/menuActions.ts";

const audio = vi.hoisted(() => ({ playSound: vi.fn(), pauseSound: vi.fn() }));

vi.mock("../../../src/renderer/utils/app/sounds.ts", async (original) => ({
  ...(await original<
    typeof import("../../../src/renderer/utils/app/sounds.ts")
  >()),
  ...audio,
}));

let game: ReturnType<typeof renderGame>;
let animations: ReturnType<typeof stubWebAnimations>;

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  vi.clearAllMocks();
  animations = stubWebAnimations();
  vi.spyOn(Math, "random").mockReturnValue(0);
  game = renderGame({ startOnMenu: true });
});

afterEach(() => {
  game.unmount();
  animations.restore();
  delete window.electron;
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const sounds = () => audio.playSound.mock.calls.map(([name]) => name);
const stoppedSounds = () => audio.pauseSound.mock.calls.map(([name]) => name);

// the loading screen needs this long to cover the menu
const COVERED = 530;
// a round lasts 20 seconds; time is up a hair before
const TIME_IS_UP = 19900;

describe("the menu", () => {
  describe("the skull", () => {
    const hover = () =>
      act(() => {
        game
          .$(".skull-floor")
          .dispatchEvent(new MouseEvent("pointerover", { bubbles: true }));
      });
    const said = () =>
      document.querySelector(".chat-box")?.getAttribute("aria-label");

    test("says a math fact in a chat box when it is hovered", () => {
      expect(said()).toBeUndefined();

      hover();
      expect(MATH_FACTS).toContain(said());
      // it is a chat box, and not a tooltip
      expect(document.querySelector(".tooltip")).toBeNull();
    });

    test("says a different fact each time the menu is shown", () => {
      hover();
      const first = said();

      game.unmount();
      game = renderGame({ startOnMenu: true });
      hover();
      expect(said()).not.toBe(first);
    });
  });

  test("has two sparkles on the title, which twinkle once the menu is shown", () => {
    const sparkles = [
      ...document.querySelectorAll<HTMLElement>(".menu-sparkle"),
    ];
    expect(sparkles).toHaveLength(2);
    expect(sparkles.map((sparkle) => sparkle.className)).toEqual([
      expect.stringContaining("menu-sparkle--top-right"),
      expect.stringContaining("menu-sparkle--bottom-left"),
    ]);
    for (const sparkle of sparkles) {
      expect(sparkle.className).toContain("menu-sparkle--on");
    }
  });

  test("play covers the menu, then starts a game", () => {
    game.click("#play-btn");

    expect(sounds()).toContain("loading");
    expect(game.$("#loading-screen")).not.toBeNull();
    expect(game.$("#menu-screen")).not.toBeNull();

    game.wait(COVERED);
    expect(game.$("#menu-screen")).toBeNull();
    expect(game.counter()).toBe("00");
  });

  describe("the how to play button", () => {
    test("opens a popup that only informs, and the button closes it", () => {
      expect(game.$("#alert-popup")).toBeNull();

      game.click("#help-btn");
      expect(game.$("#alert-popup")).not.toBeNull();
      expect(game.$("#alert-yes")).toBeNull();

      game.click("#alert-close");
      game.wait(COVERED);
      expect(game.$("#alert-popup")).toBeNull();
      expect(game.$("#menu-screen")).not.toBeNull();
    });
  });

  describe("the app menu", () => {
    const popupTitle = () => game.$("#alert-popup")?.textContent ?? "";

    test("opens how to play and daily challenges", () => {
      act(() => handleMenuAction("open-help"));
      expect(popupTitle()).toContain("Reach the goal");

      game.click("#alert-close");
      game.wait(COVERED);
      expect(game.$("#alert-popup")).toBeNull();

      act(() => handleMenuAction("open-challenges"));
      expect(popupTitle()).toMatch(/Daily\s+challenges/);
    });

    test("does not stack one dialog on top of another", () => {
      act(() => handleMenuAction("open-help"));
      act(() => handleMenuAction("open-challenges"));

      expect(game.$$("#alert-popup")).toHaveLength(1);
      expect(popupTitle()).toContain("Reach the goal");
    });

    test("only opens how to play during a game, not the challenges", () => {
      game.click("#play-btn");
      game.wait(COVERED + 600);

      act(() => handleMenuAction("open-challenges"));
      expect(game.$("#alert-popup")).toBeNull();

      act(() => handleMenuAction("open-help"));
      expect(popupTitle()).toContain("Reach the goal");
      game.click("#alert-ok");
      game.wait(COVERED);

      // and the challenges did not wait to open on the menu
      expect(game.$("#alert-popup")).toBeNull();
    });
  });

  describe("the how to play button during a game", () => {
    beforeEach(() => {
      game.click("#play-btn");
      game.wait(COVERED + 600);
    });

    test("the time stands still while it is open, and goes on after", () => {
      game.wait(10000);
      game.click("#help-btn");

      game.wait(TIME_IS_UP * 3);
      expect(game.$("#red-flash").classList.contains("flash")).toBe(false);
      expect(game.$("#alert-popup")).not.toBeNull();

      game.click("#alert-ok");
      game.wait(TIME_IS_UP - 10000 - 1);
      expect(game.$("#red-flash").classList.contains("flash")).toBe(false);
      game.wait(1);
      expect(game.$("#red-flash").classList.contains("flash")).toBe(true);
    });
  });

  test("the home button leaves a game in progress for the menu", () => {
    game.click("#play-btn");
    game.wait(COVERED + 600);
    game.press("w");
    audio.pauseSound.mockClear();

    game.click("#home-btn");
    game.click("#alert-yes");
    expect(stoppedSounds()).toContain("bgMusic");
    game.wait(COVERED);

    expect(game.$("#menu-screen")).not.toBeNull();
    expect(game.$("#game-container")).toBeNull();
    expect(sounds().filter((name) => name === "menuMusic")).toHaveLength(2);
  });

  test("the home button asks first, and no stays in the game", () => {
    game.click("#play-btn");
    game.wait(COVERED + 600);
    game.press("w");
    expect(game.$("#alert-popup")).toBeNull();

    game.click("#home-btn");
    expect(game.$("#alert-popup")).not.toBeNull();
    expect(game.$("#menu-screen")).toBeNull();

    game.click("#alert-no");
    // it leaves with a fade
    game.wait(COVERED);
    expect(game.$("#alert-popup")).toBeNull();
    expect(game.$("#menu-screen")).toBeNull();
    expect(game.counter()).toBe("01");
  });
});
