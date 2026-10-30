import { afterEach, beforeEach, expect, describe, test, vi } from "vitest";

import { act } from "react";
import { fireAnimationEnd, stubWebAnimations } from "../../helpers/dom.ts";
import { renderGame } from "../../helpers/game.tsx";

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
  // every random choice takes the first option
  vi.spyOn(Math, "random").mockReturnValue(0);
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
const isShown = () => game.$("#game-over").classList.contains("visible");
const barColor = () => game.$("#progress-bar").style.background;

// a round lasts 20 seconds; time is up a hair before
const TIME_IS_UP = 19900;

const fakeElectron = () =>
  (window.electron = {
    setDiscordStatus: vi.fn(),
    quitApp: vi.fn(),
    showGpuWarning: vi.fn(),
  } as unknown as Window["electron"]);

describe("the countdown bar", () => {
  test("starts healthy and runs for the length of the round", () => {
    game = renderGame();

    expect(barColor()).toBe("rgb(180, 166, 255)");
    expect(game.$("#progress-bar").style.animation).toContain(
      "progress-anim 20s linear infinite",
    );
  });

  test("turns orange, then red and blinking, then blinks faster", () => {
    game = renderGame();

    game.wait(9899);
    expect(barColor()).toBe("rgb(180, 166, 255)");
    game.wait(1);
    expect(barColor()).toBe("rgb(255, 177, 153)");
    expect(game.$("#progress-bar").style.animation).not.toContain("blink");

    game.wait(4000);
    expect(barColor()).toBe("rgb(247, 98, 139)");
    expect(game.$("#progress-bar").style.animation).toContain("blink 0.8s");

    game.wait(3000);
    expect(game.$("#progress-bar").style.animation).toContain("blink 0.5s");
  });

  test("is rainbow while a new high score is being set", () => {
    game = renderGame({ state: { highScore: 0 } });
    game.click("#increase-img");

    expect(barColor()).toBe("var(--rainbow-gradient-bar)");

    // ...until time starts running out
    game.wait(10000);
    expect(barColor()).toBe("rgb(255, 177, 153)");
  });

  test("restarts when a goal is reached, and runs faster", () => {
    game = renderGame({ state: { counter: 29, highScore: 999 } });
    game.wait(15000);
    expect(barColor()).toBe("rgb(247, 98, 139)");

    game.click("#increase-img");

    expect(barColor()).toBe("rgb(180, 166, 255)");
    expect(game.$("#progress-bar").style.animation).toContain(
      "progress-anim 16.66",
    );
  });

  test("is frozen once the game is over", () => {
    game = renderGame();
    game.wait(TIME_IS_UP);

    expect(game.$("#progress-bar").style.animation).toBe("none");
  });
});

