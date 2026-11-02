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
