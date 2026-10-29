import {
  afterEach,
  beforeEach,
  expect,
  describe,
  test,
  vi,
} from "vite-plus/test";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";

import GameOver from "../../../src/renderer/scripts/ui/screens/game-over/GameOver.tsx";
import RedFlash from "../../../src/renderer/scripts/ui/screens/game-over/RedFlash.tsx";
import {
  flashScreen,
  gameOverScreen,
  gameOverStore,
} from "../../../src/renderer/scripts/ui/screens/game-over/gameOverStore.ts";
import { toggleGameOver } from "../../../src/renderer/scripts/core/gameOver.ts";
import { fireAnimationEnd } from "../../helpers/dom.ts";

describe("game over screen", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    localStorage.clear();
    gameOverStore.reset();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() =>
      root.render(
        createElement(
          "div",
          null,
          createElement(RedFlash),
          createElement(GameOver),
        ),
      ),
    );
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.restoreAllMocks();
  });

  const screen = () => container.querySelector("#game-over");
  const flash = () => container.querySelector("#red-flash");
  const phrase = () => container.querySelector(".go-text-random");
  const score = () => container.querySelector(".score-text");

  // the flash overlay finished its CSS animation
  const endFlash = () => fireAnimationEnd(flash());

  test("starts hidden with the saved death count", () => {
    expect(screen().classList.contains("visible")).toBe(false);
    expect(container.querySelector("#death-tracker").textContent).toBe("0");
    expect(score().textContent).toBe("score: 0");
  });

  test("game over flashes first, then shows the screen", () => {
    act(() => toggleGameOver(true, false));

    expect(flash().classList.contains("flash")).toBe(true);
    expect(screen().classList.contains("visible")).toBe(false);

    endFlash();

    expect(flash().classList.contains("flash")).toBe(false);
    expect(screen().classList.contains("visible")).toBe(true);
    expect(phrase().classList.contains("rainbow-txt")).toBe(false);
  });

  test("a new high score uses the rainbow text and a high score phrase", () => {
    act(() => toggleGameOver(true, true));
    endFlash();

    expect(phrase().classList.contains("rainbow-txt")).toBe(true);
    expect(score().classList.contains("rainbow-txt")).toBe(true);
    expect(phrase().textContent).toMatch(
      /new high score!|beat your best|getting better|new record/,
    );
  });

  test("restarting hides the screen and drops the rainbow text", () => {
    act(() => toggleGameOver(true, true));
    endFlash();
    act(() => toggleGameOver(false));

    expect(screen().classList.contains("visible")).toBe(false);
    expect(phrase().classList.contains("rainbow-txt")).toBe(false);
    expect(score().classList.contains("rainbow-txt")).toBe(false);
  });

  test("restarting during the flash cancels showing the screen", () => {
    act(() => toggleGameOver(true, false));
    act(() => toggleGameOver(false));
    endFlash();

    expect(screen().classList.contains("visible")).toBe(false);
  });

  test("a penalty flash does not open the game over screen", () => {
    act(() => flashScreen("flash-penalty"));
    expect(flash().classList.contains("flash-penalty")).toBe(true);

    endFlash();

    expect(flash().classList.contains("flash-penalty")).toBe(false);
    expect(screen().classList.contains("visible")).toBe(false);
  });

  test("shows the death count and final score", () => {
    act(() => {
      gameOverScreen.setDeathCount(7);
      gameOverScreen.setScoreText("Score: 42");
    });

    expect(container.querySelector("#death-tracker").textContent).toBe("7");
    expect(score().textContent).toBe("Score: 42");
  });

  test("back to menu tilts the opposite way each hover", () => {
    const menu = () => container.querySelector<HTMLElement>("#menu-btn");
    const hover = (type: string) =>
      act(() => {
        menu().dispatchEvent(new MouseEvent(type, { bubbles: true }));
      });

    hover("mouseover");
    expect(menu().style.transform).toContain("-4deg");
    hover("mouseout");
    expect(menu().style.transform).toBe("");

    hover("mouseover");
    expect(menu().style.transform).toContain("4deg");
    expect(menu().style.transform).not.toContain("-4deg");
  });
});
