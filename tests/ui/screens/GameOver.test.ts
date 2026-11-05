import { afterEach, beforeEach, expect, describe, test, vi } from "vitest";

import { fireAnimationEnd, stubWebAnimations } from "../../helpers/dom.ts";
import { renderGame } from "../../helpers/game.tsx";

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

const isShown = () => game.$("#game-over").classList.contains("visible");
const barColor = () => game.$("#progress-bar").style.background;

// a round lasts 20 seconds; time is up a hair before
const TIME_IS_UP = 19900;

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

  test("shows a phrase, the final score and counts the death", () => {
    game = renderGame({ state: { highScore: 99 } });
    game.click("#increase-img");
    game.wait(TIME_IS_UP);
    fireAnimationEnd(game.$("#red-flash"));

    expect(game.$(".go-text-random").textContent).toBe("You died lolz");
    expect(game.$("#score-tracker").textContent).toBe("01");
    expect(game.$("#death-tracker").textContent).toBe("1");
    expect(localStorage.getItem("deathCount")).toBe("1");
  });

  test("the game stays over: no more points or boosts", () => {
    game = renderGame();
    game.wait(TIME_IS_UP);
    game.click("#increase-img");
    game.press(" ");

    expect(game.counter()).toBe("00");
  });
});

describe("starting over", () => {
  test("restarts the countdown from the top", () => {
    game = renderGame();
    game.wait(15000);
    game.restart();

    expect(barColor()).toBe("rgb(173, 158, 255)");
    game.wait(TIME_IS_UP - 1);
    expect(game.$("#red-flash").className).toBe("");
  });
});
