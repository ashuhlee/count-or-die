import { afterEach, beforeEach, expect, describe, test } from "vite-plus/test";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";

import App from "../../src/renderer/App.tsx";

// ids the stylesheet targets and no other test looks for; the rest are checked
// by the tests that use them
const IDS = [
  "main",
  "goal-chatbox",
  "boost-1",
  "boost-2",
  "boost-3",
  "boost-4",
  "heart1",
  "heart2",
  "heart3",
  "heart4",
];

describe("App", () => {
  let main: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    localStorage.clear();
    main = document.createElement("div");
    main.id = "main";
    document.body.appendChild(main);
    root = createRoot(main);
    act(() => root.render(createElement(App)));
  });

  afterEach(() => {
    act(() => root.unmount());
    main.remove();
  });

  test.each(IDS.filter((id) => id !== "main"))("has #%s", (id) => {
    expect(main.querySelector(`#${id}`)).not.toBeNull();
  });

  test("renders the version, the title and the starting counter", () => {
    expect(main.querySelector("#app-ver").textContent).toContain(
      __APP_VERSION__,
    );
    expect(main.querySelector(".game-name").textContent).toBe("count or die");
    expect(main.querySelector("#counter").textContent).toBe("00");
    expect(main.querySelectorAll(".hearts > div").length).toBe(4);
  });

  test("keeps the order the CSS expects", () => {
    const children = Array.from(main.children).map(
      (el) => el.id || el.className,
    );

    expect(children.indexOf("red-flash")).toBeLessThan(
      children.indexOf("game-over"),
    );
    expect(children.indexOf("game-over")).toBeLessThan(children.indexOf("app"));
    expect(children.indexOf("app")).toBeLessThan(
      children.indexOf("high-score"),
    );
  });
});
