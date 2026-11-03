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

describe("collecting one", () => {
  test("takes it off the screen, with a puff of smoke, and starts the wait again", () => {
    game = renderGame();
    spawn(DOUBLE, 0, 0, 0);
    game.click(".power-up-img");

    expect(icons()).toHaveLength(0);
    expect(game.$$(".smoke-puff")).toHaveLength(1);
    game.wait(3000);
    expect(game.$$(".smoke-puff")).toHaveLength(0);

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

  test("collecting one makes the letters of the title pop", () => {
    game = renderGame({ state: { highScore: 999 } });
    expect(game.$(".game-name").classList.contains("game-name-pop")).toBe(
      false,
    );

    spawn(DOUBLE, 0, 0, 0);
    game.click(".power-up-img");
    expect(game.$(".game-name").classList.contains("game-name-pop")).toBe(true);
  });

  test("a high score alone does not make the bar rainbow", () => {
    game = renderGame({ state: { highScore: 1, highScoreAtStart: 1 } });
    const plain = game.$("#progress-bar").style.background;

    game.click("#increase-img");
    game.click("#increase-img");
    expect(game.$("#progress-bar").style.background).toBe(plain);
  });

  test("2x makes the bar rainbow until it runs out", () => {
    game = renderGame({ state: { highScore: 999 } });
    const plain = game.$("#progress-bar").style.background;

    spawn(DOUBLE, 0, 0, 0);
    game.click(".power-up-img");
    expect(game.$("#progress-bar").style.background).not.toBe(plain);

    game.wait(2999);
    expect(game.$("#progress-bar").style.background).not.toBe(plain);
    game.wait(1);
    expect(game.$("#progress-bar").style.background).toBe(plain);
  });

  test("2x also speeds up the stripes of the bar, until it runs out", () => {
    const stripes = { animationName: "slide-stripes", playbackRate: 1 };
    Element.prototype.getAnimations = () => [stripes] as unknown as Animation[];
    try {
      game = renderGame({ state: { highScore: 999 } });
      expect(stripes.playbackRate).toBe(1);

      spawn(DOUBLE, 0, 0, 0);
      game.click(".power-up-img");
      expect(stripes.playbackRate).toBeGreaterThan(1);

      game.wait(3000);
      expect(stripes.playbackRate).toBe(1);
    } finally {
      delete (Element.prototype as { getAnimations?: unknown }).getAnimations;
    }
  });

  test("2x holds its time while the home button asks", () => {
    // with a score, or the home button would not ask
    game = renderGame({ state: { highScore: 999, counter: 1 } });
    spawn(DOUBLE, 0, 0, 0);
    game.click(".power-up-img");
    game.wait(1000);

    game.click("#home-btn");
    game.wait(20000);
    game.click("#alert-no");

    // two of its three seconds are left
    game.wait(1999);
    game.click("#increase-img");
    expect(game.counter()).toBe("03");
    game.wait(1);
    game.click("#increase-img");
    expect(game.counter()).toBe("04");
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

  test("the flash ends without opening the game over screen", () => {
    game = renderGame({ state: { counter: 40 } });
    spawn(PENALTY, 0, 0, 0);
    game.click(".power-up-img");

    fireAnimationEnd(game.$("#red-flash"));

    expect(game.$("#red-flash").className).toBe("");
    expect(game.$("#game-over").classList.contains("visible")).toBe(false);
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

  test("an extra boost brings one heart back, melting in", () => {
    game = renderGame({ state: { boostsAvailable: 3 } });
    expect(usedHearts()).toEqual([false, false, false, true]);

    spawn(EXTRA_BOOST, 0, 0, 0);
    expect(icons()[0].dataset.powerUpType).toBe("extra_boost");
    game.click(".power-up-img");
    game.wait(0);

    expect(usedHearts()).toEqual([false, false, false, false]);
    expect(hearts()[3].classList.contains("heart-restore")).toBe(true);
    const melt = hearts()[3].querySelector(".heart-melt");
    expect(melt?.getAttribute("data-melt-active")).toBe("true");
    // the heart melts in, so there is no smoke for it, only for collecting
    expect(game.$$(".smoke-puff")).toHaveLength(1);
    expect(sounds()).toContain("boostPowerUp");
  });

  test("the restoring heart settles once it has melted in", () => {
    game = renderGame({ state: { boostsAvailable: 3 } });
    spawn(EXTRA_BOOST, 0, 0, 0);
    game.click(".power-up-img");
    game.wait(0);

    game.wait(100);
    expect(hearts()[3].classList.contains("heart-restore")).toBe(true);
    game.wait(5000);
    expect(hearts()[3].classList.contains("heart-restore")).toBe(false);
    expect(hearts()[3].querySelector(".heart-melt")).toBeNull();
    expect(hearts()[3].querySelector("img")).not.toBeNull();
  });

  test("a melt that never finishes cannot leave a heart hidden", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    (globalThis as { __meltStuck?: boolean }).__meltStuck = true;
    try {
      game = renderGame({ state: { boostsAvailable: 3 } });
      spawn(EXTRA_BOOST, 0, 0, 0);
      game.click(".power-up-img");
      game.wait(0);

      game.wait(1000);
      expect(hearts()[3].classList.contains("heart-restore")).toBe(true);
      expect(warn).not.toHaveBeenCalled();

      game.wait(10000);
      expect(hearts()[3].classList.contains("heart-restore")).toBe(false);
      expect(hearts()[3].querySelector(".heart-melt")).toBeNull();
      expect(
        hearts()[3].querySelector<HTMLElement>(".heart-art")?.style.opacity,
      ).toBe("1");
      expect(warn).toHaveBeenCalledTimes(1);
      expect(String(warn.mock.calls[0][0])).toContain("heart 4");
    } finally {
      delete (globalThis as { __meltStuck?: boolean }).__meltStuck;
      warn.mockRestore();
    }
  });

  test("a heart used while it is still melting in goes at once", () => {
    game = renderGame({ state: { boostsAvailable: 3 } });
    spawn(EXTRA_BOOST, 0, 0, 0);
    game.click(".power-up-img");
    game.wait(0);
    expect(hearts()[3].querySelector(".heart-melt")).not.toBeNull();

    game.wait(100);
    game.click("#decrease-img");

    expect(hearts()[3].classList.contains("heart-use")).toBe(true);
    expect(hearts()[3].classList.contains("heart-restore")).toBe(false);
    expect(hearts()[3].querySelector(".heart-melt")).toBeNull();
    game.wait(5000);
    expect(hearts()[3].classList.contains("heart-restore")).toBe(false);
    expect(hearts()[3].classList.contains("heart-use")).toBe(true);
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

    // each heart comes back after the one before it, a little later
    const cameBackAt: number[] = [0];
    for (let ms = 1; ms <= 2000 && cameBackAt.length < 4; ms++) {
      game.wait(1);
      const back = usedHearts().filter((used) => !used).length;
      if (back > cameBackAt.length) cameBackAt.push(ms);
    }
    expect(usedHearts()).toEqual([false, false, false, false]);
    expect(cameBackAt).toHaveLength(4);
    for (let heart = 1; heart < 4; heart++) {
      const gap = cameBackAt[heart] - cameBackAt[heart - 1];
      expect(gap).toBeGreaterThan(20);
      expect(gap).toBeLessThan(500);
    }
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

describe("when the time runs out", () => {
  // a round lasts 20 seconds; time is up a hair before
  const TIME_IS_UP = 19900;
  const melting = () => game.$(".power-up-melt").dataset;

  test("the one falling melts away where it is", () => {
    game = renderGame();
    spawn(DOUBLE, 0, 0, 0);
    expect(melting().meltActive).toBe("false");

    game.wait(TIME_IS_UP - 6000);
    expect(melting().meltMode).toBe("out");
    expect(melting().meltActive).toBe("true");
    expect(icons()[0].style.animationPlayState).toBe("paused");
  });

  test("it can no longer be collected", () => {
    game = renderGame();
    spawn(DOUBLE, 0, 0, 0);
    game.wait(TIME_IS_UP - 6000);
    game.click(".power-up-img");

    expect(sounds()).not.toContain("powerUp");
    expect(game.$$(".smoke-puff")).toHaveLength(0);
  });
});

describe("the notice of a collected one", () => {
  const notice = () => game.$("#power-up-notice")?.textContent ?? null;

  test("says what it did, for a moment", () => {
    game = renderGame();
    spawn(DOUBLE, 0, 0, 0);
    expect(notice()).toBeNull();

    game.click(".power-up-img");
    expect(notice()).toMatch(/2/);

    game.wait(100);
    expect(notice()).not.toBeNull();

    game.wait(1000);
    expect(notice()).toBeNull();
  });

  test("comes up on the left, wherever it fell from", () => {
    game = renderGame();
    spawn(DOUBLE, 0, 0, 0);
    game.click(".power-up-img");
    expect(game.$("#power-up-notice .diamond-notice--left")).not.toBeNull();
    game.wait(2500);

    nextPowerUp(PENALTY, 0, 0.9, 0);
    game.wait(6000);
    game.click(".power-up-img");
    expect(game.$("#power-up-notice .diamond-notice--left")).not.toBeNull();
  });

  test("tells how many points the penalty took", () => {
    game = renderGame();
    spawn(PENALTY, 0, 0, 0);
    game.click(".power-up-img");

    expect(notice()).toMatch(/25/);
  });

  test("the penalty notice goes away too", () => {
    game = renderGame();
    spawn(PENALTY, 0, 0, 0);
    game.click(".power-up-img");
    expect(notice()).not.toBeNull();

    game.wait(2500);
    expect(notice()).toBeNull();
  });

  test("tells how many boosts it gave", () => {
    game = renderGame({ state: { boostsAvailable: 0 } });
    spawn(EXTRA_BOOST, 0, 0, 0);
    game.click(".power-up-img");
    expect(notice()).toMatch(/\+1/);
  });

  test("a missed one says nothing", () => {
    game = renderGame();
    spawn(DOUBLE, 0, 0, 0);
    game.wait(3000);

    expect(notice()).toBeNull();
  });
});
