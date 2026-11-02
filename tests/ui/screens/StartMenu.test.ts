import { afterEach, beforeEach, expect, describe, test, vi } from "vitest";

import { act } from "react";
import { stubWebAnimations } from "../../helpers/dom.ts";
import { renderGame } from "../../helpers/game.tsx";
import { audioConfig } from "../../../src/renderer/utils/app/sounds.ts";
import { hideStartupScreen } from "../../../src/renderer/utils/app/startup.ts";

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

describe("the menu with the startup screen up", () => {
  beforeEach(() => {
    game.unmount();
    document.body.insertAdjacentHTML(
      "beforeend",
      '<div id="startup-screen"></div>',
    );
    game = renderGame({ startOnMenu: true });
  });
  afterEach(() => document.getElementById("startup-screen")?.remove());

  test("keeps its song quiet until the screen has gone", async () => {
    // the outer beforeEach drew the menu once before the screen was up
    audio.playSound.mockClear();
    expect(sounds()).not.toContain("menuMusic");

    let hiding!: Promise<void>;
    await act(async () => {
      hiding = hideStartupScreen(100, 300);
      await vi.advanceTimersByTimeAsync(100);
    });
    expect(sounds().filter((name) => name === "menuMusic")).toHaveLength(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
      await hiding;
    });
  });
});

