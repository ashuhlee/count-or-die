import { afterEach, beforeEach, expect, describe, test, vi } from "vitest";
import confetti from "canvas-confetti";

import { renderGame } from "../../helpers/game.tsx";
import { stubWebAnimations } from "../../helpers/dom.ts";

// the game plays sounds through this; here we only want to know which
const audio = vi.hoisted(() => ({ playSound: vi.fn(), pauseSound: vi.fn() }));

vi.mock(
  "../../../src/renderer/scripts/controls/audioHandler.ts",
  async (original) => ({
    ...(await original<
      typeof import("../../../src/renderer/scripts/controls/audioHandler.ts")
    >()),
    ...audio,
  }),
);

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
});

// the three layers the counter is drawn with
const layers = ["#counter", "#counter-outer", "#counter-shine"];
const hearts = () => game.$$(".hearts > div");
const usedHearts = () =>
  hearts().map((heart) => heart.classList.contains("heart-use"));
const sounds = () => audio.playSound.mock.calls.map(([name]) => name);

describe("a fresh game", () => {
  test("shows the title, the score, the goal and every heart", () => {
    game = renderGame();

    expect(game.$(".game-name").textContent).toBe("count or die");
    expect(game.counter()).toBe("00");
    expect(game.$("#next-goal").textContent).toBe("next: 30");
    expect(usedHearts()).toEqual([false, false, false, false]);
    expect(game.$("#no-boosts").style.display).toBe("none");
    expect(game.$("#app-ver").textContent).toContain("0.0.0-test");
  });

  test("starts the music", () => {
    game = renderGame();
    expect(sounds()).toContain("bgMusic");
  });
});

describe("clicking", () => {
  test("adds a point to all three layers of the counter", () => {
    game = renderGame();
    game.click("#increase-img");

    for (const layer of layers) {
      expect(game.$(layer).textContent).toBe("01");
    }
  });

  test("shows negative scores and at least two digits", () => {
    game = renderGame({ state: { counter: -5 } });
    expect(game.counter()).toBe("-05");
  });

  test("pops the counter, and replays the pop on every click", () => {
    game = renderGame({ state: { highScore: 99 } });
    game.click("#increase-img");
    const first = game.$("#counter");
    expect(first.classList.contains("pop")).toBe(true);

    game.click("#increase-img");
    expect(game.$("#counter")).not.toBe(first);
  });

  test("beating the high score pops it to the right instead", () => {
    game = renderGame({ state: { highScore: 0 } });
    game.click("#increase-img");

    expect(game.$("#counter").classList.contains("pop-right")).toBe(true);
  });

  test("a +1 floats up where the player clicked, then goes away", () => {
    game = renderGame();
    game.click("#increase-img", { clientX: 40, clientY: 60 });

    const [count] = game.$$(".count-cursor");
    expect(count.textContent).toBe("+1");
    expect(count.style.left).toBe("40px");
    expect(count.style.top).toBe("60px");

    animations.finishAll();
    expect(game.$$(".count-cursor")).toHaveLength(0);
  });

  test("the button looks pressed for a moment", () => {
    game = renderGame();
    game.click("#increase-img");
    expect(game.$("#increase-img").getAttribute("src")).toContain(
      "increase-press",
    );

    game.wait(99);
    expect(game.$("#increase-img").getAttribute("src")).toContain(
      "increase-press",
    );
    game.wait(1);
    expect(game.$("#increase-img").getAttribute("src")).not.toContain("press");
  });

  test("plays the click sound", () => {
    game = renderGame();
    game.click("#increase-img");
    expect(sounds()).toContain("buttonInc");
  });

  test("a power-up changes what a click is worth", () => {
    game = renderGame({ state: { countIncrement: 4 } });
    game.click("#increase-img", { clientX: 1, clientY: 1 });

    expect(game.counter()).toBe("04");
    expect(game.$(".count-cursor").textContent).toBe("+4");
  });

  test("nothing happens once the game is over", () => {
    game = renderGame({ state: { isGameOver: true } });
    game.click("#increase-img");
    game.click("#decrease-img");

    expect(game.counter()).toBe("00");
    expect(usedHearts()).toEqual([false, false, false, false]);
  });
});

