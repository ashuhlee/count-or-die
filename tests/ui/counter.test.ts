import { afterEach, beforeEach, expect, describe, test } from "vite-plus/test";
import { act } from "react";

import Counter from "../../src/renderer/scripts/ui/counter/Counter.tsx";
import {
  counter,
  formatCounter,
} from "../../src/renderer/scripts/ui/counter/counterStore.ts";
import { renderInto } from "../helpers/dom.ts";

describe("Counter", () => {
  let container: HTMLDivElement;
  let unmount: () => void;

  beforeEach(() => {
    ({ container, unmount } = renderInto(Counter));
  });

  afterEach(() => {
    unmount();
    counter.update(0);
  });

  const text = (id: string) => container.querySelector(`#${id}`)?.textContent;

  test("formats values with a zero pad and sign", () => {
    expect(formatCounter(0)).toBe("00");
    expect(formatCounter(7)).toBe("07");
    expect(formatCounter(30)).toBe("30");
    expect(formatCounter(-4)).toBe("-04");
  });

  test("update() renders the value in all three text layers", () => {
    act(() => counter.update(7));

    expect(text("counter")).toBe("07");
    expect(text("counter-outer")).toBe("07");
    expect(text("counter-shine")).toBe("07");
  });

  test("animate() adds the class to all three layers", () => {
    counter.animate("pop");

    for (const id of ["counter", "counter-outer", "counter-shine"]) {
      expect(container.querySelector(`#${id}`)?.classList.contains("pop")).toBe(
        true,
      );
    }
  });

  test("animate() keeps working after a re-render", () => {
    act(() => counter.update(1));
    counter.animate("pop");
    act(() => counter.update(2));

    expect(container.querySelector("#counter")?.classList.contains("pop")).toBe(
      true,
    );
  });
});
