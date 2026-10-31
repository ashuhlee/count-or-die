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

  test("lets the screen go, then removes it", async () => {
    const hiding = hideStartupScreen(10_000);
    await vi.advanceTimersByTimeAsync(0);
    expect(screen()?.classList.contains("hiding")).toBe(true);

    await vi.advanceTimersByTimeAsync(600);
    await hiding;
    expect(screen()).toBeNull();
  });

  test("waits for the screen to finish growing first", async () => {
    const hiding = hideStartupScreen(100);
    await vi.advanceTimersByTimeAsync(499);
    expect(screen()?.classList.contains("hiding")).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    expect(screen()?.classList.contains("hiding")).toBe(true);
    await vi.advanceTimersByTimeAsync(600);
    await hiding;
  });

  test("does nothing when there is no startup screen", async () => {
    document.body.innerHTML = "";
    await expect(hideStartupScreen(0)).resolves.toBeUndefined();
  });
});
