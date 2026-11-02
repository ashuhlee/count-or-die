import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vite-plus/test";

import { createGameClock } from "../../src/renderer/game/gameClock.ts";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("the game clock", () => {
  test("calls back after the time it was given", () => {
    const clock = createGameClock();
    const callback = vi.fn();
    clock.after(callback, 1000);

    vi.advanceTimersByTime(999);
    expect(callback).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("a cancelled timer never calls back", () => {
    const clock = createGameClock();
    const callback = vi.fn();
    clock.cancel(clock.after(callback, 1000));

    vi.advanceTimersByTime(5000);
    expect(callback).not.toHaveBeenCalled();
  });

  test("holds while paused and goes on with the time it had left", () => {
    const clock = createGameClock();
    const callback = vi.fn();
    clock.after(callback, 1000);

    vi.advanceTimersByTime(400);
    clock.pause();
    vi.advanceTimersByTime(60000);
    expect(callback).not.toHaveBeenCalled();

    clock.resume();
    vi.advanceTimersByTime(599);
    expect(callback).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("a timer made during a pause starts when it ends", () => {
    const clock = createGameClock();
    const callback = vi.fn();
    clock.pause();
    clock.after(callback, 500);

    vi.advanceTimersByTime(5000);
    expect(callback).not.toHaveBeenCalled();

    clock.resume();
    vi.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("pausing twice does not lose time", () => {
    const clock = createGameClock();
    const callback = vi.fn();
    clock.after(callback, 1000);

    vi.advanceTimersByTime(300);
    clock.pause();
    vi.advanceTimersByTime(100);
    clock.pause();
    clock.resume();
    vi.advanceTimersByTime(700);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("clearing drops everything", () => {
    const clock = createGameClock();
    const callback = vi.fn();
    clock.after(callback, 1000);
    clock.clear();

    vi.advanceTimersByTime(5000);
    expect(callback).not.toHaveBeenCalled();
  });
});
