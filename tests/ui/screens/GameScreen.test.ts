import { afterEach, beforeEach, expect, describe, test, vi } from "vitest";

import { renderGame } from "../../helpers/game.tsx";
import { stubWebAnimations } from "../../helpers/dom.ts";

// the game plays sounds through this; here we only want to know which
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
});

afterEach(() => {
  game.unmount();
  animations.restore();
  delete window.electron;
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

// the three layers the counter is drawn with
const layers = ["#counter", "#counter-outer", "#counter-shine"];
const hearts = () => game.$$(".hearts > div");
const usedHearts = () =>
  hearts().map((heart) => heart.classList.contains("heart-use"));

describe("clicking", () => {
  test("adds a point to all three layers of the counter", () => {
    game = renderGame();
    game.click("#increase-img");

    for (const layer of layers) {
      expect(game.$(layer).textContent).toBe("01");
    }
  });
});

describe("the keyboard", () => {
  test.each(["ArrowUp", "w"])("%s scores", (key) => {
    game = renderGame();
    game.press(key);
    expect(game.counter()).toBe("01");
  });

  test("space boosts", () => {
    game = renderGame();
    game.press(" ");

    expect(game.counter()).toBe("30");
    expect(usedHearts()).toEqual([false, false, false, true]);
  });

  test("holding a key down scores once, not over and over", () => {
    vi.stubEnv("DEV", false);
    game = renderGame();
    game.press("w");
    for (let i = 0; i < 5; i++) game.press("w", { repeat: true });

    expect(game.counter()).toBe("01");

    // letting go and pressing again scores again
    game.press("w");
    expect(game.counter()).toBe("02");
  });
});
