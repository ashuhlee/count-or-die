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

import LoadingScreen from "../../../src/renderer/scripts/ui/overlays/loading/LoadingScreen.tsx";
import {
  hideLoadingScreen,
  showLoadingScreen,
} from "../../../src/renderer/scripts/ui/overlays/loading/loadingStore.ts";

describe("LoadingScreen", () => {
  let container: HTMLDivElement;
  let unmount: () => void;
  const mount = (component: ReactElement | ComponentType) =>
    ({ container, unmount } = renderInto(component));
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
