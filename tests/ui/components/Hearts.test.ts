import { createElement, Fragment } from "react";
import { afterEach, beforeEach, expect, describe, test, vi } from "vitest";

import { renderGame } from "../../helpers/game.tsx";
import { stubWebAnimations } from "../../helpers/dom.ts";
import GameScreen from "../../../src/renderer/ui/screens/game/GameScreen.tsx";
import { useGame } from "../../../src/renderer/provider/useGame.ts";
import { liveSlots } from "../../../src/renderer/ui/components/gameplay/hearts/useHeartSlots.ts";

vi.mock("../../../src/renderer/utils/app/sounds.ts", async (original) => ({
  ...(await original<
    typeof import("../../../src/renderer/utils/app/sounds.ts")
  >()),
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
    // the new run of the game over screen, which this does not show
    button("start-over", () => actions.restartFromGameOver()),
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

    game.click("#start-over");
    game.wait(540);

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

describe("what the hearts show", () => {
  const settled = (used: boolean[]) => ({
    used,
    restoring: used.map(() => false),
  });

  test("a heart with no boost behind it is used at once, before the slots catch up", () => {
    const stale = settled([false, false, false, false]);
    expect(liveSlots(0, stale).used).toEqual([true, true, true, true]);
    expect(liveSlots(3, stale).used).toEqual([false, false, false, true]);
  });

  test("a heart waiting to come back stays used until its turn", () => {
    const waiting = settled([true, true, true, true]);
    expect(liveSlots(4, waiting).used).toEqual([true, true, true, true]);
    expect(liveSlots(2, waiting).used).toEqual([true, true, true, true]);
  });

  test("a heart that is used is never restoring", () => {
    const melting = { used: [false, false], restoring: [true, true] };
    expect(liveSlots(1, melting)).toEqual({
      used: [false, true],
      restoring: [true, false],
    });
  });
});
