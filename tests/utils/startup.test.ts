import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vite-plus/test";

import {
  afterPaint,
  hideStartupScreen,
  preload,
} from "../../src/renderer/utils/startup.ts";

describe("preload", () => {
  const decoded: string[] = [];
  const loadedFonts: string[] = [];
  let decode: () => Promise<void>;

  beforeEach(() => {
    decoded.length = 0;
    loadedFonts.length = 0;
    decode = () => Promise.resolve();
    // jsdom does not load pictures or fonts, so both are stood in for
    Object.defineProperty(window.HTMLImageElement.prototype, "decode", {
      configurable: true,
      value(this: HTMLImageElement) {
        decoded.push(this.getAttribute("src") ?? "");
        return decode();
      },
    });
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: {
        load: (font: string) => {
          loadedFonts.push(font);
          return Promise.resolve([]);
        },
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    Reflect.deleteProperty(document, "fonts");
    Reflect.deleteProperty(window.HTMLImageElement.prototype, "decode");
  });

  test("reports how much has loaded", async () => {
    const reported: number[] = [];
    await preload(["a.png", "b.gif"], ["16px One"], 5000, (fraction) =>
      reported.push(fraction),
    );
    expect(reported[0]).toBe(0);
    expect(reported.at(-1)).toBe(1);
    expect(reported).toEqual([...reported].sort((a, b) => a - b));
  });

  test("shows the progress on the startup screen", async () => {
    document.body.innerHTML = '<div id="startup-screen"></div>';
    await preload(["a.png"], []);
    expect(
      document
        .getElementById("startup-screen")
        ?.style.getPropertyValue("--progress"),
    ).toBe("1");
    document.body.innerHTML = "";
  });

  test("loads every picture and every font", async () => {
    await preload(["a.png", "b.gif"], ["16px One", "16px Two"]);
    expect(decoded).toEqual(["a.png", "b.gif"]);
    expect(loadedFonts).toEqual(["16px One", "16px Two"]);
  });

  test("does not hold the game for a picture that fails", async () => {
    decode = () => Promise.reject(new Error("broken"));
    await expect(preload(["gone.png"], [])).resolves.toBeUndefined();
  });

  test("does not hold the game for a font that fails", async () => {
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { load: () => Promise.reject(new Error("no such font")) },
    });
    await expect(preload([], ["16px Missing"])).resolves.toBeUndefined();
  });

  test("stops waiting after a while", async () => {
    vi.useFakeTimers();
    decode = () => new Promise(() => {});
    let done = false;
    const waiting = preload(["never.png"], [], 3000).then(() => {
      done = true;
    });

    await vi.advanceTimersByTimeAsync(2999);
    expect(done).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await waiting;
    expect(done).toBe(true);
  });
});

describe("afterPaint", () => {
  test("waits for two frames", async () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
      frames.push(callback),
    );
    let done = false;
    const waiting = afterPaint().then(() => {
      done = true;
    });

    frames.shift()?.(0);
    await Promise.resolve();
    expect(done).toBe(false);
    frames.shift()?.(0);
    await waiting;
    expect(done).toBe(true);
    vi.unstubAllGlobals();
  });
});

describe("hideStartupScreen", () => {
  const screen = () => document.getElementById("startup-screen");

  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '<div id="startup-screen"></div>';
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  test("fills the bar, then lets the screen go and removes it", async () => {
    const hiding = hideStartupScreen(250, 300);
    expect(screen()?.style.getPropertyValue("--progress")).toBe("1");
    await vi.advanceTimersByTimeAsync(249);
    expect(screen()?.classList.contains("hiding")).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    expect(screen()?.classList.contains("hiding")).toBe(true);
    await vi.advanceTimersByTimeAsync(300);
    await hiding;
    expect(screen()).toBeNull();
  });

  test("does nothing when there is no startup screen", async () => {
    document.body.innerHTML = "";
    await expect(hideStartupScreen(0)).resolves.toBeUndefined();
  });
});
