import { afterEach, beforeEach, expect, describe, test, vi } from "vitest";

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

// "which one" numbers. With every boost in place the choices are 2x (40),
// 4x (20) and the penalty (20); with one missing there are two more (10, 8).
const DOUBLE = 0;
const FOUR = 0.6;
const PENALTY = 0.8;
const EXTRA_BOOST = 0.87;
const SUPERSTAR = 0.95;

const icons = () => game.$$(".power-up-img");
const sounds = () => audio.playSound.mock.calls.map(([name]) => name);
const hearts = () => game.$$(".hearts > div");
const usedHearts = () =>
  hearts().map((heart) => heart.classList.contains("heart-use"));

// a power-up is on screen
function spawn(...randoms: number[]) {
  nextPowerUp(...randoms);
  game.wait(6000);
}

describe("when they appear", () => {
  test("not at first, then after the first wait", () => {
    game = renderGame();

    game.wait(5999);
    expect(icons()).toHaveLength(0);
    game.wait(1);
    expect(icons()).toHaveLength(1);
  });

  test("the wait is somewhere between 6 and 12 seconds", () => {
    vi.mocked(Math.random).mockReturnValue(0.999);
    game = renderGame();

    game.wait(11993);
    expect(icons()).toHaveLength(0);
    game.wait(1);
    expect(icons()).toHaveLength(1);
  });

  test("one at a time", () => {
    game = renderGame();
    game.wait(60000);

    expect(icons()).toHaveLength(1);
  });

  test("none once the game is over", () => {
    game = renderGame({ state: { isGameOver: true } });
    game.wait(60000);

    expect(icons()).toHaveLength(0);
  });

  test("a new game starts with a clean screen and a fresh wait", () => {
    game = renderGame();
    game.wait(6000);
    expect(icons()).toHaveLength(1);

    game.click("#reset-img");
    expect(icons()).toHaveLength(0);

    game.wait(5999);
    expect(icons()).toHaveLength(0);
    game.wait(1);
    expect(icons()).toHaveLength(1);
  });

  test("stop when the game goes away", () => {
    game = renderGame();
    game.unmount();

    vi.advanceTimersByTime(60000);
    expect(document.querySelector(".power-up-img")).toBeNull();
    game = renderGame();
  });
});

describe("what they look like", () => {
  test("falls from a spawn area, on one side", () => {
    game = renderGame();
    spawn(DOUBLE, 0, 0.9, 0.5);

    const [icon] = icons();
    expect(icon.parentElement.className).toBe("spawn-area");
    expect(icon.dataset.powerUpType).toBe("double_click");
    expect(icon.getAttribute("src")).not.toBe("");
    expect(icon.classList.contains("spawn-area--right")).toBe(true);
    expect(icon.style.animation).toContain("falling 2.8s linear forwards");
  });

  test("some spin the other way", () => {
    game = renderGame();
    spawn(DOUBLE, 0.9, 0, 0);

    expect(icons()[0].style.animation).toContain("falling-reverse");
  });

  test("on a wide screen it sits a little way in from its edge", () => {
    game = renderGame();
    // min(1000 / 3, 150) + 1 = 151, so half of it floors to 75
    spawn(DOUBLE, 0, 0, 0.5);

    expect(icons()[0].style.left).toBe("75px");
  });

  test("on a narrow screen it stays at the edge", () => {
    setSpawnAreaWidth(500);
    game = renderGame();
    spawn(DOUBLE, 0, 0, 0.9);

    expect(icons()[0].style.left).toBe("");
  });

  test("each kind looks different", () => {
    game = renderGame();
    const sources = new Set<string>();

    for (const kind of [DOUBLE, FOUR, PENALTY]) {
      spawn(kind, 0, 0, 0);
      sources.add(icons()[0].getAttribute("src"));
      game.click(".power-up-img");
    }

    expect(sources.size).toBe(3);
  });
});