describe("the keyboard", () => {
  test.each(["ArrowUp", "ArrowRight", "w", "W", "d", "D"])(
    "%s scores",
    (key) => {
      game = renderGame();
      game.press(key);
      expect(game.counter()).toBe("01");
    },
  );

  test("space boosts", () => {
    game = renderGame();
    game.press(" ");

    expect(game.counter()).toBe("30");
    expect(usedHearts()).toEqual([false, false, false, true]);
  });

  test("other keys do nothing", () => {
    game = renderGame();
    for (const key of ["x", "Enter", "a", "ArrowDown"]) game.press(key);

    expect(game.counter()).toBe("00");
  });

  test.each(["ctrlKey", "metaKey", "altKey", "shiftKey"] as const)(
    "ignores keys held with %s",
    (modifier) => {
      game = renderGame();
      game.press("w", { [modifier]: true });
      game.press(" ", { [modifier]: true });

      expect(game.counter()).toBe("00");
    },
  );

  test("Escape shows the settings message", () => {
    const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
    game = renderGame();
    game.press("Escape");

    expect(alert).toHaveBeenCalledTimes(1);
  });

  test("keys do nothing once the game is over", () => {
    game = renderGame({ state: { isGameOver: true } });
    game.press("w");
    game.press(" ");

    expect(game.counter()).toBe("00");
  });

  test("stop working when the game goes away", () => {
    game = renderGame();
    game.unmount();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "w" }));

    // nothing to throw, and nothing left to score
    expect(document.querySelector("#counter")).toBeNull();
    game = renderGame();
  });
});

describe("boosting", () => {
  test("jumps to the goal, moving the goal on", () => {
    game = renderGame();
    game.click("#decrease-img");

    expect(game.counter()).toBe("30");
    // random 0 picks the smallest step: 10
    expect(game.$("#next-goal").textContent.replace(/ /g, " ")).toBe(
      "next: 40",
    );
  });

  test("uses the right-most heart first, with a puff of smoke", () => {
    game = renderGame();
    game.click("#decrease-img");

    expect(usedHearts()).toEqual([false, false, false, true]);
    expect(game.$("#popupElement").style.display).toBe("block");
    expect(game.$("#popupElement").getAttribute("src")).toContain("smoke");

    game.wait(2999);
    expect(game.$("#popupElement").style.display).toBe("block");
    game.wait(1);
    expect(game.$("#popupElement").style.display).toBe("");
  });

  test("floats a +N for the points it added", () => {
    game = renderGame();
    game.click("#decrease-img", { clientX: 5, clientY: 6 });

    expect(game.$(".count-cursor").textContent).toBe("+30");
  });

  test("shows the boost! notice, plays the boost sound, pops the counter down", () => {
    game = renderGame({ state: { highScore: 99 } });
    expect(
      game.$("#boost-notif-text").classList.contains("boost-notification"),
    ).toBe(false);

    game.click("#decrease-img");

    expect(
      game.$("#boost-notif-text").classList.contains("boost-notification"),
    ).toBe(true);
    expect(sounds()).toContain("useBoost");
    expect(game.$("#counter").classList.contains("pop-dec")).toBe(true);
  });

  test("using every boost shows the no boosts left text", () => {
    game = renderGame();

    for (let used = 1; used <= 3; used++) game.click("#decrease-img");
    expect(game.$("#no-boosts").style.display).toBe("none");

    game.click("#decrease-img");
    expect(usedHearts()).toEqual([true, true, true, true]);
    expect(game.$("#no-boosts").style.display).toBe("grid");
    expect(game.$$("#no-boosts .no-boost-text > span")).toHaveLength(15);
  });

  test("with none left it complains instead", () => {
    game = renderGame({ state: { boostsAvailable: 0, counter: 5 } });
    game.click("#decrease-img");

    expect(game.counter()).toBe("05");
    expect(sounds()).toContain("noBoosts");
    expect(game.$("#no-boosts").classList.contains("no-boosts-flash")).toBe(
      true,
    );
    // the button shakes and flashes red
    expect(game.$("#decrease-img").classList.contains("no-boosts-shake")).toBe(
      true,
    );
    expect(animations.animate).toHaveBeenCalledWith(
      [
        expect.objectContaining({ filter: expect.any(String) }),
        { filter: "none" },
      ],
      expect.objectContaining({ duration: 800 }),
    );
  });

  test("shakes the button again on every try", () => {
    game = renderGame({ state: { boostsAvailable: 0 } });
    game.click("#decrease-img");
    const first = game.$("#decrease-img");

    game.click("#decrease-img");
    expect(game.$("#decrease-img")).not.toBe(first);
  });

  test("restarting brings every heart back at once", () => {
    game = renderGame();
    game.click("#decrease-img");
    game.click("#decrease-img");
    expect(usedHearts().filter(Boolean)).toHaveLength(2);

    game.click("#reset-img");

    expect(usedHearts()).toEqual([false, false, false, false]);
    expect(game.$("#no-boosts").style.display).toBe("none");
  });

  test("a power-up brings missing hearts back one after the other", () => {
    game = renderGame({ state: { boostsAvailable: 0 } });
    expect(usedHearts()).toEqual([true, true, true, true]);
  });
});

