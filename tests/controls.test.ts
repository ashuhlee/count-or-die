import {
  afterEach,
  beforeEach,
  expect,
  describe,
  test,
  vi,
} from "vite-plus/test";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";

import App from "../src/renderer/scripts/ui/App.tsx";
import { gameControls } from "../src/renderer/scripts/ui/input/gameControls.ts";

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
(globalThis as { __APP_VERSION__?: string }).__APP_VERSION__ = "test";

describe("game controls", () => {
  let main: HTMLDivElement;
  let root: Root;

  const handlers = {
    increase: vi.fn(),
    boost: vi.fn(),
    reset: vi.fn(),
    restart: vi.fn(),
    menu: vi.fn(),
    quit: vi.fn(),
  };

  beforeEach(() => {
    Object.values(handlers).forEach((fn) => fn.mockClear());
    main = document.createElement("div");
    document.body.appendChild(main);
    root = createRoot(main);
    act(() => root.render(createElement(App)));
  });

  afterEach(() => {
    act(() => root.unmount());
    main.remove();
    vi.restoreAllMocks();
  });

  const click = (id: string, init: MouseEventInit = {}) =>
    act(() => {
      main
        .querySelector(`#${id}`)
        .dispatchEvent(new MouseEvent("click", { bubbles: true, ...init }));
    });

  const press = (key: string, init: KeyboardEventInit = {}) =>
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key, ...init }));
    });

  // runs before the game registers anything, like a click during startup
  test("does nothing, and does not throw, before the game registers", () => {
    expect(() => {
      click("increase-img");
      press("w");
    }).not.toThrow();
  });

  describe("once registered", () => {
    beforeEach(() => gameControls.register(handlers));

    test("the increase button passes the mouse event through", () => {
      click("increase-img", { clientX: 12, clientY: 34 });

      expect(handlers.increase).toHaveBeenCalledTimes(1);
      const event = handlers.increase.mock.calls[0][0] as MouseEvent;
      expect([event.clientX, event.clientY]).toEqual([12, 34]);
    });

    test("the boost button passes the mouse event through", () => {
      click("decrease-img", { clientX: 5, clientY: 6 });

      expect(handlers.boost).toHaveBeenCalledTimes(1);
      expect((handlers.boost.mock.calls[0][0] as MouseEvent).clientX).toBe(5);
    });

    test("the reset, restart, menu and quit buttons", () => {
      click("reset-img");
      click("game-over-btn");
      click("menu-btn");
      click("quit-btn");

      expect(handlers.reset).toHaveBeenCalledTimes(1);
      expect(handlers.restart).toHaveBeenCalledTimes(1);
      expect(handlers.menu).toHaveBeenCalledTimes(1);
      expect(handlers.quit).toHaveBeenCalledTimes(1);
      expect(handlers.increase).not.toHaveBeenCalled();
    });

    test.each(["ArrowUp", "ArrowRight", "w", "W", "d", "D"])(
      "%s increases",
      (key) => {
        press(key);
        expect(handlers.increase).toHaveBeenCalledTimes(1);
        expect(handlers.increase).toHaveBeenCalledWith(undefined);
        expect(handlers.boost).not.toHaveBeenCalled();
      },
    );

    test("space boosts", () => {
      press(" ");
      expect(handlers.boost).toHaveBeenCalledTimes(1);
      expect(handlers.increase).not.toHaveBeenCalled();
    });

    test("other keys do nothing", () => {
      press("x");
      press("Enter");
      press("a");
      expect(handlers.increase).not.toHaveBeenCalled();
      expect(handlers.boost).not.toHaveBeenCalled();
    });

    test.each([["ctrlKey"], ["metaKey"], ["altKey"], ["shiftKey"]] as const)(
      "ignores keys held with %s",
      (modifier) => {
        press("w", { [modifier]: true });
        press(" ", { [modifier]: true });
        expect(handlers.increase).not.toHaveBeenCalled();
        expect(handlers.boost).not.toHaveBeenCalled();
      },
    );

    test("Escape shows the settings alert", () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
      press("Escape");
      expect(alertSpy).toHaveBeenCalledTimes(1);
      expect(handlers.increase).not.toHaveBeenCalled();
    });
  });

  test("stops listening for keys once the app unmounts", () => {
    gameControls.register(handlers);
    act(() => root.unmount());

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "w" }));
    expect(handlers.increase).not.toHaveBeenCalled();

    // so afterEach can unmount again
    root = createRoot(main);
    act(() => root.render(createElement(App)));
  });
});