describe("collecting one", () => {
  test("takes it off the screen, with a puff of smoke, and starts the wait again", () => {
    game = renderGame();
    spawn(DOUBLE, 0, 0, 0);
    game.click(".power-up-img");

    expect(icons()).toHaveLength(0);
    expect(game.$("#powerUpUsedElement").style.display).toBe("block");
    game.wait(3000);
    expect(game.$("#powerUpUsedElement").style.display).toBe("");

    // the next one comes 6 seconds after this
    game.wait(2999);
    expect(icons()).toHaveLength(0);
    game.wait(1);
    expect(icons()).toHaveLength(1);
  });

  test("a good one plays its sound and pops the counter", () => {
    game = renderGame();
    spawn(DOUBLE, 0, 0, 0);
    game.click(".power-up-img");

    expect(sounds()).toContain("powerUp");
    expect(game.$("#counter").classList.contains("pop")).toBe(true);
    expect(game.$("#red-flash").className).toBe("");
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

  test("4x quadruples them", () => {
    game = renderGame({ state: { highScore: 999 } });
    spawn(FOUR, 0, 0, 0);
    game.click(".power-up-img");

    game.click("#increase-img");
    expect(game.counter()).toBe("04");
  });

  test("a power-up carries on through a restart", () => {
    game = renderGame({ state: { highScore: 999 } });
    spawn(DOUBLE, 0, 0, 0);
    game.click(".power-up-img");
    game.click("#reset-img");

    game.click("#increase-img");
    expect(game.counter()).toBe("02");
  });
});

describe("the penalty", () => {
  test("takes 25 points", () => {
    game = renderGame({ state: { counter: 40 } });
    spawn(PENALTY, 0, 0, 0);
    expect(icons()[0].dataset.powerUpType).toBe("minus_25");

    game.click(".power-up-img");
    expect(game.counter()).toBe("15");
  });

  test("can take you below zero", () => {
    game = renderGame({ state: { counter: 10 } });
    spawn(PENALTY, 0, 0, 0);
    game.click(".power-up-img");

    expect(game.counter()).toBe("-15");
  });

  test("shakes the screen, flashes it red and shrinks the counter", () => {
    game = renderGame({ state: { counter: 40 } });
    spawn(PENALTY, 0, 0, 0);
    game.click(".power-up-img");

    expect(sounds()).toContain("penalty");
    expect(game.$("#game-container").classList.contains("penalty-shake")).toBe(
      true,
    );
    expect(game.$("#red-flash").classList.contains("flash-penalty")).toBe(true);
    expect(game.$("#counter").classList.contains("pop-min")).toBe(true);
  });

  test("the flash ends without opening the game over screen", () => {
    game = renderGame({ state: { counter: 40 } });
    spawn(PENALTY, 0, 0, 0);
    game.click(".power-up-img");

    fireAnimationEnd(game.$("#red-flash"));

    expect(game.$("#red-flash").className).toBe("");
    expect(game.$("#game-over").classList.contains("visible")).toBe(false);
  });

  test("a second one shakes the screen again", () => {
    game = renderGame({ state: { counter: 40 } });
    spawn(PENALTY, 0, 0, 0);
    game.click(".power-up-img");

    const screen = game.$("#game-container");
    screen.classList.remove("penalty-shake");
    expect(screen.classList.contains("penalty-shake")).toBe(false);

    spawn(PENALTY, 0, 0, 0);
    game.click(".power-up-img");
    expect(screen.classList.contains("penalty-shake")).toBe(true);
  });
});

describe("boost power-ups", () => {
  test("never appear while every boost is there", () => {
    game = renderGame();
    const seen = new Set<string>();

    for (const kind of [0, 0.3, 0.5, 0.7, 0.8, 0.9, 0.999]) {
      spawn(kind, 0, 0, 0);
      seen.add(icons()[0].dataset.powerUpType);
      game.click(".power-up-img");
      // a fresh round, so the clock never runs out while looking
      game.click("#reset-img");
    }

    expect(seen.has("extra_boost")).toBe(false);
    expect(seen.has("replenish_boosts")).toBe(false);
  });

  test("an extra boost brings one heart back, with smoke", () => {
    game = renderGame({ state: { boostsAvailable: 3 } });
    expect(usedHearts()).toEqual([false, false, false, true]);

    spawn(EXTRA_BOOST, 0, 0, 0);
    expect(icons()[0].dataset.powerUpType).toBe("extra_boost");
    game.click(".power-up-img");
    game.wait(0);

    expect(usedHearts()).toEqual([false, false, false, false]);
    expect(hearts()[3].classList.contains("heart-restore")).toBe(true);
    expect(game.$("#popupElement").style.display).toBe("block");
    expect(sounds()).toContain("boostPowerUp");
  });

  test("the restoring heart settles once its animation ends", () => {
    game = renderGame({ state: { boostsAvailable: 3 } });
    spawn(EXTRA_BOOST, 0, 0, 0);
    game.click(".power-up-img");
    game.wait(0);

    fireAnimationEnd(hearts()[3]);
    expect(hearts()[3].classList.contains("heart-restore")).toBe(false);
  });

  test("the superstar brings every heart back, one after the other", () => {
    game = renderGame({ state: { boostsAvailable: 0 } });
    expect(game.$("#no-boosts").style.display).toBe("grid");

    spawn(SUPERSTAR, 0, 0, 0);
    expect(icons()[0].dataset.powerUpType).toBe("replenish_boosts");
    game.click(".power-up-img");

    // the "no boosts left" text goes at once; the hearts follow
    expect(game.$("#no-boosts").style.display).toBe("none");
    game.wait(0);
    expect(usedHearts()).toEqual([false, true, true, true]);
    game.wait(150);
    expect(usedHearts()).toEqual([false, false, true, true]);
    game.wait(150);
    expect(usedHearts()).toEqual([false, false, false, true]);
    game.wait(150);
    expect(usedHearts()).toEqual([false, false, false, false]);
  });

  test("a restart cuts the restoring short and brings them all back", () => {
    game = renderGame({ state: { boostsAvailable: 0 } });
    spawn(SUPERSTAR, 0, 0, 0);
    game.click(".power-up-img");
    game.wait(0);

    game.click("#reset-img");
    expect(usedHearts()).toEqual([false, false, false, false]);

    // nothing is left to come back, so nothing is left restoring
    game.wait(1000);
    expect(hearts().some((h) => h.classList.contains("heart-restore"))).toBe(
      false,
    );
  });
});

describe("missing one", () => {
  test("lets it fall off the screen and starts the wait again", () => {
    game = renderGame();
    spawn(DOUBLE, 0, 0, 0);
    fireAnimationEnd(icons()[0]);

    expect(icons()).toHaveLength(0);
    expect(sounds()).not.toContain("powerUp");

    game.wait(5999);
    expect(icons()).toHaveLength(0);
    game.wait(1);
    expect(icons()).toHaveLength(1);
  });
});
