import { afterEach, beforeEach, expect, describe, test, vi } from "vitest";
import { act } from "react";
import confetti from "canvas-confetti";

import { renderGame } from "../../helpers/game.tsx";
import { stubWebAnimations } from "../../helpers/dom.ts";
import { hideStartupScreen } from "../../../src/renderer/utils/startup.ts";

// the game plays sounds through this; here we only want to know which
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
});

afterEach(() => {
  game.unmount();
  animations.restore();
  delete window.electron;
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// a round lasts 20 seconds; time is up a hair before
const TIME_IS_UP = 19900;

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
    expect(game.$("#next-goal").textContent?.replace(/\u00a0/g, " ")).toBe(
      "next: 30",
    );
    expect(usedHearts()).toEqual([false, false, false, false]);
    expect(game.$("#no-boosts").style.display).toBe("none");
    expect(game.$("#app-ver").textContent).toContain("0.0.0-test");
  });

  test("starts the music", () => {
    game = renderGame();
    expect(sounds()).toContain("bgMusic");
  });

  describe("with the startup screen up", () => {
    beforeEach(() => {
      document.body.insertAdjacentHTML(
        "beforeend",
        '<div id="startup-screen"></div>',
      );
    });
    afterEach(() => document.getElementById("startup-screen")?.remove());

    // lets the screen go, with the game told about it
    const letScreenGo = async () => {
      let hiding!: Promise<void>;
      await act(async () => {
        hiding = hideStartupScreen(100, 300);
        await vi.advanceTimersByTimeAsync(100);
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
        await hiding;
      });
    };

    test("keeps the music quiet until the screen goes", async () => {
      game = renderGame();
      expect(sounds()).not.toContain("bgMusic");

      await letScreenGo();
      expect(sounds().filter((name) => name === "bgMusic")).toHaveLength(1);
    });

    test("does not run the round until the screen goes", async () => {
      game = renderGame();

      game.wait(TIME_IS_UP * 2);
      expect(game.$("#game-over").classList.contains("visible")).toBe(false);
      expect(game.$("#death-tracker").textContent).toBe("0");

      await letScreenGo();
      game.wait(TIME_IS_UP);
      expect(game.$("#death-tracker").textContent).toBe("1");
    });

    test("holds the countdown bar until the screen goes", async () => {
      game = renderGame();
      const bar = () => game.$("#progress-bar").style.animationPlayState;
      expect(bar()).toBe("paused");
      expect(game.$(".pg-lines").style.animationPlayState).toBe("paused");

      await letScreenGo();
      expect(bar()).toBe("running");
      expect(game.$(".pg-lines").style.animationPlayState).toBe("running");
    });

    test("ignores the keys until the screen goes", async () => {
      game = renderGame();

      game.press("w");
      game.press("Escape");
      expect(game.counter()).toBe("00");

      await letScreenGo();
      game.press("w");
      expect(game.counter()).toBe("01");
    });

    test("sends no power-up down until the screen goes", async () => {
      game = renderGame({ random: () => 0 });

      game.wait(60000);
      expect(game.$$(".power-up-img")).toHaveLength(0);

      await letScreenGo();
      game.wait(13000);
      expect(game.$$(".power-up-img").length).toBeGreaterThan(0);
    });
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

  test("stops listening when the game goes away", () => {
    const remove = vi.spyOn(document, "removeEventListener");
    game = renderGame();
    game.unmount();

    expect(remove).toHaveBeenCalledWith("keydown", expect.any(Function));
    // so afterEach has a game to unmount
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
    expect(game.$$(".smoke-puff")).toHaveLength(1);
    expect(game.$(".smoke-puff").getAttribute("src")).toContain("smoke");

    game.wait(2999);
    expect(game.$$(".smoke-puff")).toHaveLength(1);
    game.wait(1);
    expect(game.$$(".smoke-puff")).toHaveLength(0);
  });

  test("every puff of smoke is its own picture, so it always starts from the start", () => {
    game = renderGame();
    game.click("#decrease-img");
    game.wait(1);
    game.click("#decrease-img");

    const [first, second] = game
      .$$(".smoke-puff")
      .map((puff) => puff.getAttribute("src"));
    expect(first).toContain("smoke");
    expect(second).toContain("smoke");
    expect(second).not.toBe(first);
  });

  test("every use of a boost puffs its own smoke", () => {
    game = renderGame();
    game.click("#decrease-img");
    game.wait(1000);
    game.click("#decrease-img");

    expect(game.$$(".smoke-puff")).toHaveLength(2);
    game.wait(2000);
    expect(game.$$(".smoke-puff")).toHaveLength(1);
    game.wait(1000);
    expect(game.$$(".smoke-puff")).toHaveLength(0);
  });

  test("puffs the smoke where the last heart was, not where the layout moved it", () => {
    game = renderGame({ state: { boostsAvailable: 1 } });

    // there is no layout here, so the hearts are placed by hand: the "no
    // boosts left!" text pushes them 45px down
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
      function (this: Element) {
        const pushedDown = game.$("#no-boosts").style.display === "grid";
        return { left: 100, top: pushedDown ? 445 : 400 } as DOMRect;
      },
    );
    game.click("#decrease-img");

    expect(game.$(".smoke-puff").style.top).toBe("400px");
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

  test("the goal text shakes from the start, one letter after another", () => {
    game = renderGame();

    const letters = game.$$("#next-goal .goal-text > span");
    expect(letters).toHaveLength("next: 30".length);
    expect(letters[0].style.getPropertyValue("--wave-delay")).toBe("0s");
    expect(letters[1].style.getPropertyValue("--wave-delay")).toBe("0.3s");
    expect(letters[0].style.getPropertyValue("--wave-duration")).toBe("3s");
    expect(game.$(".goal-text").classList.contains("fade-up-text")).toBe(false);
  });

  test("each letter shakes inside the span that brings it in", () => {
    game = renderGame({ state: nearGoal });
    game.click("#increase-img");

    expect(game.$(".goal-text").classList.contains("fade-up-text")).toBe(true);
    for (const letter of game.$$("#next-goal .goal-text > span")) {
      expect(letter.querySelectorAll(":scope > span")).toHaveLength(1);
    }
    expect(game.$("#next-goal").textContent?.replace(/\u00a0/g, " ")).toBe(
      "next: 40",
    );
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

  test("each goal's letters take the next color, and the border stays one color", () => {
    game = renderGame({ state: { counter: 29, highScore: 999 } });
    const border = () =>
      game.$(".goal-bubble").style.getPropertyValue("--goal-border");
    const letter = () =>
      game.$<HTMLElement>("#next-goal .goal-text > span").style.color;
    const fixed = border();
    expect(fixed).toMatch(/^#[0-9a-f]{6}$/i);

    game.click("#increase-img");
    expect(letter()).toBe("rgb(161, 147, 255)");
    expect(border()).toBe(fixed);

    // 29 + 1 reached 30; the goal is 40 now
    game.click("#decrease-img");
    expect(letter()).not.toBe("rgb(161, 147, 255)");
    expect(border()).toBe(fixed);
  });

  test("the chat tip is drawn in the same border color, inside the same bubble", () => {
    game = renderGame();

    const bubble = game.$(".goal-bubble");
    expect(bubble.querySelector("#next-goal")).not.toBeNull();
    const tip = bubble.querySelector(".chat-tip");
    expect(tip).not.toBeNull();
    expect(tip?.querySelector("g")?.getAttribute("fill")).toBe(
      "var(--goal-border, white)",
    );
    expect(tip?.querySelectorAll("use")).toHaveLength(4);
  });

  test("the chat tip's border is cut off exactly where the goal box ends", () => {
    game = renderGame();

    const tip = game.$(".chat-tip");
    const cutOff = parseInt(
      game.$(".chat-tip-frame").style.clipPath.match(/inset\((\d+)px/)?.[1] ??
        "",
    );
    // the tip sits this far up into the box, and the border starts right there
    expect(cutOff).toBeGreaterThan(0);
    expect(tip.style.marginTop).toBe(`-${cutOff}px`);
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
