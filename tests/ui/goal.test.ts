import { afterEach, beforeEach, expect, describe, test } from "vite-plus/test";
import { act } from "react";

import GoalBox from "../../src/renderer/scripts/ui/goal/GoalBox.tsx";
import {
  cycleThemeColor,
  goal,
  goalText,
} from "../../src/renderer/scripts/ui/goal/goalStore.ts";
import { renderInto } from "../helpers/dom.ts";

describe("GoalBox", () => {
  let container: HTMLDivElement;
  let unmount: () => void;

  beforeEach(() => {
    ({ container, unmount } = renderInto(GoalBox));
  });

  afterEach(() => {
    act(() => {
      goal.update(30);
      goal.removeNewGoalEffect();
      goalText.removeNewTextEffect();
    });
    unmount();
  });

  const box = () => container.querySelector<HTMLElement>("#next-goal");
  const text = () => container.querySelector<HTMLElement>(".goal-text");
  const letters = () =>
    Array.from(text().querySelectorAll<HTMLElement>(":scope > span"));

  test("renders the goal as plain text without animating", () => {
    act(() => goal.update(60, false));

    expect(text().textContent).toBe("next: 60");
    expect(letters().length).toBe(0);
    expect(box().classList.contains("animate__animated")).toBe(true);
  });

  test("animating splits the text into staggered letters", () => {
    act(() => goal.update(60, true));

    expect(letters().length).toBe("next: 60".length);
    // the space is a non-breaking space so it keeps its width
    expect(text().textContent).toBe("next: 60");
    expect(letters()[0].style.getPropertyValue("--delay")).toBe("0s");
    expect(letters()[1].style.getPropertyValue("--delay")).toBe("0.05s");
    expect(letters()[0].style.color).not.toBe("");
  });

  test("reverse direction staggers from the last letter", () => {
    act(() => goal.update(60, true, "reverse"));

    const last = letters().length - 1;
    expect(letters()[last].style.getPropertyValue("--delay")).toBe("0s");
    expect(letters()[0].style.getPropertyValue("--delay")).toBe(
      `${last * 0.05}s`,
    );
  });

  test("each animated update replays the letters", () => {
    act(() => goal.update(60, true));
    const before = letters()[0];

    act(() => goal.update(90, true));
    expect(letters()[0]).not.toBe(before);
  });

  test("a plain update after an animated one drops the letters", () => {
    act(() => goal.update(60, true));
    act(() => goal.update(30, false));

    expect(letters().length).toBe(0);
    expect(text().textContent).toBe("next: 30");
  });

  test("the top border follows the latest color picked", () => {
    let first = "";
    let second = "";

    act(() => {
      first = cycleThemeColor();
    });
    const borderAfterFirst = box().style.borderTop;
    expect(borderAfterFirst).toContain("3px solid");

    act(() => {
      second = cycleThemeColor();
    });
    expect(second).not.toBe(first);
    expect(box().style.borderTop).not.toBe(borderAfterFirst);
  });

  test("new-goal effect adds its class and replays by remounting", () => {
    const before = box();

    act(() => goal.addNewGoalEffect("forward"));
    expect(box().classList.contains("new-goal")).toBe(true);
    expect(box()).not.toBe(before);

    act(() => goal.addNewGoalEffect("reverse"));
    expect(box().classList.contains("new-goal-reverse")).toBe(true);
    expect(box().classList.contains("new-goal")).toBe(false);

    const withEffect = box();
    act(() => goal.removeNewGoalEffect());
    expect(box().classList.contains("new-goal-reverse")).toBe(false);
    expect(box()).toBe(withEffect);
  });

  test("text effect toggles new-goal-text", () => {
    act(() => goalText.addNewTextEffect());
    expect(text().classList.contains("new-goal-text")).toBe(true);

    act(() => goalText.removeNewTextEffect());
    expect(text().classList.contains("new-goal-text")).toBe(false);
  });
});