describe("running out of time", () => {
  test("flashes red, then shows the game over screen", () => {
    game = renderGame();

    game.wait(TIME_IS_UP - 1);
    expect(game.$("#red-flash").className).toBe("");

    game.wait(1);
    expect(game.$("#red-flash").classList.contains("flash")).toBe(true);
    expect(isShown()).toBe(false);

    fireAnimationEnd(game.$("#red-flash"));
    expect(game.$("#red-flash").className).toBe("");
    expect(isShown()).toBe(true);
  });

  test("the game over title melts in once the screen is shown", () => {
    game = renderGame();
    const title = () => game.$("#game-over .go-title").dataset.meltActive;
    expect(title()).toBe("false");

    game.wait(TIME_IS_UP);
    expect(title()).toBe("false");

    fireAnimationEnd(game.$("#red-flash"));
    expect(title()).toBe("true");
  });

  test("shows a phrase, the final score and counts the death", () => {
    game = renderGame({ state: { highScore: 99 } });
    game.click("#increase-img");
    game.wait(TIME_IS_UP);
    fireAnimationEnd(game.$("#red-flash"));

    expect(game.$(".go-text-random").textContent).toBe("you died lolz");
    expect(game.$(".score-text").textContent).toBe("Score: 01");
    expect(game.$("#death-tracker").textContent).toBe("1");
    expect(localStorage.getItem("deathCount")).toBe("1");
  });

  test("keeps counting deaths from the saved total", () => {
    localStorage.setItem("deathCount", "7");
    game = renderGame();
    expect(game.$("#death-tracker").textContent).toBe("7");

    game.wait(TIME_IS_UP);
    expect(game.$("#death-tracker").textContent).toBe("8");
  });

  test("a new high score gets its own phrase and rainbow text", () => {
    game = renderGame({ state: { highScore: 0 } });
    game.click("#increase-img");
    game.wait(TIME_IS_UP);
    fireAnimationEnd(game.$("#red-flash"));

    expect(game.$(".go-text-random").textContent).toBe("new high score!");
    expect(game.$(".go-text-random").classList.contains("rainbow-txt")).toBe(
      true,
    );
    expect(game.$(".score-text").classList.contains("rainbow-txt")).toBe(true);
  });

  test("a regular game over has no rainbow text", () => {
    game = renderGame({ state: { highScore: 99 } });
    game.wait(TIME_IS_UP);

    expect(game.$(".go-text-random").classList.contains("rainbow-txt")).toBe(
      false,
    );
  });

  test("plays the game over sounds, with the music a second later", () => {
    game = renderGame();
    game.wait(TIME_IS_UP);

    expect(sounds()).toContain("gameOver");
    expect(stoppedSounds()).toContain("bgMusic");
    expect(sounds()).not.toContain("gameOverMusic");

    game.wait(999);
    expect(sounds()).not.toContain("gameOverMusic");
    game.wait(1);
    expect(sounds()).toContain("gameOverMusic");
  });

  test("tells Discord", () => {
    fakeElectron();
    game = renderGame();
    game.wait(TIME_IS_UP);

    expect(window.electron.setDiscordStatus).toHaveBeenCalledWith({
      gameStatusRPC: "game-over",
    });
  });

  test("writes the you died art to the console in the browser only", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    game = renderGame();
    game.wait(TIME_IS_UP);
    expect(log).toHaveBeenCalledTimes(1);
    game.unmount();

    log.mockClear();
    fakeElectron();
    game = renderGame();
    game.wait(TIME_IS_UP);
    expect(log).not.toHaveBeenCalled();
  });

  test("reaching the goal in time beats the clock", () => {
    game = renderGame({ state: { counter: 30 } });
    game.wait(TIME_IS_UP);

    expect(isShown()).toBe(false);
    expect(game.$("#death-tracker").textContent).toBe("0");
  });

  test("the game stays over: no more points or boosts", () => {
    game = renderGame();
    game.wait(TIME_IS_UP);
    game.click("#increase-img");
    game.press(" ");

    expect(game.counter()).toBe("00");
  });
});

describe("the game over background", () => {
  const background = () =>
    game.$("#game-over .go-background [data-pixel-swirl-shader]");

  test("is not there while the game is on", () => {
    game = renderGame();
    game.wait(5000);

    expect(game.$(".go-background")).toBeNull();
    expect(game.$("#game-over [data-pixel-swirl-shader]")).toBeNull();
  });

  test("is in place as soon as the game ends, before the screen shows", () => {
    game = renderGame();
    game.wait(TIME_IS_UP);

    expect(isShown()).toBe(false);
    expect(background()).not.toBeNull();
  });

  test("stays while the game over screen is showing", () => {
    game = renderGame();
    game.wait(TIME_IS_UP);
    fireAnimationEnd(game.$("#red-flash"));

    expect(isShown()).toBe(true);
    expect(background()).not.toBeNull();
  });

  test("is gone again when the game restarts", () => {
    game = renderGame();
    game.wait(TIME_IS_UP);
    game.click("#reset-img");

    expect(background()).toBeNull();
  });

  test("is gone again after restarting from the game over screen", () => {
    game = renderGame();
    game.wait(TIME_IS_UP);
    fireAnimationEnd(game.$("#red-flash"));
    game.click("#game-over-btn");
    game.wait(600);

    expect(background()).toBeNull();
  });

  test("comes back for the next game over", () => {
    game = renderGame();
    game.wait(TIME_IS_UP);
    game.click("#reset-img");
    game.wait(TIME_IS_UP);

    expect(background()).not.toBeNull();
  });
});

