import { describe, expect, test } from "vitest";

import { viewportScale } from "../../src/web/scale.ts";

describe("viewportScale", () => {
  test("leaves a window of the design size, or bigger, as it is", () => {
    expect(viewportScale(1440, 825)).toBe(1);
    expect(viewportScale(1920, 1100)).toBe(1);
    expect(viewportScale(3840, 2160)).toBe(1);
  });

  test("does not scale a laptop in fullscreen", () => {
    expect(viewportScale(1440, 900)).toBe(1);
    expect(viewportScale(1512, 982)).toBe(1);
    expect(viewportScale(1728, 1117)).toBe(1);
  });

  test("scales a smaller window down, to look as in the design size", () => {
    expect(viewportScale(720, 412.5)).toBe(0.5);
    expect(viewportScale(1080, 618.75)).toBe(0.75);
    expect(viewportScale(960, 550)).toBeCloseTo(0.667, 3);
  });

  test("goes by the side that is the tightest", () => {
    // wide, but not tall: the height decides
    expect(viewportScale(1920, 618.75)).toBe(0.75);
    // tall, but not wide: the width decides
    expect(viewportScale(1080, 1100)).toBe(0.75);
  });

  test("does not go below half", () => {
    expect(viewportScale(800, 300)).toBe(0.5);
    expect(viewportScale(700, 700)).toBe(0.5);
  });

  test("keeps the layout of a phone", () => {
    expect(viewportScale(424, 731)).toBe(1);
    expect(viewportScale(699, 400)).toBe(1);
  });
});
