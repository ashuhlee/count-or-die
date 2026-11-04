import {
  afterEach,
  beforeEach,
  expect,
  describe,
  test,
  vi,
} from "vite-plus/test";
import { act, type ComponentType, type ReactElement } from "react";

import { renderInto } from "../../helpers/dom.ts";

import {
  EXIT,
  SHOWN_FOR,
} from "../../../src/renderer/ui/overlays/game-notification/useTimedNotification.ts";
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
    expect(audioConfig.buttonClick.audio.volume).toBe(0.2);
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

  test("restores the saved sound state on mount", () => {
    unmount();
    localStorage.setItem("soundState", "2");
    mount(MenuBar);

    expect(audioConfig.bgMusic.audio.muted).toBe(true);
    expect(audioConfig.bgMusic.audio.volume).toBe(0);
  });

  test("the options button says the settings are not in the beta, for a moment", () => {
    vi.useFakeTimers();
    const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
    const options = container
      .querySelector('img[alt="options icon"]')
      .closest("button");
    const notice = () => container.querySelector("#options-notice");

    expect(notice()).toBeNull();
    act(() => {
      options.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(notice().textContent.replace(/\u00a0/g, " ")).toMatch(/beta/i);
    expect(alert).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(SHOWN_FOR));
    expect(notice().classList.contains("slide-out-left")).toBe(true);
    act(() => vi.advanceTimersByTime(EXIT));
    expect(notice()).toBeNull();

    vi.useRealTimers();
    vi.restoreAllMocks();
  });
});