describe("starting over", () => {
  test("the reset button restarts right away", () => {
    fakeElectron();
    game = renderGame({ state: { counter: 12, boostsAvailable: 2 } });
    game.click("#reset-img");

    expect(game.counter()).toBe("00");
    expect(game.$$(".hearts > div.heart-use")).toHaveLength(0);
    expect(sounds()).toContain("mouseClick");
    expect(
      sounds().filter((name) => name === "bgMusic").length,
    ).toBeGreaterThan(1);
    expect(window.electron.setDiscordStatus).toHaveBeenCalledWith({
      gameStatusRPC: "in-game",
    });
  });

  test("shakes the counter", () => {
    game = renderGame({ state: { counter: 12 } });
    game.click("#reset-img");

    expect(game.$("#counter").classList.contains("reset-shake")).toBe(true);
  });

  test("restarts the countdown from the top", () => {
    game = renderGame();
    game.wait(15000);
    game.click("#reset-img");

    expect(barColor()).toBe("rgb(180, 166, 255)");
    game.wait(TIME_IS_UP - 1);
    expect(game.$("#red-flash").className).toBe("");
  });

  test("the game over button goes through the loading screen", () => {
    game = renderGame({ state: { counter: 12 } });
    game.wait(TIME_IS_UP);
    fireAnimationEnd(game.$("#red-flash"));
    expect(game.$("#loading-screen")).toBeNull();

    game.click("#game-over-btn");
    expect(sounds()).toContain("buttonClick");
    expect(stoppedSounds()).toContain("gameOverMusic");

    // it appears at once, and fades in a frame later
    expect(game.$("#loading-screen")).not.toBeNull();
    expect(game.$("#loading-screen").classList.contains("visible")).toBe(false);
    game.wait(20);
    expect(game.$("#loading-screen").classList.contains("visible")).toBe(true);

    // the game is still over until it has covered the screen
    game.wait(500);
    expect(isShown()).toBe(true);
    game.wait(10);

    expect(isShown()).toBe(false);
    expect(game.counter()).toBe("00");
    expect(game.$("#loading-screen").classList.contains("hiding")).toBe(true);

    game.wait(599);
    expect(game.$("#loading-screen")).not.toBeNull();
    game.wait(1);
    expect(game.$("#loading-screen")).toBeNull();
  });

  test("the game over button draws the whole page again, under the loading screen", () => {
    game = renderGame({ state: { counter: 12 } });
    const page = game.$("#app");
    game.wait(TIME_IS_UP);
    fireAnimationEnd(game.$("#red-flash"));

    game.click("#game-over-btn");
    game.wait(520);
    expect(game.$("#app")).toBe(page);

    game.wait(10);
    expect(game.$("#app")).not.toBe(page);
    expect(game.$("#loading-screen")).not.toBeNull();
    expect(game.counter()).toBe("00");
  });

  test("the reset button keeps the page, so the counter can shake", () => {
    game = renderGame({ state: { counter: 12 } });
    const page = game.$("#app");

    game.click("#reset-img");

    expect(game.$("#app")).toBe(page);
  });

  test("a new game can be played, and lost, again", () => {
    game = renderGame();
    game.wait(TIME_IS_UP);
    game.click("#game-over-btn");
    game.wait(1200);

    game.click("#increase-img");
    expect(game.counter()).toBe("01");

    game.wait(TIME_IS_UP);
    expect(game.$("#death-tracker").textContent).toBe("2");
  });

  test("restarting hides the rainbow text for the next time", () => {
    game = renderGame({ state: { highScore: 0 } });
    game.click("#increase-img");
    game.wait(TIME_IS_UP);
    game.click("#game-over-btn");
    game.wait(1200);

    expect(game.$(".go-text-random").classList.contains("rainbow-txt")).toBe(
      false,
    );
  });

  test("restarting before the screen appears cancels it", () => {
    game = renderGame();
    game.wait(TIME_IS_UP);
    game.click("#reset-img");
    fireAnimationEnd(game.$("#red-flash"));

    expect(isShown()).toBe(false);
  });
});

describe("the game over buttons", () => {
  beforeEach(() => {
    game = renderGame({ state: { isGameOver: true } });
  });

  test("quit closes the app after a moment", () => {
    fakeElectron();
    game.click("#quit-btn");

    expect(sounds()).toContain("buttonClick");
    expect(window.electron.quitApp).not.toHaveBeenCalled();
    game.wait(400);
    expect(window.electron.quitApp).toHaveBeenCalledTimes(1);
  });

  test("quit says thanks in the browser", () => {
    const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
    game.click("#quit-btn");

    expect(alert).toHaveBeenCalledWith("Thank you for playing!");
  });

  test("back to menu explains it is not there yet", () => {
    const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
    game.click("#menu-btn");
    expect(alert).not.toHaveBeenCalled();

    game.wait(500);
    expect(alert).toHaveBeenCalledTimes(1);
  });

  test("back to menu tilts the opposite way each hover", () => {
    const menu = () => game.$("#menu-btn");
    const hover = (type: string) =>
      act(() => {
        menu().dispatchEvent(new MouseEvent(type, { bubbles: true }));
      });

    hover("mouseover");
    expect(menu().style.transform).toContain("-4deg");
    hover("mouseout");
    expect(menu().style.transform).toBe("");

    hover("mouseover");
    expect(menu().style.transform).toContain("4deg");
    expect(menu().style.transform).not.toContain("-4deg");
  });
});
