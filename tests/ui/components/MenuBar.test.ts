import { afterEach, beforeEach, expect, describe, test } from "vite-plus/test";
import { act, type ComponentType, type ReactElement } from "react";

import { renderInto } from "../../helpers/dom.ts";

import MenuBar from "../../../src/renderer/ui/components/hud/menu-bar/MenuBar.tsx";
import { audioConfig } from "../../../src/renderer/utils/app/sounds.ts";

describe("MenuBar", () => {
  let container: HTMLDivElement;
  let unmount: () => void;
  const mount = (component: ReactElement | ComponentType) =>
    ({ container, unmount } = renderInto(component));
  beforeEach(() => {
    localStorage.clear();
    audioConfig.bgMusic.audio.muted = false;
    audioConfig.menuMusic.audio.muted = false;
    audioConfig.gameOverMusic.audio.muted = false;
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
    // the game over music is music too, and the effects are still on
    expect(audioConfig.gameOverMusic.audio.muted).toBe(true);
    expect(audioConfig.buttonClick.audio.muted).toBe(false);
    expect(audioConfig.buttonClick.audio.volume).toBe(
      audioConfig.buttonClick.volume,
    );
    const second = sound().getAttribute("src");

    click();
    expect(localStorage.getItem("soundState")).toBe("2");
    expect(audioConfig.bgMusic.audio.volume).toBe(0);

    click();
    expect(localStorage.getItem("soundState")).toBe("0");
    expect(audioConfig.bgMusic.audio.muted).toBe(false);
    expect(audioConfig.menuMusic.audio.muted).toBe(false);
    expect(audioConfig.gameOverMusic.audio.muted).toBe(false);
    expect(sound().getAttribute("src")).toBe(first);
    expect(second).not.toBe(first);
  });
});
