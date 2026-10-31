import { describe, expect, test, vi } from "vite-plus/test";

import { lockDown } from "../../src/main/lockDown.ts";

const fakeContents = () => ({
  on: vi.fn(),
  setWindowOpenHandler: vi.fn(),
  setVisualZoomLevelLimits: vi.fn(() => Promise.resolve()),
});

describe("lockDown", () => {
  test("never lets the page open another window", () => {
    for (const isPackaged of [true, false]) {
      const contents = fakeContents();
      lockDown(contents as never, isPackaged);

      const [handler] = contents.setWindowOpenHandler.mock.calls[0] as [
        () => { action: string },
      ];
      expect(handler()).toEqual({ action: "deny" });
    }
  });

  test("stops a packaged app from navigating away", () => {
    const contents = fakeContents();
    lockDown(contents as never, true);

    const [name, listener] = contents.on.mock.calls[0] as [
      string,
      (event: { preventDefault: () => void }) => void,
    ];
    const event = { preventDefault: vi.fn() };
    listener(event);
    expect(name).toBe("will-navigate");
    expect(event.preventDefault).toHaveBeenCalled();
  });

  test("holds a packaged app at 100% zoom", () => {
    const contents = fakeContents();
    lockDown(contents as never, true);
    expect(contents.setVisualZoomLevelLimits).toHaveBeenCalledWith(1, 1);
  });

  test("leaves navigation and zoom alone while developing", () => {
    const contents = fakeContents();
    lockDown(contents as never, false);
    expect(contents.on).not.toHaveBeenCalled();
    expect(contents.setVisualZoomLevelLimits).not.toHaveBeenCalled();
  });
});
