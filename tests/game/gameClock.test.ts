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

  test("at double speed, what is waiting is called in half the time", () => {
    const clock = createGameClock();
    const callback = vi.fn();
    clock.setRate(2);
    clock.after(callback, 1000);

    vi.advanceTimersByTime(499);
    expect(callback).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
