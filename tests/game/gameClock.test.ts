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

  test("a change of speed keeps what had already passed", () => {
    const clock = createGameClock();
    const callback = vi.fn();
    clock.after(callback, 1000);

    // 400 of the 1000 pass, then 600 are left, which take 300 at double speed
    vi.advanceTimersByTime(400);
    clock.setRate(2);
    vi.advanceTimersByTime(299);
    expect(callback).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("back at normal speed it takes real time again", () => {
    const clock = createGameClock();
    const callback = vi.fn();
    clock.after(callback, 1000);

    clock.setRate(2);
    // 200 real milliseconds are 400 of the clock, leaving 600
    vi.advanceTimersByTime(200);
    clock.setRate(1);
    vi.advanceTimersByTime(599);
    expect(callback).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("a pause at double speed keeps the clock's time, not the real one", () => {
    const clock = createGameClock();
    const callback = vi.fn();
    clock.setRate(2);
    clock.after(callback, 1000);

    // 100 real milliseconds are 200 of the clock
    vi.advanceTimersByTime(100);
    clock.pause();
    vi.advanceTimersByTime(5000);
    clock.resume();

    // 800 are left, which take 400
    vi.advanceTimersByTime(399);
    expect(callback).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
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
