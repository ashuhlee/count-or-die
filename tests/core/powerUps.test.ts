import {
  afterEach,
  beforeEach,
  expect,
  describe,
  test,
  vi,
} from "vite-plus/test";
import { act } from "react";

import PowerUps from "../../src/renderer/scripts/ui/power-ups/PowerUps.tsx";
import {
  powerUpStore,
  powerUps,
} from "../../src/renderer/scripts/ui/power-ups/powerUpStore.ts";
import { gameOverStore } from "../../src/renderer/scripts/ui/game-over/gameOverStore.ts";
import { smokeStore } from "../../src/renderer/scripts/ui/smoke/smokeStore.ts";
import { counter } from "../../src/renderer/scripts/ui/counter/counterStore.ts";
import { heartStore } from "../../src/renderer/scripts/ui/hearts/heartStore.ts";

import setPowerUps from "../../src/renderer/scripts/core/powerUps.ts";
import GameState from "../../src/renderer/scripts/core/gameState.ts";
import { fireAnimationEnd, renderInto } from "../helpers/dom.ts";

window.HTMLMediaElement.prototype.play = () => Promise.resolve();

let container: HTMLDivElement;
let unmount: () => void;

// jsdom does not lay anything out, so say how wide the spawn area is
function setSpawnAreaWidth(width: number) {
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    get: () => width,
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  gameOverStore.reset();
  smokeStore.reset();
  heartStore.reset();
  setSpawnAreaWidth(1000);

  document.body.innerHTML = `<div id="game-container"></div>`;
  ({ container, unmount } = renderInto(PowerUps));
});

