import { createElement, Fragment } from "react";
import { afterEach, beforeEach, expect, describe, test, vi } from "vitest";

import { renderGame } from "../../helpers/game.tsx";
import { stubWebAnimations } from "../../helpers/dom.ts";
import GameScreen from "../../../src/renderer/ui/screens/game/GameScreen.tsx";
import { useGame } from "../../../src/renderer/provider/useGame.ts";

vi.mock("../../../src/renderer/utils/sounds.ts", async (original) => ({
  ...(await original<typeof import("../../../src/renderer/utils/sounds.ts")>()),
  playSound: vi.fn(),
  pauseSound: vi.fn(),
}));

function Harness() {
  const { actions } = useGame();
  const button = (id: string, onClick: () => void) =>
    createElement("button", { id, onClick });

  return createElement(
    Fragment,
    null,
    createElement(GameScreen),
    button("replenish", () => actions.collectPowerUp("replenish_boosts")),
  );
}

let game: ReturnType<typeof renderGame>;
let animations: ReturnType<typeof stubWebAnimations>;

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  animations = stubWebAnimations();
});
afterEach(() => {
  game.unmount();
  animations.restore();
  vi.useRealTimers();
});

const hearts = () => game.$$(".hearts > div");
const state = () =>
  hearts().map((h) => ({
    used: h.classList.contains("heart-use"),
    restoring: h.classList.contains("heart-restore"),
  }));
const allThere = Array.from({ length: 4 }, () => ({
  used: false,
  restoring: false,
}));

describe("the hearts after a power-up", () => {
  const replenished = () => {
    game = renderGame({ ui: Harness, state: { boostsAvailable: 0 } });
    game.click("#replenish");
  };

  test("a restart partway through starts them from scratch", () => {
    replenished();
    game.wait(200);
    const before = hearts();

    game.click("#reset-img");

    expect(hearts()[0]).not.toBe(before[0]);
    game.wait(2000);
    expect(state()).toEqual(allThere);
  });

  test("a boost used while they come back keeps its heart gone", () => {
    replenished();
    game.wait(200);

    game.click("#decrease-img");
    game.wait(2000);

    expect(state().map((heart) => heart.used)).toEqual([
      false,
      false,
      false,
      true,
    ]);
  });
});
