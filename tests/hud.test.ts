import {
  afterEach,
  beforeEach,
  expect,
  describe,
  test,
  vi,
} from "vite-plus/test";
import { act, createElement, type ComponentType } from "react";
import { createRoot, type Root } from "react-dom/client";

import Controls from "../src/renderer/scripts/react/Controls.tsx";
import CursorCounts from "../src/renderer/scripts/react/CursorCounts.tsx";
import HighScore from "../src/renderer/scripts/react/HighScore.tsx";
import LoadingScreen from "../src/renderer/scripts/react/LoadingScreen.tsx";

import { audioConfig } from "../src/renderer/scripts/controls/audioHandler.ts";
import {
  cursorStore,
  displayCursorCount,
} from "../src/renderer/scripts/react/cursorStore.ts";
import { highScore } from "../src/renderer/scripts/react/highScoreStore.ts";
import {
  hideLoadingScreen,
  showLoadingScreen,
} from "../src/renderer/scripts/react/loadingStore.ts";

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

function mount(component: ComponentType) {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root.render(createElement(component)));
}

function unmount() {
  act(() => root.unmount());
  container.remove();
}

describe("HighScore", () => {
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

describe("LoadingScreen", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mount(LoadingScreen);
  });
  afterEach(() => {
    unmount();
    vi.useRealTimers();
  });

  const screen = () => container.querySelector("#loading-screen");

  test("is not rendered until shown", () => {
    expect(screen()).toBeNull();
  });

  test("shows, becomes visible next frame, then hides and unmounts", () => {
    act(() => showLoadingScreen());
    expect(screen()).not.toBeNull();
    expect(screen().classList.contains("visible")).toBe(false);

    act(() => vi.advanceTimersByTime(20));
    expect(screen().classList.contains("visible")).toBe(true);

    act(() => hideLoadingScreen());
    expect(screen().classList.contains("hiding")).toBe(true);

    act(() => vi.advanceTimersByTime(600));
    expect(screen()).toBeNull();
  });

  test("hide without show does nothing", () => {
    act(() => hideLoadingScreen());
    expect(screen()).toBeNull();
  });

  test("showing again during the hide delay cancels the removal", () => {
    act(() => showLoadingScreen());
    act(() => hideLoadingScreen());
    act(() => vi.advanceTimersByTime(300));
    act(() => showLoadingScreen());
    act(() => vi.advanceTimersByTime(600));

    expect(screen()).not.toBeNull();
    expect(screen().classList.contains("hiding")).toBe(false);
  });
});

describe("Controls", () => {
  beforeEach(() => {
    localStorage.clear();
    audioConfig.bgMusic.audio.muted = false;
    mount(Controls);
  });
  afterEach(unmount);

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
    mount(Controls);

    expect(audioConfig.bgMusic.audio.muted).toBe(true);
    expect(audioConfig.bgMusic.audio.volume).toBe(0);
  });
});

describe("CursorCounts", () => {
  let finish: Array<() => void>;

  beforeEach(() => {
    finish = [];
    // jsdom has no Web Animations API
    Element.prototype.animate = (() => ({
      addEventListener: (_: string, cb: () => void) => finish.push(cb),
      removeEventListener: () => {},
      cancel: () => {},
    })) as unknown as typeof Element.prototype.animate;
    mount(CursorCounts);
  });
  afterEach(() => {
    unmount();
    cursorStore.getSnapshot().forEach((c) => cursorStore.remove(c.id));
    delete (Element.prototype as { animate?: unknown }).animate;
  });

  const spans = () => container.querySelectorAll<HTMLElement>(".count-cursor");
  const click = { clientX: 40, clientY: 60 } as MouseEvent;

  test("renders +N at the pointer and removes it when the animation ends", () => {
    act(() => displayCursorCount(5, click, false));

    expect(spans().length).toBe(1);
    expect(spans()[0].textContent).toBe("+5");
    expect(spans()[0].style.left).toBe("40px");
    expect(spans()[0].style.top).toBe("60px");

    act(() => finish[0]());
    expect(spans().length).toBe(0);
  });

  test("boosted counts cycle through colors, plain ones stay white", () => {
    act(() => {
      displayCursorCount(1, click, true);
      displayCursorCount(2, click, true);
      displayCursorCount(3, click, false);
    });

    const [a, b, c] = Array.from(spans()).map((s) => s.style.color);
    expect(a).not.toBe(b);
    expect(c).toBe("rgb(255, 255, 255)");
  });
});