describe("the menu", () => {
  test("is what the app opens on, with play, report a bug and quit buttons", () => {
    expect(game.$("#menu-screen")).not.toBeNull();
    expect(
      game
        .$$(".menu-btn")
        .map((button) => button.textContent.replace(/\u00a0/g, " ")),
    ).toEqual(["Play game", "Report a bug", "Quit"]);
    expect(game.$("#game-container")).toBeNull();
  });

  test("follows the saved sound settings", () => {
    game.unmount();
    localStorage.setItem("soundState", "2");
    game = renderGame({ startOnMenu: true });

    expect(audioConfig.bgMusic.audio.muted).toBe(true);

    audioConfig.bgMusic.audio.muted = false;
  });

  test("plays its own song, once", () => {
    expect(sounds().filter((name) => name === "menuMusic")).toHaveLength(1);
  });

  test("stops its song the moment play is pressed", () => {
    expect(stoppedSounds()).not.toContain("menuMusic");

    game.click("#play-btn");
    expect(stoppedSounds()).toContain("menuMusic");
    // the game's song waits for the game
    expect(sounds()).not.toContain("bgMusic");
  });

  test("the game's song takes over once the game has started", () => {
    game.click("#play-btn");
    game.wait(COVERED);

    expect(stoppedSounds()).toContain("menuMusic");
    expect(sounds()).toContain("bgMusic");
  });

  test("plays its song again after coming back from a game", () => {
    game.click("#play-btn");
    game.wait(COVERED + 600);
    game.wait(TIME_IS_UP);

    game.click("#menu-btn");
    game.wait(COVERED + 600);
    expect(sounds().filter((name) => name === "menuMusic")).toHaveLength(2);
  });

  test("plays no game music, not even once the startup screen has gone", () => {
    game.wait(5000);

    expect(sounds()).not.toContain("bgMusic");
  });

  test("the game's music starts with the game", () => {
    game.click("#play-btn");
    expect(sounds()).not.toContain("bgMusic");

    game.wait(COVERED);
    expect(sounds().filter((name) => name === "bgMusic")).toHaveLength(1);
  });

  test("going back to the menu does not bring the game music back", () => {
    game.click("#play-btn");
    game.wait(COVERED + 600);
    game.wait(TIME_IS_UP);
    const before = sounds().filter((name) => name === "bgMusic").length;

    game.click("#menu-btn");
    game.wait(COVERED + 600);
    expect(game.$("#menu-screen")).not.toBeNull();
    expect(sounds().filter((name) => name === "bgMusic").length).toBe(before);
  });

  test("does not run a game behind it", () => {
    game.wait(TIME_IS_UP * 2);
    game.press(" ");
    game.press("w");

    expect(game.$("#menu-screen")).not.toBeNull();
    expect(sounds()).not.toContain("gameOver");
    expect(game.$("#counter")).toBeNull();
  });

  test("Escape says the settings are not there yet", () => {
    expect(game.$("#options-notice")).toBeNull();

    game.press("Escape");
    expect(game.$("#options-notice")).not.toBeNull();
  });

  test("play covers the menu, then starts a game", () => {
    game.click("#play-btn");

    expect(sounds()).toContain("buttonClick");
    expect(game.$("#loading-screen")).not.toBeNull();
    expect(game.$("#menu-screen")).not.toBeNull();

    game.wait(COVERED);
    expect(game.$("#menu-screen")).toBeNull();
    expect(game.counter()).toBe("00");
  });

  test("the countdown starts when the game does, not before", () => {
    game.wait(TIME_IS_UP);
    game.click("#play-btn");
    game.wait(COVERED);
    expect(sounds()).not.toContain("gameOver");

    game.wait(TIME_IS_UP);
    expect(sounds()).toContain("gameOver");
  });

  test("the keys work once the game has started", () => {
    game.click("#play-btn");
    game.wait(COVERED);
    game.press("w");

    expect(game.counter()).toBe("01");
  });

  test("clicking play again while it loads does not start it twice", () => {
    game.click("#play-btn");
    game.wait(100);
    game.click("#play-btn");

    expect(sounds().filter((name) => name === "buttonClick")).toHaveLength(1);
  });

  test("report a bug opens the bug report page in the app's browser", () => {
    window.electron = {
      setDiscordStatus: vi.fn(),
      quitApp: vi.fn(),
      reportBug: vi.fn(),
      showGpuWarning: vi.fn(),
    } as unknown as Window["electron"];
    game.click("#report-bug-btn");

    expect(sounds()).toContain("buttonClick");
    expect(window.electron.reportBug).toHaveBeenCalledTimes(1);
  });

  test("report a bug opens a new tab in the browser", () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    game.click("#report-bug-btn");

    expect(open).toHaveBeenCalledWith(
      "https://github.com/ashuhlee/count-or-die/issues/new",
      "_blank",
      "noopener",
    );
  });

  test("the github button opens the project page in the app's browser", () => {
    window.electron = {
      setDiscordStatus: vi.fn(),
      quitApp: vi.fn(),
      openGithub: vi.fn(),
      showGpuWarning: vi.fn(),
    } as unknown as Window["electron"];
    game.click("#github-btn");

    expect(sounds()).not.toContain("buttonClick");
    expect(window.electron.openGithub).toHaveBeenCalledTimes(1);
  });

  test("the github button opens a new tab in the browser", () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    game.click("#github-btn");

    expect(open).toHaveBeenCalledWith(
      "https://github.com/ashuhlee/count-or-die",
      "_blank",
      "noopener",
    );
  });

  test("quit closes the app after a moment", () => {
    window.electron = {
      setDiscordStatus: vi.fn(),
      quitApp: vi.fn(),
      showGpuWarning: vi.fn(),
    } as unknown as Window["electron"];
    game.click("#quit-game-btn");

    expect(sounds()).toContain("buttonClick");
    expect(window.electron.quitApp).not.toHaveBeenCalled();
    game.wait(400);
    expect(window.electron.quitApp).toHaveBeenCalledTimes(1);
  });

  test("quit says thanks in the browser", () => {
    const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
    game.click("#quit-game-btn");

    expect(alert).toHaveBeenCalledWith("Thank you for playing!");
  });

  test("the home button is only there during a game", () => {
    expect(game.$("#home-btn")).toBeNull();

    game.click("#play-btn");
    game.wait(COVERED + 600);
    expect(game.$("#home-btn")).not.toBeNull();
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

  describe("while the home button asks", () => {
    beforeEach(() => {
      game.click("#play-btn");
      game.wait(COVERED + 600);
    });

    test("the time stands still, and goes on where it was after no", () => {
      game.wait(10000);
      game.click("#home-btn");

      game.wait(TIME_IS_UP * 3);
      expect(game.$("#red-flash").classList.contains("flash")).toBe(false);
      expect(game.$("#alert-popup")).not.toBeNull();

      game.click("#alert-no");
      game.wait(TIME_IS_UP - 10000 - 1);
      expect(game.$("#red-flash").classList.contains("flash")).toBe(false);
      game.wait(1);
      expect(game.$("#red-flash").classList.contains("flash")).toBe(true);
    });

    test("a click on the dimmed background says no", () => {
      game.click("#home-btn");

      game.click("#alert-popup");
      expect(game.$("#alert-popup")).not.toBeNull();

      game.click(".alert-popup");
      game.wait(COVERED);
      expect(game.$("#alert-popup")).toBeNull();
      expect(game.$("#menu-screen")).toBeNull();
    });

    test("Escape says no, and does not bring up the settings", () => {
      game.click("#home-btn");

      game.press("Escape");
      game.wait(COVERED);
      expect(game.$("#alert-popup")).toBeNull();
      expect(game.$("#menu-screen")).toBeNull();
      expect(game.$("#options-notice")).toBeNull();

      game.press("Escape");
      expect(game.$("#options-notice")).not.toBeNull();
    });

    test("the page says it is paused, so the animations can hold", () => {
      expect(document.documentElement.hasAttribute("data-paused")).toBe(false);

      game.click("#home-btn");
      expect(document.documentElement.hasAttribute("data-paused")).toBe(true);

      game.click("#alert-no");
      expect(document.documentElement.hasAttribute("data-paused")).toBe(false);
    });

    test("the keys and buttons do nothing", () => {
      game.click("#home-btn");
      game.press("w");
      game.press(" ");
      game.click("#increase-img");
      expect(game.counter()).toBe("00");

      game.click("#alert-no");
      game.press("w");
      expect(game.counter()).toBe("01");
    });

    test("no power-up comes, until the wait that was left is over", () => {
      game.wait(5000);
      game.click("#home-btn");
      game.wait(20000);
      expect(game.$$(".power-up-img")).toHaveLength(0);

      game.click("#alert-no");
      game.wait(999);
      expect(game.$$(".power-up-img")).toHaveLength(0);
      game.wait(1);
      expect(game.$$(".power-up-img")).toHaveLength(1);
    });
  });

  test("the title only melts in when coming back from a game", () => {
    const title = () => game.$(".menu-title").dataset.meltInstant;
    expect(title()).toBe("true");

    game.click("#play-btn");
    game.wait(COVERED + 600);
    game.press("w");
    game.wait(TIME_IS_UP);
    game.click("#menu-btn");
    game.wait(COVERED + 600);

    expect(game.$("#menu-screen")).not.toBeNull();
    expect(title()).toBe("false");
  });

  test("Discord shows the main menu, and the game once it has started", () => {
    game.unmount();
    const setDiscordStatus = vi.fn();
    window.electron = {
      setDiscordStatus,
      quitApp: vi.fn(),
      showGpuWarning: vi.fn(),
    } as unknown as Window["electron"];
    game = renderGame({ startOnMenu: true });
    expect(setDiscordStatus).toHaveBeenLastCalledWith({
      gameStatusRPC: "menu",
    });

    game.click("#play-btn");
    game.wait(COVERED);
    expect(setDiscordStatus).toHaveBeenLastCalledWith({
      gameStatusRPC: "in-game",
    });

    game.wait(TIME_IS_UP);
    game.click("#menu-btn");
    game.wait(COVERED + 600);
    expect(setDiscordStatus).toHaveBeenLastCalledWith({
      gameStatusRPC: "menu",
    });
  });

  test("going back to the menu after a game leaves a fresh game to play", () => {
    game.click("#play-btn");
    game.wait(COVERED + 600);
    game.press("w");
    game.wait(TIME_IS_UP);
    expect(game.$("#game-over")).not.toBeNull();

    game.click("#menu-btn");
    game.wait(COVERED + 600);
    expect(game.$("#menu-screen")).not.toBeNull();

    game.click("#play-btn");
    game.wait(COVERED);
    expect(game.counter()).toBe("00");
    expect(game.$("#game-over").classList.contains("visible")).toBe(false);
  });
});
