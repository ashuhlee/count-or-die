import confetti from "canvas-confetti";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import {
  FIREWORKS,
  playConfetti,
} from "../../src/renderer/utils/effects/confetti.ts";

const fire = vi.mocked(confetti);

beforeEach(() => {
  vi.useFakeTimers();
  fire.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

// both go off at once: a burst is one call, a round of fireworks is two
const playOnce = () => {
  fire.mockClear();
  playConfetti();
  const kind = fire.mock.calls.length === 1 ? "burst" : "fireworks";
  vi.advanceTimersByTime(FIREWORKS.duration * 2);
  return kind;
};

// plays until the way that is wanted has just started
const startOf = (want: "burst" | "fireworks") => {
  for (let tries = 0; tries < 2; tries++) {
    fire.mockClear();
    playConfetti();
    const kind = fire.mock.calls.length === 1 ? "burst" : "fireworks";
    if (kind === want) return;
    vi.advanceTimersByTime(FIREWORKS.duration * 2);
  }
  throw new Error(`never started ${want}`);
};

test("the burst and the fireworks take turns", () => {
  const first = playOnce();
  const second = playOnce();

  expect(second).not.toBe(first);
  expect(playOnce()).toBe(first);
  expect(playOnce()).toBe(second);
});

test("a burst is a single one, at once", () => {
  startOf("burst");

  expect(fire).toHaveBeenCalledTimes(1);
  vi.advanceTimersByTime(FIREWORKS.duration * 2);
  expect(fire).toHaveBeenCalledTimes(1);
});

test("the fireworks start at once, from both sides, then go on in rounds that stop", () => {
  startOf("fireworks");
  // the first round, without waiting
  expect(fire).toHaveBeenCalledTimes(2);

  vi.advanceTimersByTime(FIREWORKS.every);
  expect(fire).toHaveBeenCalledTimes(4);

  vi.advanceTimersByTime(FIREWORKS.duration * 2);
  const calls = fire.mock.calls.length;
  expect(calls % 2).toBe(0);

  vi.advanceTimersByTime(FIREWORKS.duration * 2);
  expect(fire).toHaveBeenCalledTimes(calls);
});

test("both ways use the same colors and the same pieces", () => {
  startOf("burst");
  const [burst] = fire.mock.calls.map(([options]) => options);
  vi.advanceTimersByTime(FIREWORKS.duration * 2);

  startOf("fireworks");
  const [firework] = fire.mock.calls.map(([options]) => options);

  expect(firework.colors).toEqual(burst.colors);
  expect(firework.shapes).toEqual(burst.shapes);
  expect(firework.scalar).toBe(burst.scalar);
});
