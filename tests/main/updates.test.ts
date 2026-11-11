import { describe, expect, test } from "vite-plus/test";

import { canAutoUpdate } from "../../src/main/updates.ts";

describe("canAutoUpdate", () => {
  test("updates the packaged Windows and mac apps", () => {
    expect(canAutoUpdate("win32", true)).toBe(true);
    expect(canAutoUpdate("darwin", true)).toBe(true);
  });

  test("leaves a build that is run from the source alone", () => {
    expect(canAutoUpdate("win32", false)).toBe(false);
    expect(canAutoUpdate("darwin", false)).toBe(false);
  });

  test("leaves Linux alone", () => {
    expect(canAutoUpdate("linux", true)).toBe(false);
  });
});
