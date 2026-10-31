import { afterEach, beforeEach, expect, describe, test } from "vite-plus/test";
import { act, type ComponentType, type ReactElement } from "react";

import { renderInto } from "../../helpers/dom.ts";

import MenuBar from "../../../src/renderer/ui/components/menu-bar/MenuBar.tsx";
import { audioConfig } from "../../../src/renderer/utils/sounds.ts";

describe("MenuBar", () => {
  let container: HTMLDivElement;
  let unmount: () => void;
  const mount = (component: ReactElement | ComponentType) =>
    ({ container, unmount } = renderInto(component));
  beforeEach(() => {
    localStorage.clear();
    audioConfig.bgMusic.audio.muted = false;
    audioConfig.menuMusic.audio.muted = false;
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
    expect(audioConfig.menuMusic.audio.muted).toBe(true);
    const second = sound().getAttribute("src");

    click();
    expect(localStorage.getItem("soundState")).toBe("2");
    expect(audioConfig.bgMusic.audio.volume).toBe(0);

    click();
    expect(localStorage.getItem("soundState")).toBe("0");
    expect(audioConfig.bgMusic.audio.muted).toBe(false);
    expect(audioConfig.menuMusic.audio.muted).toBe(false);
    expect(sound().getAttribute("src")).toBe(first);
    expect(second).not.toBe(first);
  });

  test("the sound and settings buttons are round pictures with an icon in them", () => {
    const buttons = Array.from(
      container.querySelectorAll<HTMLButtonElement>(".round-btn"),
    );

    expect(buttons).toHaveLength(2);
    for (const button of buttons) {
      expect(button.querySelector(".round-btn-face")).not.toBeNull();
      expect(button.querySelector(".round-btn-icon")).not.toBeNull();
    }
    const faces = buttons.map((button) =>
      button.querySelector(".round-btn-face").getAttribute("src"),
    );
    expect(faces[0]).not.toBe(faces[1]);
    expect(buttons.filter((button) => button.contains(sound()))).toHaveLength(
      1,
    );
  });

  test("restores the saved sound state on mount", () => {
    unmount();
    localStorage.setItem("soundState", "2");
    mount(MenuBar);

    expect(audioConfig.bgMusic.audio.muted).toBe(true);
    expect(audioConfig.bgMusic.audio.volume).toBe(0);
  });
});
