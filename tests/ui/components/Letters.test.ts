import { afterEach, describe, expect, test } from "vite-plus/test";
import { createElement } from "react";

import { renderInto } from "../../helpers/dom.ts";

import Letters from "../../../src/renderer/ui/components/letters/Letters.tsx";

describe("Letters", () => {
  let unmount: () => void;
  afterEach(() => unmount());

  const spans = (props: Parameters<typeof Letters>[0]) => {
    const rendered = renderInto(createElement(Letters, props));
    unmount = rendered.unmount;
    return [...rendered.container.querySelectorAll("span")];
  };

  test("gives every letter its own span", () => {
    expect(spans({ text: "hi!", step: 0.1 }).map((s) => s.textContent)).toEqual(
      ["h", "i", "!"],
    );
  });

  test("keeps the space between words as a hard space", () => {
    const [, space] = spans({ text: "a b", step: 0.1 });
    expect(space.textContent).toBe("\u00a0");
  });

  test("starts each letter a step after the one before", () => {
    const delays = spans({ text: "abc", step: 0.2 }).map((s) =>
      s.style.getPropertyValue("--delay"),
    );
    expect(delays).toEqual(["0s", "0.2s", "0.4s"]);
  });

  test("tells every letter its place and how many there are", () => {
    const letters = spans({ text: "abc", step: 0.1 });
    expect(letters.map((s) => s.style.getPropertyValue("--index"))).toEqual([
      "0",
      "1",
      "2",
    ]);
    for (const letter of letters) {
      expect(letter.style.getPropertyValue("--count")).toBe("3");
    }
  });

  test("leaves the wave to the stylesheet unless asked", () => {
    const [letter] = spans({ text: "a", step: 0.1 });
    expect(letter.style.getPropertyValue("--wave-height")).toBe("");
    expect(letter.style.getPropertyValue("--wave-duration")).toBe("");
  });

  test("passes the wave height and duration to every letter", () => {
    const letters = spans({ text: "ab", step: 0.1, height: 4, duration: 1.5 });
    for (const letter of letters) {
      expect(letter.style.getPropertyValue("--wave-height")).toBe("4px");
      expect(letter.style.getPropertyValue("--wave-duration")).toBe("1.5s");
    }
  });

  test("lets a height of 0 mean no movement", () => {
    const [letter] = spans({ text: "a", step: 0.1, height: 0 });
    expect(letter.style.getPropertyValue("--wave-height")).toBe("0px");
  });
});
