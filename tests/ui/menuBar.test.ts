import { afterEach, beforeEach, expect, describe, test } from "vite-plus/test";
import { act, type ComponentType, type ReactElement } from "react";

import { renderInto } from "../helpers/dom.ts";

import MenuBar from "../../src/renderer/scripts/ui/menu-bar/MenuBar.tsx";
import { audioConfig } from "../../src/renderer/scripts/controls/audioHandler.ts";

describe("MenuBar", () => {
  let container: HTMLDivElement;
  let unmount: () => void;
  const mount = (component: ReactElement | ComponentType) =>
    ({ container, unmount } = renderInto(component));
  beforeEach(() => {
    localStorage.clear();
    audioConfig.bgMusic.audio.muted = false;
    mount(MenuBar);
  });
  afterEach(() => unmount());

  const sound = () => container.querySelector<HTMLImageElement>("#soundBtn");
  const click = () =>
    act(() => {
      sound().dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

  test("sound button cycles through three states and saves it", () => {
    const first = sound().getAttribute("src");

    click();
    expect(localStorage.getItem("soundState")).toBe("1");
    expect(audioConfig.bgMusic.audio.muted).toBe(true);
    const second = sound().getAttribute("src");

    click();
    expect(localStorage.getItem("soundState")).toBe("2");
    expect(audioConfig.bgMusic.audio.volume).toBe(0);

    click();
    expect(localStorage.getItem("soundState")).toBe("0");
    expect(audioConfig.bgMusic.audio.muted).toBe(false);
    expect(sound().getAttribute("src")).toBe(first);
    expect(second).not.toBe(first);
  });

  test("restores the saved sound state on mount", () => {
    unmount();
    localStorage.setItem("soundState", "2");
    mount(MenuBar);

    expect(audioConfig.bgMusic.audio.muted).toBe(true);
    expect(audioConfig.bgMusic.audio.volume).toBe(0);
  });
});
