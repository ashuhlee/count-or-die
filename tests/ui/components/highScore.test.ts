import { afterEach, beforeEach, expect, describe, test } from "vite-plus/test";
import { act, type ComponentType, type ReactElement } from "react";

import { renderInto } from "../../helpers/dom.ts";

import HighScore from "../../../src/renderer/scripts/ui/components/high-score/HighScore.tsx";
import { highScore } from "../../../src/renderer/scripts/ui/components/high-score/highScoreStore.ts";

describe("HighScore", () => {
  let container: HTMLDivElement;
  let unmount: () => void;
  const mount = (component: ReactElement | ComponentType) =>
    ({ container, unmount } = renderInto(component));
  beforeEach(() => mount(HighScore));
  afterEach(() => {
    act(() => {
      highScore.update(0);
      highScore.removeNewScoreEffect();
    });
    unmount();
  });

  test("shows the score", () => {
    expect(container.querySelector("#high-score").textContent).toBe(
      "high score: 0",
    );

    act(() => highScore.update(101));
    expect(container.querySelector("#high-score").textContent).toBe(
      "high score: 101",
    );
  });

  test("toggles the new-score class and keeps animate__animated", () => {
    const el = container.querySelector("#high-score");

    act(() => highScore.addNewScoreEffect());
    expect(el.classList.contains("new-score")).toBe(true);
    expect(el.classList.contains("animate__animated")).toBe(true);

    act(() => highScore.removeNewScoreEffect());
    expect(el.classList.contains("new-score")).toBe(false);
    expect(el.classList.contains("animate__animated")).toBe(true);
  });
});