afterEach(() => {
  act(() => powerUps.clear());
  unmount();
  delete (HTMLElement.prototype as { offsetWidth?: unknown }).offsetWidth;
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const icons = () =>
  Array.from(container.querySelectorAll<HTMLImageElement>(".power-up-img"));

describe("PowerUps component", () => {
  const spawn = (overrides = {}) => {
    const onCollect = vi.fn();
    const onMiss = vi.fn();
    act(() =>
      powerUps.spawn({
        type: "double_click",
        icon: "candy.png",
        side: "left",
        fall: "falling",
        xRand: 0.5,
        onCollect,
        onMiss,
        ...overrides,
      }),
    );
    return { onCollect, onMiss };
  };

  test("renders nothing until something spawns", () => {
    expect(container.querySelector(".spawn-area")).toBeNull();
  });

  test("renders a falling icon inside a spawn area", () => {
    spawn({ type: "four_click", side: "right", fall: "falling-reverse" });

    const [img] = icons();
    expect(img.parentElement.className).toBe("spawn-area");
    expect(img.getAttribute("src")).toBe("candy.png");
    expect(img.dataset.powerUpType).toBe("four_click");
    expect(img.classList.contains("spawn-area--right")).toBe(true);
    expect(img.style.animation).toContain("falling-reverse");
    expect(img.style.animation).toContain("2.8s");
  });

  test("on a wide screen it is nudged in from its edge", () => {
    setSpawnAreaWidth(1000);
    spawn({ side: "left", xRand: 0.5 });
    // min(1000 / 3, 150) + 1 = 151, so half of it floors to 75
    expect(icons()[0].style.left).toBe("75px");

    spawn({ side: "right", xRand: 0 });
    expect(icons()[1].style.right).toBe("0px");
  });

  test("on a narrow screen it is not nudged", () => {
    setSpawnAreaWidth(500);
    spawn({ side: "left", xRand: 0.9 });

    expect(icons()[0].style.left).toBe("");
  });

  test("clicking collects it: removed, with its on-screen position", () => {
    const { onCollect, onMiss } = spawn();

    act(() => {
      icons()[0].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onCollect).toHaveBeenCalledTimes(1);
    expect(onCollect.mock.calls[0][0]).toHaveProperty("left");
    expect(onMiss).not.toHaveBeenCalled();
    expect(icons().length).toBe(0);
    expect(container.querySelector(".spawn-area")).toBeNull();
  });

  test("falling off the screen misses it", () => {
    const { onCollect, onMiss } = spawn();
    fireAnimationEnd(icons()[0]);

    expect(onMiss).toHaveBeenCalledTimes(1);
    expect(onCollect).not.toHaveBeenCalled();
    expect(icons().length).toBe(0);
  });

  test("clear() removes everything on screen", () => {
    spawn();
    spawn();
    expect(icons().length).toBe(2);

    act(() => powerUps.clear());
    expect(icons().length).toBe(0);
    expect(powerUpStore.getSnapshot()).toEqual([]);
  });
});

describe("power-up system", () => {
  let state: GameState;
  let system: ReturnType<typeof setPowerUps>;
  let counterUpdate: ReturnType<typeof vi.spyOn>;

  // with Math.random fixed, which power-up appears: 0 is the first (candy,
  // 2x), 0.8 is the bad donut when boosts are full
  function spawnWith(random: number) {
    vi.spyOn(Math, "random").mockReturnValue(random);
    act(() => system.spawnCooldown());
    act(() => vi.advanceTimersByTime(12000));
  }

  const click = () =>
    act(() => {
      icons()[0].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

  beforeEach(() => {
    state = new GameState();
    system = setPowerUps({ counter, state });
    counterUpdate = vi.spyOn(counter, "update");
  });

  afterEach(() => {
    act(() => system.clearPowerUps());
  });

  test("nothing spawns before the cooldown is up", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    act(() => system.spawnCooldown());
    act(() => vi.advanceTimersByTime(5999));

    expect(icons().length).toBe(0);
    act(() => vi.advanceTimersByTime(1));
    expect(icons().length).toBe(1);
  });

  test("does not spawn once the game is over", () => {
    state.isGameOver = true;
    spawnWith(0);

    expect(icons().length).toBe(0);
  });

  test("collecting a 2x power-up doubles clicks for 3 seconds", () => {
    spawnWith(0);
    expect(icons()[0].dataset.powerUpType).toBe("double_click");

    click();
    expect(state.countIncrement).toBe(2);

    act(() => vi.advanceTimersByTime(3000));
    expect(state.countIncrement).toBe(1);
  });

  test("collecting shows a smoke puff and takes the icon off screen", () => {
    spawnWith(0);
    click();

    expect(icons().length).toBe(0);
    expect(smokeStore.getSnapshot().powerUpUsedElement.visible).toBe(true);
  });

  test("the bad donut costs 25 points and flashes the screen", () => {
    state.counter = 40;
    spawnWith(0.8);
    expect(icons()[0].dataset.powerUpType).toBe("minus_25");

    click();

    expect(state.counter).toBe(15);
    expect(counterUpdate).toHaveBeenCalledWith(15);
    expect(gameOverStore.getSnapshot().flash).toBe("flash-penalty");
    expect(
      document
        .getElementById("game-container")
        .classList.contains("penalty-shake"),
    ).toBe(true);
  });

  test("a good power-up does not flash the screen", () => {
    spawnWith(0);
    click();

    expect(gameOverStore.getSnapshot().flash).toBeNull();
  });

  test("boost power-ups never spawn while boosts are full", () => {
    state.boostsAvailable = 4;
    const seen = new Set<string>();

    for (const random of [0, 0.3, 0.5, 0.7, 0.8, 0.9, 0.99]) {
      spawnWith(random);
      seen.add(icons()[0].dataset.powerUpType);
      act(() => powerUps.clear());
    }

    expect(seen.has("extra_boost")).toBe(false);
    expect(seen.has("replenish_boosts")).toBe(false);
  });

  test("with a boost missing, the star can spawn and restores a boost", () => {
    state.boostsAvailable = 3;
    // 0.85 * 98 = 83.3: past the four types before it, so the extra boost
    spawnWith(0.85);
    expect(icons()[0].dataset.powerUpType).toBe("extra_boost");

    click();
    expect(state.boostsAvailable).toBe(4);
  });

  test("collecting restarts the spawn cooldown", () => {
    spawnWith(0);
    click();

    expect(icons().length).toBe(0);
    act(() => vi.advanceTimersByTime(12000));
    expect(icons().length).toBe(1);
  });

  test("missing one also restarts the cooldown", () => {
    spawnWith(0);
    fireAnimationEnd(icons()[0]);

    expect(icons().length).toBe(0);
    act(() => vi.advanceTimersByTime(12000));
    expect(icons().length).toBe(1);
  });

  test("clearPowerUps() clears the screen and stops the timer", () => {
    spawnWith(0);
    vi.spyOn(Math, "random").mockReturnValue(0);
    act(() => system.spawnCooldown());

    act(() => system.clearPowerUps());
    expect(icons().length).toBe(0);

    act(() => vi.advanceTimersByTime(20000));
    expect(icons().length).toBe(0);
  });
});
