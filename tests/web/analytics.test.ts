import { describe, expect, test } from "vitest";

import { shouldTrack } from "../../src/web/analytics.ts";

describe("shouldTrack", () => {
  test("counts visits on the sites of the game", () => {
    expect(shouldTrack("play.countordie.gg")).toBe(true);
    expect(shouldTrack("count-or-die-web-test.vercel.app")).toBe(true);
    expect(shouldTrack("localhost")).toBe(true);
  });

  test("leaves out itch.io, where Vercel does not serve the script", () => {
    expect(shouldTrack("ashuhlee.itch.io")).toBe(false);
    expect(shouldTrack("html-classic.itch.zone")).toBe(false);
    expect(shouldTrack("itch.io")).toBe(false);
  });

  test("does not mistake a site that only looks like itch.io", () => {
    expect(shouldTrack("notitch.io")).toBe(true);
    expect(shouldTrack("itch.io.example.com")).toBe(true);
  });
});