describe("goals", () => {
  const nearGoal = { counter: 29, highScore: 999 };

  test("reaching the goal raises it and spells it out letter by letter", () => {
    game = renderGame({ state: nearGoal });
    game.click("#increase-img");

    const letters = game.$$("#next-goal .goal-text > span");
    expect(letters).toHaveLength("next: 40".length);
    expect(letters[0].style.getPropertyValue("--delay")).toBe("0s");
    expect(letters[1].style.getPropertyValue("--delay")).toBe("0.05s");
    expect(sounds()).toContain("goalReached");
  });

  test("the goal box swings, and swings again for the next goal", () => {
    game = renderGame({ state: nearGoal });
    expect(game.$("#next-goal").classList.contains("new-goal")).toBe(false);

    game.click("#increase-img");
    const box = game.$("#next-goal");
    expect(box.classList.contains("new-goal")).toBe(true);

    game.click("#increase-img");
    // counter is 31 of 40: not yet
    expect(game.$("#next-goal")).toBe(box);
  });

  test("the countdown bar restarts when a goal is reached", () => {
    game = renderGame({ state: nearGoal });
    const before = game.$("#progress-bar");

    game.click("#increase-img");
    expect(game.$("#progress-bar")).not.toBe(before);
  });

  test("each goal uses the next color, in the border and the letters", () => {
    game = renderGame({ state: { counter: 29, highScore: 999 } });
    // the title used the first color
    expect(game.$("#next-goal").style.borderTop).toBe(
      "3px solid rgb(255, 128, 234)",
    );

    game.click("#increase-img");
    const second = "rgb(161, 147, 255)";
    expect(game.$("#next-goal").style.borderTop).toBe(`3px solid ${second}`);
    expect(
      game.$<HTMLElement>("#next-goal .goal-text > span").style.color,
    ).toBe(second);

    // 29 + 1 reached 30; the goal is 40 now
    game.click("#decrease-img");
    expect(game.$("#next-goal").style.borderTop).not.toContain(second);
  });

  test("using the last boost also moves the color along", () => {
    game = renderGame({ state: { boostsAvailable: 1, highScore: 999 } });
    game.click("#decrease-img");

    // the "no boosts" text took the second color, the new goal the third
    const letter = game.$<HTMLElement>("#next-goal .goal-text > span");
    expect(letter.style.color).toBe("rgb(154, 217, 255)");
  });

  test("starting over spells the goal out again, in reverse", () => {
    game = renderGame({ state: { counter: 12 } });
    game.click("#reset-img");

    expect(game.$("#next-goal").classList.contains("new-goal-reverse")).toBe(
      true,
    );
    const letters = game.$$("#next-goal .goal-text > span");
    // the last letter comes in first
    expect(letters[letters.length - 1].style.getPropertyValue("--delay")).toBe(
      "0s",
    );
    expect(game.$("#next-goal").textContent.replace(/ /g, " ")).toBe(
      "next: 30",
    );
  });
});

describe("the high score", () => {
  test("shows the saved high score", () => {
    game = renderGame({ state: { highScore: 70 } });
    expect(game.$("#high-score").textContent).toBe("high score: 70");
    expect(game.$("#high-score").classList.contains("new-score")).toBe(false);
  });

  test("a new best updates it, highlights it, and saves it", () => {
    game = renderGame({ state: { highScore: 1 } });
    game.click("#increase-img");
    game.click("#increase-img");

    expect(game.$("#high-score").textContent).toBe("high score: 2");
    expect(game.$("#high-score").classList.contains("new-score")).toBe(true);
    expect(game.$("#high-score").classList.contains("animate__animated")).toBe(
      true,
    );
    expect(localStorage.getItem("highScore")).toBe("2");
  });

  test("celebrates once per game, then again after starting over", () => {
    game = renderGame({ state: { highScore: 0 } });
    game.click("#increase-img");
    game.click("#increase-img");
    game.click("#increase-img");

    expect(confetti).toHaveBeenCalledTimes(1);
    expect(sounds().filter((name) => name === "highScore")).toHaveLength(1);

    game.click("#reset-img");
    expect(game.$("#high-score").classList.contains("new-score")).toBe(false);

    game.click("#increase-img");
    expect(game.counter()).toBe("01");
    // the best is 3, so one point is not a new best
    expect(confetti).toHaveBeenCalledTimes(1);
  });

  test("tells Discord about each new best", () => {
    window.electron = {
      setDiscordStatus: vi.fn(),
      quitApp: vi.fn(),
      showGpuWarning: vi.fn(),
    } as unknown as Window["electron"];

    game = renderGame({ state: { highScore: 0 } });
    game.click("#increase-img");

    expect(window.electron.setDiscordStatus).toHaveBeenCalledWith({
      highScoreRPC: 1,
    });
  });
});
