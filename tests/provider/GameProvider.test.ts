import { afterEach, beforeEach, expect, describe, test, vi } from "vitest";

import { useGame } from "../../src/renderer/provider/useGame.ts";
import { renderInto, stubWebAnimations } from "../helpers/dom.ts";
import { renderGame } from "../helpers/game.tsx";

let game: ReturnType<typeof renderGame> | undefined;
let animations: ReturnType<typeof stubWebAnimations>;

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  animations = stubWebAnimations();
});

afterEach(() => {
  game?.unmount();
  animations.restore();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("GameProvider", () => {
  test("starts from the saved high score and death count", () => {
    localStorage.setItem("highScore", "70");
    localStorage.setItem("deathCount", "5");
    game = renderGame();

    expect(game.$("#high-score").textContent).toBe("high score: 70");
    expect(game.$("#death-tracker").textContent).toBe("5");
  });

  test("starts from zero when nothing is saved, or the save is garbage", () => {
    localStorage.setItem("highScore", "not a number");
    localStorage.setItem("deathCount", "");
    game = renderGame();

    expect(game.$("#high-score").textContent).toBe("high score: 0");
    expect(game.$("#death-tracker").textContent).toBe("0");
  });

  test("a game from the start state ignores what is saved", () => {
    localStorage.setItem("highScore", "70");
    game = renderGame({ state: { highScore: 3 } });

    expect(game.$("#high-score").textContent).toBe("high score: 3");
  });

  test("everything it started stops when the game goes away", () => {
    game = renderGame();
    game.click("#increase-img");
    game.unmount();

    // nothing is left running that could change the screen or throw
    expect(() => vi.advanceTimersByTime(60000)).not.toThrow();
    expect(document.querySelector("#counter")).toBeNull();
    game = undefined;
  });

  test("a component outside it gets a clear error", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    function Lost() {
      useGame();
      return null;
    }

    expect(() => renderInto(Lost)).toThrow("needs a <GameProvider>");
  });
});
