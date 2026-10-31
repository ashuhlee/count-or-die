import { afterEach, beforeEach, expect, describe, test, vi } from "vitest";

import { act } from "react";
import { stubWebAnimations } from "../../helpers/dom.ts";
import { renderGame } from "../../helpers/game.tsx";
import { audioConfig } from "../../../src/renderer/utils/sounds.ts";
import { hideStartupScreen } from "../../../src/renderer/utils/startup.ts";

const audio = vi.hoisted(() => ({ playSound: vi.fn(), pauseSound: vi.fn() }));

vi.mock("../../../src/renderer/utils/sounds.ts", async (original) => ({
  ...(await original<typeof import("../../../src/renderer/utils/sounds.ts")>()),
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

  test("holds the sound and settings buttons back until the screen has gone", async () => {
    const buttons = () => game.$$<HTMLElement>(".controls .round-btn");
    for (const button of buttons()) {
      expect(button.style.animationPlayState).toBe("paused");
    }

    let hiding!: Promise<void>;
    await act(async () => {
      hiding = hideStartupScreen(100, 300);
      await vi.advanceTimersByTimeAsync(100);
    });
    for (const button of buttons()) {
      expect(button.style.animationPlayState).toBe("running");
    }

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
      await hiding;
    });
  });

  test("brings its buttons in only once the screen has gone", async () => {
    expect(game.$("#menu-screen").classList.contains("ready")).toBe(false);

    let hiding!: Promise<void>;
    await act(async () => {
      hiding = hideStartupScreen(100, 300);
      await vi.advanceTimersByTimeAsync(100);
    });
    expect(game.$("#menu-screen").classList.contains("ready")).toBe(true);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
      await hiding;
    });
  });
});

describe("the menu", () => {
  test("is what the app opens on, with play, report a bug and quit buttons", () => {
    expect(game.$("#menu-screen")).not.toBeNull();
    expect(game.$$(".menu-btn").map((button) => button.textContent)).toEqual([
      "Play game",
      "Report a bug",
      "Quit",
    ]);
    expect(game.$("#game-container")).toBeNull();
  });

  test("has the sound and settings buttons, as the game does", () => {
    expect(game.$$(".controls .round-btn")).toHaveLength(2);

    game.click("#play-btn");
    game.wait(COVERED);
    expect(game.$$(".controls .round-btn")).toHaveLength(2);
  });

  test("brings the sound and settings buttons in from the right, one after the other", () => {
    const buttons = game.$$<HTMLElement>(".controls .round-btn");

    expect(buttons).toHaveLength(2);
    for (const button of buttons) {
      expect(button.classList.contains("bounce-in-right")).toBe(true);
      expect(button.style.animationPlayState).toBe("running");
    }
    const delays = buttons.map((button) =>
      parseFloat(button.style.animationDelay),
    );
    expect(delays[0]).toBeGreaterThanOrEqual(0);
    expect(delays[1]).toBeGreaterThan(delays[0]);
  });

  test("leaves them be once the game has started", () => {
    game.click("#play-btn");
    game.wait(COVERED);

    for (const button of game.$$(".controls .round-btn")) {
      expect(button.classList.contains("bounce-in-right")).toBe(false);
    }
  });

  test("follows the saved sound settings", () => {
    game.unmount();
    localStorage.setItem("soundState", "2");
    game = renderGame({ startOnMenu: true });

    expect(audioConfig.bgMusic.audio.muted).toBe(true);

    audioConfig.bgMusic.audio.muted = false;
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

  test("each button has a color of its own", () => {
    const colors = game
      .$$(".menu-btn")
      .map((button) => button.style.getPropertyValue("--btn-outline"));

    expect(colors).toHaveLength(3);
    expect(new Set(colors).size).toBe(3);
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
