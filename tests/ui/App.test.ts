import { afterEach, beforeEach, expect, describe, test } from "vite-plus/test";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";

import App from "../../src/renderer/App.tsx";

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

  test("opens on the menu, not in a game", () => {
    expect(main.querySelector("#menu-screen")).not.toBeNull();
    expect(main.querySelector("#play-btn")).not.toBeNull();
    expect(main.querySelector("#quit-game-btn")).not.toBeNull();
    expect(main.querySelector("#counter")).toBeNull();
  });
});
