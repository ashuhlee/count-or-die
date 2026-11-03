import { afterEach, beforeEach, expect, describe, test, vi } from "vitest";
import { act } from "react";

import { renderGame } from "../../helpers/game.tsx";
import { stubWebAnimations } from "../../helpers/dom.ts";
import { hideStartupScreen } from "../../../src/renderer/utils/app/startup.ts";

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

// a round lasts 20 seconds; time is up a hair before
const TIME_IS_UP = 19900;

// the three layers the counter is drawn with
const layers = ["#counter", "#counter-outer", "#counter-shine"];
const hearts = () => game.$$(".hearts > div");
const usedHearts = () =>
  hearts().map((heart) => heart.classList.contains("heart-use"));
const sounds = () => audio.playSound.mock.calls.map(([name]) => name);

describe("a fresh game", () => {
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

  test("a boost says so, for a moment", () => {
    game = renderGame();
    expect(game.$("#boost-notice")).toBeNull();

    game.press(" ");
    expect(game.$("#boost-notice")).not.toBeNull();
    // it says how many the boost added
    expect(game.$("#boost-notice .diamond-notice--text").textContent).toContain(
      "+30",
    );

    game.wait(2500);
    expect(game.$("#boost-notice")).toBeNull();
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

  test("holding a key keeps scoring while developing, to test with", () => {
    vi.stubEnv("DEV", true);
    game = renderGame();
    game.press("w");
    for (let i = 0; i < 5; i++) game.press("w", { repeat: true });

    expect(game.counter()).toBe("06");
  });

  test("holding space boosts once", () => {
    vi.stubEnv("DEV", false);
    game = renderGame();
    game.press(" ");
    for (let i = 0; i < 5; i++) game.press(" ", { repeat: true });

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

  test("Escape says the settings are not there yet, in a notification", () => {
    const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
    game = renderGame();
    expect(game.$("#options-notice")).toBeNull();

    game.press("Escape");
    expect(game.$("#options-notice")).not.toBeNull();
    expect(alert).not.toHaveBeenCalled();
  });

  describe("the sparkles on the end of the progress bar", () => {
    // jsdom lays nothing out: the bar is half full, on a 140 wide track
    beforeEach(() => {
      vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
        function (this: Element) {
          const width = this.classList.contains("progress-bar") ? 70 : 140;
          return {
            left: 0,
            right: width,
            width,
            top: 0,
            bottom: 13,
            height: 13,
          } as DOMRect;
        },
      );
    });

    const sparkles = () => game.$$(".pg-sparkle");

    test("come off the end of it while a power-up is running", () => {
      game = renderGame({ state: { countIncrement: 2 } });
      expect(sparkles()).toHaveLength(0);

      game.click("#increase-img");
      game.click("#increase-img");
      game.wait(300);
      expect(sparkles().length).toBeGreaterThan(0);

      // they are gone again a moment after it ends
      game.wait(TIME_IS_UP);
      game.wait(1000);
      expect(sparkles()).toHaveLength(0);
    });

    test("go on through the warning and the critical stages, until time is up", () => {
      game = renderGame({ state: { countIncrement: 2 } });
      game.click("#increase-img");
      game.click("#increase-img");
      game.wait(300);
      expect(sparkles().length).toBeGreaterThan(0);

      // the bar changes color about half way through the round
      game.wait(10000);
      expect(sparkles().length).toBeGreaterThan(0);

      // and again, to the critical color, a while later
      game.wait(4000);
      expect(sparkles().length).toBeGreaterThan(0);

      // none are made any more once the run is over, the last ones go
      game.wait(TIME_IS_UP);
      game.wait(1000);
      expect(sparkles()).toHaveLength(0);
    });

    test("do not come for a high score, only for a power-up", () => {
      game = renderGame({ state: { highScore: 1, highScoreAtStart: 1 } });
      game.click("#increase-img");
      game.click("#increase-img");
      game.wait(500);

      expect(sparkles()).toHaveLength(0);
    });
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

  test("uses the right-most heart first", () => {
    game = renderGame();
    game.click("#decrease-img");

    expect(usedHearts()).toEqual([false, false, false, true]);
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
