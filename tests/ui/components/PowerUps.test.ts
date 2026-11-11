import { afterEach, beforeEach, expect, describe, test, vi } from "vitest";

import { stubWebAnimations } from "../../helpers/dom.ts";
import { renderGame } from "../../helpers/game.tsx";
import { MIN_WAIT } from "../../../src/renderer/ui/components/gameplay/power-ups/usePowerUpSpawner.ts";

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
  setSpawnAreaWidth(1000);
  // every random choice takes the first option, unless a test says otherwise
  vi.spyOn(Math, "random").mockReturnValue(0);
});

afterEach(() => {
  game.unmount();
  animations.restore();
  delete (HTMLElement.prototype as { offsetWidth?: unknown }).offsetWidth;
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// jsdom does not lay anything out, so say how wide the spawn area is
function setSpawnAreaWidth(width: number) {
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    get: () => width,
  });
}

// What a power-up is made of, in the order it is decided. The wait before it
// appears is decided when the game starts (or restarts); after that:
//   which one (0-1, by weight), how it falls, which side, how far in
function nextPowerUp(...randoms: number[]) {
  const random = vi.mocked(Math.random);
  randoms.forEach((value) => random.mockReturnValueOnce(value));
}

// "which one" numbers: the lowest one picks 2x, and the other the time freeze
const DOUBLE = 0;
const FREEZE = 0.53;

const icons = () => game.$$(".power-up-img");
const sounds = () => audio.playSound.mock.calls.map(([name]) => name);

// time is up 19.9 seconds into the round. A power-up is collected as soon as
// it comes, which is MIN_WAIT in, so this much of the round is left then
const LEFT_AT_PICK = 19900 - MIN_WAIT;

// how many whole seconds to wait in steps (so that the screen gets to update),
// and still not be at the moment that is `ms` away. One more second passes it
const stepsBefore = (ms: number) => Math.ceil(ms / 1000) - 1;

// a power-up is on screen
function spawn(...randoms: number[]) {
  nextPowerUp(...randoms);
  game.wait(MIN_WAIT);
}

describe("when they appear", () => {
  test("not at first, then after the first wait", () => {
    game = renderGame();

    game.wait(MIN_WAIT - 1);
    expect(icons()).toHaveLength(0);
    game.wait(1);
    expect(icons()).toHaveLength(1);
  });

  test("none once the game is over", () => {
    game = renderGame({ state: { isGameOver: true } });
    game.wait(60000);

    expect(icons()).toHaveLength(0);
  });
});

describe("collecting one", () => {
  test("takes it off the screen, with a puff of smoke, and starts the wait again", () => {
    game = renderGame();
    spawn(DOUBLE, 0, 0, 0);
    game.click(".power-up-img");

    expect(icons()).toHaveLength(0);
    expect(game.$$(".smoke-puff")).toHaveLength(1);

    // the next one comes after the shortest wait, counted from the pick
    game.wait(MIN_WAIT - 1);
    expect(icons()).toHaveLength(0);
    game.wait(1);
    expect(icons()).toHaveLength(1);
  });

  test("2x doubles clicks for three seconds", () => {
    game = renderGame({ state: { highScore: 999 } });
    spawn(DOUBLE, 0, 0, 0);
    game.click(".power-up-img");

    game.click("#increase-img");
    expect(game.counter()).toBe("02");

    game.wait(3000);
    game.click("#increase-img");
    expect(game.counter()).toBe("03");
  });

  test("the time freeze stops the countdown for three seconds", () => {
    game = renderGame({ state: { highScore: 999 } });
    spawn(FREEZE, 0, 0, 0);
    game.click(".power-up-img");

    expect(document.documentElement.hasAttribute("data-frozen")).toBe(true);
    expect(sounds()).toContain("powerUp");

    // the round has LEFT_AT_PICK to go, and three seconds of the freeze do not
    // count. In steps, so that the screen gets to update after the freeze ends
    for (let s = 0; s < stepsBefore(LEFT_AT_PICK + 3000); s++) game.wait(1000);
    expect(game.$("#red-flash").classList.contains("flash")).toBe(false);
    expect(document.documentElement.hasAttribute("data-frozen")).toBe(false);

    game.wait(1000);
    expect(game.$("#red-flash").classList.contains("flash")).toBe(true);
  });
});
